import { config } from "../shared/config.ts";
import { Consumer } from "./consumer.ts";

const consumer = new Consumer();
await consumer.start();

const server = Bun.serve({
  port: config.server.port,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // SSE endpoint
    if (url.pathname === "/api/events" && req.method === "GET") {
      const stream = new ReadableStream({
        start(controller) {
          consumer.addSSEClient(controller);
          req.signal.addEventListener("abort", () => {
            consumer.removeSSEClient(controller);
          });
        },
        cancel(controller) {
          consumer.removeSSEClient(controller);
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Get current data
    if (url.pathname === "/api/data" && req.method === "GET") {
      return Response.json(consumer.getDashboardData(), {
        headers: corsHeaders,
      });
    }

    // Send irrigator command
    if (
      url.pathname === "/api/actuators/irrigator/command" &&
      req.method === "POST"
    ) {
      const body: unknown = await req.json();
      await consumer.sendIrrigatorCommand(body);
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log(`[API] Servidor rodando em http://localhost:${server.port}`);

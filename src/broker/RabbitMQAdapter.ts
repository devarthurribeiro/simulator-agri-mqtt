import amqplib from "amqplib";
import type { MessageBroker } from "./MessageBroker.ts";

export class RabbitMQAdapter implements MessageBroker {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private declaredExchanges = new Set<string>();
  private declaredQueues = new Set<string>();

  constructor(private url: string) {}

  async connect(): Promise<void> {
    this.connection = await amqplib.connect(this.url);
    this.channel = await this.connection.createChannel();
    console.log("[RabbitMQ] Conectado a", this.url);
  }

  async publish(exchange: string, message: unknown): Promise<void> {
    if (!this.channel) throw new Error("Canal não inicializado");
    await this.ensureExchange(exchange);
    const buffer = Buffer.from(JSON.stringify(message));
    this.channel.publish(exchange, "", buffer);
  }

  async subscribe(
    exchange: string,
    callback: (msg: unknown) => void,
  ): Promise<void> {
    if (!this.channel) throw new Error("Canal não inicializado");
    await this.ensureExchange(exchange);

    // Create an exclusive auto-delete queue bound to the exchange
    const { queue } = await this.channel.assertQueue("", {
      exclusive: true,
      autoDelete: true,
    });
    await this.channel.bindQueue(queue, exchange, "");

    this.channel.consume(queue, (msg) => {
      if (!msg) return;
      const parsed: unknown = JSON.parse(msg.content.toString());
      callback(parsed);
      this.channel!.ack(msg);
    });
  }

  async sendToQueue(queue: string, message: unknown): Promise<void> {
    if (!this.channel) throw new Error("Canal não inicializado");
    await this.ensureQueue(queue);
    const buffer = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(queue, buffer, { persistent: true });
  }

  async consumeQueue(
    queue: string,
    callback: (msg: unknown) => void,
  ): Promise<void> {
    if (!this.channel) throw new Error("Canal não inicializado");
    await this.ensureQueue(queue);

    this.channel.consume(queue, (msg) => {
      if (!msg) return;
      const parsed: unknown = JSON.parse(msg.content.toString());
      callback(parsed);
      this.channel!.ack(msg);
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    console.log("[RabbitMQ] Conexão encerrada");
  }

  private async ensureExchange(exchange: string): Promise<void> {
    if (this.declaredExchanges.has(exchange)) return;
    await this.channel!.assertExchange(exchange, "fanout", { durable: true });
    this.declaredExchanges.add(exchange);
  }

  private async ensureQueue(queue: string): Promise<void> {
    if (this.declaredQueues.has(queue)) return;
    await this.channel!.assertQueue(queue, { durable: true });
    this.declaredQueues.add(queue);
  }
}

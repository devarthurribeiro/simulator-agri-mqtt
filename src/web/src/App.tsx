import { useSSE } from "./hooks/useSSE.ts";
import { SensorCard } from "./components/SensorCard.tsx";
import { ActuatorControl } from "./components/ActuatorControl.tsx";

export function App() {
  const { data, connected, sendIrrigatorCommand } = useSSE();

  const tempHistory = data.history.filter((r) => r.type === "temperature");
  const humHistory = data.history.filter((r) => r.type === "humidity");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h1 className="text-xl font-bold">Agriculture 4.0</h1>
              <p className="text-sm text-gray-400">
                Simulador de Automação Agrícola
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400 animate-pulse"}`}
            />
            <span className="text-sm text-gray-400">
              {connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SensorCard
            title="Temperatura"
            icon="🌡️"
            reading={data.temperature}
            color="text-amber-400"
            history={tempHistory}
          />

          <SensorCard
            title="Umidade do Solo"
            icon="💦"
            reading={data.humidity}
            color="text-blue-400"
            history={humHistory}
          />

          <ActuatorControl
            status={data.irrigator}
            onCommand={sendIrrigatorCommand}
          />
        </div>

        {/* Info box */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Como funciona
          </h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              • Sensores publicam dados via <strong className="text-gray-400">RabbitMQ</strong> a cada 2s
            </li>
            <li>
              • O servidor consome as mensagens e retransmite via <strong className="text-gray-400">SSE</strong> a cada 1s
            </li>
            <li>
              • Ao irrigar, a <strong className="text-green-400">umidade sobe</strong> e a{" "}
              <strong className="text-amber-400">temperatura cai</strong> gradualmente
            </li>
            <li>
              • Após a irrigação, o efeito decai em ~10s até voltar ao normal
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

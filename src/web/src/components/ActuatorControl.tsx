import { useState } from "react";
import type { ActuatorStatus } from "../../../shared/types.ts";

interface Props {
  status: ActuatorStatus | null;
  onCommand: (action: "on" | "off", duration?: number) => void;
}

const DURATIONS = [
  { label: "3s", ms: 3000 },
  { label: "5s", ms: 5000 },
  { label: "10s", ms: 10000 },
  { label: "30s", ms: 30000 },
];

export function ActuatorControl({ status, onCommand }: Props) {
  const [selectedDuration, setSelectedDuration] = useState(5000);
  const isActive = status?.state === "active";

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">💧</span>
        <h2 className="text-lg font-semibold text-gray-200">
          Irrigador
        </h2>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-4 h-4 rounded-full ${
            isActive
              ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
              : "bg-gray-600"
          }`}
        />
        <span
          className={`text-xl font-bold ${isActive ? "text-green-400" : "text-gray-400"}`}
        >
          {isActive ? "ATIVO" : "INATIVO"}
        </span>
        {isActive && status && (
          <span className="text-sm text-gray-400 ml-auto">
            Intensidade: {(status.intensity * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Duration selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">Duração:</label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.ms}
              onClick={() => setSelectedDuration(d.ms)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedDuration === d.ms
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onCommand("on", selectedDuration)}
          disabled={isActive}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors"
        >
          Irrigar
        </button>
        <button
          onClick={() => onCommand("off")}
          disabled={!isActive}
          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors"
        >
          Parar
        </button>
      </div>
    </div>
  );
}

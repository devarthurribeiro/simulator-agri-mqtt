import type { SensorReading } from "../../../shared/types.ts";

interface Props {
  title: string;
  icon: string;
  reading: SensorReading | null;
  color: string;
  history: SensorReading[];
}

export function SensorCard({ title, icon, reading, color, history }: Props) {
  const filteredHistory = history.slice(-20);
  const values = filteredHistory.map((r) => r.value);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 100;
  const range = max - min || 1;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
      </div>

      <div className="text-center mb-6">
        <span className={`text-5xl font-bold ${color}`}>
          {reading ? reading.value.toFixed(1) : "--"}
        </span>
        <span className="text-2xl text-gray-400 ml-1">
          {reading?.unit ?? ""}
        </span>
      </div>

      {/* Mini sparkline chart */}
      <div className="h-16 flex items-end gap-[2px]">
        {filteredHistory.map((r, i) => {
          const height = ((r.value - min) / range) * 100;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t ${color.includes("blue") ? "bg-blue-500/60" : "bg-amber-500/60"}`}
              style={{ height: `${Math.max(4, height)}%` }}
              title={`${r.value.toFixed(1)}${r.unit}`}
            />
          );
        })}
        {filteredHistory.length === 0 && (
          <div className="flex-1 text-center text-gray-500 text-sm self-center">
            Aguardando dados...
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>
          Min: {values.length > 0 ? min.toFixed(1) : "--"}
        </span>
        <span>
          Max: {values.length > 0 ? max.toFixed(1) : "--"}
        </span>
      </div>
    </div>
  );
}

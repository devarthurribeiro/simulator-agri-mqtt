export interface SensorReading {
  sensorId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface ActuatorCommand {
  action: "on" | "off";
  duration?: number; // ms
}

export interface ActuatorStatus {
  actuatorId: string;
  type: string;
  state: "active" | "inactive";
  intensity: number; // 0-1
  timestamp: number;
}

export interface SensorConfig {
  id: string;
  type: string;
  unit: string;
  publishIntervalMs: number;
  baseMin: number;
  baseMax: number;
  noise: number;
}

export interface IrrigatorEffect {
  active: boolean;
  intensity: number; // 0-1, decays over time
  startTime: number;
  endTime: number;
}

export interface EnvironmentState {
  baseTemperature: number;
  baseHumidity: number;
  irrigatorEffect: IrrigatorEffect;
}

export interface DashboardData {
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  irrigator: ActuatorStatus | null;
  history: SensorReading[];
}

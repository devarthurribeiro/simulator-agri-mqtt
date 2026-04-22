import { config } from "../shared/config.ts";
import { RabbitMQAdapter } from "../broker/RabbitMQAdapter.ts";
import type {
  SensorReading,
  ActuatorStatus,
  DashboardData,
} from "../shared/types.ts";

const MAX_HISTORY = 100;

export class Consumer {
  private broker: RabbitMQAdapter;
  private latestTemperature: SensorReading | null = null;
  private latestHumidity: SensorReading | null = null;
  private latestIrrigator: ActuatorStatus | null = null;
  private history: SensorReading[] = [];
  private sseClients = new Set<ReadableStreamDefaultController>();

  constructor() {
    this.broker = new RabbitMQAdapter(config.rabbitmq.url);
  }

  async start(): Promise<void> {
    await this.broker.connect();

    // Subscribe to sensor exchanges
    await this.broker.subscribe(
      config.rabbitmq.exchanges.sensorTemperature,
      (msg) => {
        this.latestTemperature = msg as SensorReading;
        this.addToHistory(this.latestTemperature);
      },
    );

    await this.broker.subscribe(
      config.rabbitmq.exchanges.sensorHumidity,
      (msg) => {
        this.latestHumidity = msg as SensorReading;
        this.addToHistory(this.latestHumidity);
      },
    );

    // Subscribe to actuator status
    await this.broker.subscribe(
      config.rabbitmq.exchanges.actuatorIrrigatorStatus,
      (msg) => {
        this.latestIrrigator = msg as ActuatorStatus;
      },
    );

    // Start SSE broadcast
    setInterval(() => {
      this.broadcast();
    }, config.sse.broadcastIntervalMs);

    console.log("[Consumer] Escutando mensagens e transmitindo via SSE");
  }

  getDashboardData(): DashboardData {
    return {
      temperature: this.latestTemperature,
      humidity: this.latestHumidity,
      irrigator: this.latestIrrigator,
      history: [...this.history],
    };
  }

  addSSEClient(controller: ReadableStreamDefaultController): void {
    this.sseClients.add(controller);
    // Send current state immediately
    const data = JSON.stringify(this.getDashboardData());
    controller.enqueue(`data: ${data}\n\n`);
  }

  removeSSEClient(controller: ReadableStreamDefaultController): void {
    this.sseClients.delete(controller);
  }

  async sendIrrigatorCommand(command: unknown): Promise<void> {
    await this.broker.sendToQueue(
      config.rabbitmq.queues.actuatorIrrigatorCommand,
      command,
    );
  }

  private addToHistory(reading: SensorReading): void {
    this.history.push(reading);
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
  }

  private broadcast(): void {
    if (this.sseClients.size === 0) return;
    const data = JSON.stringify(this.getDashboardData());
    const message = `data: ${data}\n\n`;

    for (const controller of this.sseClients) {
      try {
        controller.enqueue(message);
      } catch {
        this.sseClients.delete(controller);
      }
    }
  }
}

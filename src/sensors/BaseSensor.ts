import type { MessageBroker } from "../broker/MessageBroker.ts";
import type { SensorEnvironment } from "../core/SensorEnvironment.ts";
import type { SensorConfig, SensorReading } from "../shared/types.ts";

export abstract class BaseSensor {
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(
    protected config: SensorConfig,
    protected broker: MessageBroker,
    protected exchange: string,
    protected environment: SensorEnvironment,
  ) {}

  abstract readValue(): number;

  start(): void {
    console.log(
      `[Sensor:${this.config.id}] Iniciado — publicando a cada ${this.config.publishIntervalMs}ms`,
    );

    // Publish immediately, then on interval
    this.publishReading();
    this.interval = setInterval(() => {
      this.environment.tick();
      this.publishReading();
    }, this.config.publishIntervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log(`[Sensor:${this.config.id}] Parado`);
  }

  private publishReading(): void {
    const reading: SensorReading = {
      sensorId: this.config.id,
      type: this.config.type,
      value: this.readValue(),
      unit: this.config.unit,
      timestamp: Date.now(),
    };

    this.broker.publish(this.exchange, reading).catch((err) => {
      console.error(`[Sensor:${this.config.id}] Erro ao publicar:`, err);
    });

    console.log(
      `[Sensor:${this.config.id}] ${reading.value}${reading.unit}`,
    );
  }
}

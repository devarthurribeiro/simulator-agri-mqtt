import { BaseActuator } from "./BaseActuator.ts";
import type { SensorEnvironment } from "../core/SensorEnvironment.ts";
import type { ActuatorCommand } from "../shared/types.ts";
import { config } from "../shared/config.ts";

export class IrrigatorActuator extends BaseActuator {
  private shutoffTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    broker: ConstructorParameters<typeof BaseActuator>[2],
    private environment: SensorEnvironment,
  ) {
    const cfg = config.actuators.irrigator;
    super(
      cfg.id,
      cfg.type,
      broker,
      config.rabbitmq.queues.actuatorIrrigatorCommand,
      config.rabbitmq.exchanges.actuatorIrrigatorStatus,
    );
  }

  override handleCommand(command: ActuatorCommand): void {
    if (command.action === "on") {
      const duration = command.duration ?? 5000;
      this.activate(duration);
    } else {
      this.deactivate();
    }
  }

  private activate(durationMs: number): void {
    // Clear any existing shutoff timer
    if (this.shutoffTimer) clearTimeout(this.shutoffTimer);

    this.state = "active";
    this.intensity = 1.0;
    this.environment.activateIrrigator(durationMs);

    console.log(
      `[Irrigator] 💧 ATIVADO por ${durationMs}ms`,
    );
    this.publishStatus();

    // Auto shutoff
    this.shutoffTimer = setTimeout(() => {
      this.state = "inactive";
      this.intensity = 0;
      console.log("[Irrigator] Desativado (auto-shutoff)");
      this.publishStatus();
    }, durationMs);
  }

  private deactivate(): void {
    if (this.shutoffTimer) {
      clearTimeout(this.shutoffTimer);
      this.shutoffTimer = null;
    }
    this.state = "inactive";
    this.intensity = 0;
    this.environment.deactivateIrrigator();
    console.log("[Irrigator] Desativado (manual)");
    this.publishStatus();
  }
}

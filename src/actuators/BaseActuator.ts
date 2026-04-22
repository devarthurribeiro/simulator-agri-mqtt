import type { MessageBroker } from "../broker/MessageBroker.ts";
import type { ActuatorCommand, ActuatorStatus } from "../shared/types.ts";

export abstract class BaseActuator {
  protected state: "active" | "inactive" = "inactive";
  protected intensity = 0;

  constructor(
    protected id: string,
    protected type: string,
    protected broker: MessageBroker,
    protected commandQueue: string,
    protected statusExchange: string,
  ) {}

  abstract handleCommand(command: ActuatorCommand): void;

  async start(): Promise<void> {
    console.log(`[Actuator:${this.id}] Escutando comandos em ${this.commandQueue}`);
    await this.broker.consumeQueue(this.commandQueue, (msg) => {
      const command = msg as ActuatorCommand;
      console.log(`[Actuator:${this.id}] Comando recebido:`, command);
      this.handleCommand(command);
    });
  }

  protected async publishStatus(): Promise<void> {
    const status: ActuatorStatus = {
      actuatorId: this.id,
      type: this.type,
      state: this.state,
      intensity: this.intensity,
      timestamp: Date.now(),
    };
    await this.broker.publish(this.statusExchange, status);
    console.log(`[Actuator:${this.id}] Status: ${this.state} (${this.intensity})`);
  }
}

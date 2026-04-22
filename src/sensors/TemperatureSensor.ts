import { BaseSensor } from "./BaseSensor.ts";

export class TemperatureSensor extends BaseSensor {
  override readValue(): number {
    return this.environment.getTemperature();
  }
}

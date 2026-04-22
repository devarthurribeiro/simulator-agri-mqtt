import { BaseSensor } from "./BaseSensor.ts";

export class HumiditySensor extends BaseSensor {
  override readValue(): number {
    return this.environment.getHumidity();
  }
}

import { config } from "../shared/config.ts";
import type { EnvironmentState, IrrigatorEffect } from "../shared/types.ts";

export class SensorEnvironment {
  private state: EnvironmentState;

  constructor() {
    const tempCfg = config.sensors.temperature;
    const humCfg = config.sensors.humidity;

    this.state = {
      baseTemperature: this.randomBetween(tempCfg.baseMin, tempCfg.baseMax),
      baseHumidity: this.randomBetween(humCfg.baseMin, humCfg.baseMax),
      irrigatorEffect: {
        active: false,
        intensity: 0,
        startTime: 0,
        endTime: 0,
      },
    };
  }

  getTemperature(): number {
    const effect = this.getIrrigatorEffect();
    const base = this.state.baseTemperature;
    const decrease = effect.intensity * config.actuators.irrigator.tempDecrease;
    const noise = this.gaussianNoise(config.sensors.temperature.noise);
    return Math.round((base - decrease + noise) * 100) / 100;
  }

  getHumidity(): number {
    const effect = this.getIrrigatorEffect();
    const base = this.state.baseHumidity;
    const increase = effect.intensity * config.actuators.irrigator.humidityIncrease;
    const noise = this.gaussianNoise(config.sensors.humidity.noise);
    const value = base + increase + noise;
    return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
  }

  activateIrrigator(durationMs: number): void {
    const now = Date.now();
    this.state.irrigatorEffect = {
      active: true,
      intensity: 1.0,
      startTime: now,
      endTime: now + durationMs,
    };
  }

  deactivateIrrigator(): void {
    this.state.irrigatorEffect = {
      active: false,
      intensity: 0,
      startTime: 0,
      endTime: 0,
    };
  }

  getIrrigatorEffect(): IrrigatorEffect {
    const effect = this.state.irrigatorEffect;
    if (!effect.active) return effect;

    const now = Date.now();
    if (now >= effect.endTime) {
      // Effect duration ended, start decay
      const decayTime = config.actuators.irrigator.effectDecayTimeMs;
      const elapsed = now - effect.endTime;
      if (elapsed >= decayTime) {
        this.deactivateIrrigator();
        return this.state.irrigatorEffect;
      }
      // Linear decay from 1 → 0
      const intensity = 1 - elapsed / decayTime;
      return { ...effect, intensity };
    }

    // Still within active duration — full intensity
    return { ...effect, intensity: 1.0 };
  }

  /** Slowly drift base values to simulate natural environment changes */
  tick(): void {
    const tempCfg = config.sensors.temperature;
    const humCfg = config.sensors.humidity;

    this.state.baseTemperature += this.gaussianNoise(0.1);
    this.state.baseTemperature = Math.min(
      tempCfg.baseMax,
      Math.max(tempCfg.baseMin, this.state.baseTemperature),
    );

    this.state.baseHumidity += this.gaussianNoise(0.2);
    this.state.baseHumidity = Math.min(
      humCfg.baseMax,
      Math.max(humCfg.baseMin, this.state.baseHumidity),
    );
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private gaussianNoise(stddev: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stddev;
  }
}

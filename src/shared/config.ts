export const config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5673",
    exchanges: {
      sensorTemperature: "agriculture.sensors.temperature",
      sensorHumidity: "agriculture.sensors.humidity",
      actuatorIrrigatorStatus: "agriculture.actuators.irrigator.status",
    },
    queues: {
      actuatorIrrigatorCommand: "agriculture.actuators.irrigator.command",
    },
  },

  sensors: {
    temperature: {
      id: "temp-sensor-01",
      type: "temperature",
      unit: "°C",
      publishIntervalMs: 2000,
      baseMin: 18,
      baseMax: 35,
      noise: 0.5,
    },
    humidity: {
      id: "humidity-sensor-01",
      type: "humidity",
      unit: "%",
      publishIntervalMs: 2000,
      baseMin: 40,
      baseMax: 90,
      noise: 1.0,
    },
  },

  actuators: {
    irrigator: {
      id: "irrigator-01",
      type: "irrigator",
      tempDecrease: 5,
      humidityIncrease: 30,
      effectDecayTimeMs: 10_000,
    },
  },

  sse: {
    broadcastIntervalMs: 1000,
  },

  server: {
    port: Number(process.env.API_PORT ?? 3000),
  },
} as const;

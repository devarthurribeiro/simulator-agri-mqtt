import { config } from "../shared/config.ts";
import { RabbitMQAdapter } from "../broker/RabbitMQAdapter.ts";
import { SensorEnvironment } from "../core/SensorEnvironment.ts";
import { TemperatureSensor } from "../sensors/TemperatureSensor.ts";
import { HumiditySensor } from "../sensors/HumiditySensor.ts";
import { IrrigatorActuator } from "../actuators/IrrigatorActuator.ts";

const broker = new RabbitMQAdapter(config.rabbitmq.url);
await broker.connect();

const environment = new SensorEnvironment();

// Create sensors
const tempSensor = new TemperatureSensor(
  config.sensors.temperature,
  broker,
  config.rabbitmq.exchanges.sensorTemperature,
  environment,
);

const humiditySensor = new HumiditySensor(
  config.sensors.humidity,
  broker,
  config.rabbitmq.exchanges.sensorHumidity,
  environment,
);

// Create actuator
const irrigator = new IrrigatorActuator(broker, environment);

// Start all
tempSensor.start();
humiditySensor.start();
await irrigator.start();

console.log("[Devices] Todos os dispositivos iniciados");

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[Devices] Encerrando...");
  tempSensor.stop();
  humiditySensor.stop();
  await broker.close();
  process.exit(0);
});

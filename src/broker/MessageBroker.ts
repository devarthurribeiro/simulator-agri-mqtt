export interface MessageBroker {
  connect(): Promise<void>;
  publish(exchange: string, message: unknown): Promise<void>;
  subscribe(
    exchange: string,
    callback: (msg: unknown) => void,
  ): Promise<void>;
  sendToQueue(queue: string, message: unknown): Promise<void>;
  consumeQueue(
    queue: string,
    callback: (msg: unknown) => void,
  ): Promise<void>;
  close(): Promise<void>;
}

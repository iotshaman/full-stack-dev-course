export class RouteError extends Error {
  statusCode: number;
  sendMessge: boolean;
  constructor(message: string, statusCode: number, sendMessage: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.sendMessge = sendMessage;
  }
}
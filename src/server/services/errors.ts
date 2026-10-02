export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(code: string, userMessage: string, statusCode: number = 400) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

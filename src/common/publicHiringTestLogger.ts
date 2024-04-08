import { Logger } from "@nestjs/common";

export class PublicHiringTestLogger extends Logger {
  public static log(message: any, ...optionalParams: [...any, string?]) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    Logger.log(message, ...optionalParams);
  }

  public static error(
    message: any,
    ...optionalParams: [...any, string?, string?]
  ) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    Logger.error(message, ...optionalParams);
  }
}

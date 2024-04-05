import { NestFactory } from "@nestjs/core";
import { dataSource } from "../config/dataSource";
import { AppModule } from "./app.module";
import { PublicHiringTestLogger } from "./common/publicHiringTestLogger";

async function bootstrap() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });
  await app.listen(3000);
}
PublicHiringTestLogger.log(
  `Server running on http://localhost:3000`,
  "Bootstrap"
);
bootstrap();

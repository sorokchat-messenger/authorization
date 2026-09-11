import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/index.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getConfigOptions, type AllConfigs } from "./infrastructure/index.js";
import {
  createAuthorizationService,
  createServer,
} from "@sorokchat-messenger/microservices";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(getConfigOptions()),
  );
  let url: string;
  try {
    const config = context.get(ConfigService<AllConfigs>);
    const host = config.getOrThrow("grpc.host", { infer: true });
    const port = config.getOrThrow("grpc.port", { infer: true });
    url = `${host}:${port}`;
  } finally {
    await context.close();
  }
  const service = createAuthorizationService(url);
  const application = await createServer(AppModule, service);
  const logger = new Logger(service.name);
  logger.log(`Starting gRPC on ${url}`);
  await application.listen();
  logger.log(`gRPC server started on ${url}`);
}
bootstrap().catch((error) => {
  console.error("Failed to start gRPC service:", error);
  process.exit(1);
});

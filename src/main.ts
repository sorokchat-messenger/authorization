import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/index.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getConfigOptions, type AllConfigs } from "./infrastructure/index.js";
import {
  createAuthorizationService,
  createServer,
} from "@sorokchat-messenger/microservices";

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(getConfigOptions()),
  );
  const config = context.get(ConfigService<AllConfigs>);
  const host: string = config.getOrThrow("grpc.host", { infer: true });
  const port: number = config.getOrThrow("grpc.port", { infer: true });
  const url: string = `${host}:${port}`;
  await context.close();
  const application = await createServer(
    AppModule,
    createAuthorizationService(url),
  );
  await application.listen();
}
await bootstrap();

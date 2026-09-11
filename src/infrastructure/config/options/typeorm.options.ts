import { ConfigService } from "@nestjs/config";
import { type AllConfigs } from "../types/index.js";
import { type TypeOrmModuleOptions } from "@nestjs/typeorm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const extension = import.meta.url.endsWith(".ts") ? "ts" : "js";

export function getTypeOrmConfig(
  configService: ConfigService<AllConfigs>,
): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: configService.getOrThrow("database.host", { infer: true }),
    port: configService.getOrThrow("database.port", { infer: true }),
    username: configService.getOrThrow("database.user", { infer: true }),
    password: configService.getOrThrow("database.password", { infer: true }),
    database: configService.getOrThrow("database.name", { infer: true }),
    synchronize: configService.getOrThrow("database.synchronize", {
      infer: true,
    }),
    ssl: configService.getOrThrow("database.ssl", { infer: true }),
    entities: [join(directory, `../**/*.entity.${extension}`)],
  };
}

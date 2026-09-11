import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTypeOrmConfig } from "../config/index.js";

export const DatabaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: getTypeOrmConfig,
});

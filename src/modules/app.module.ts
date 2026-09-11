import { Module } from "@nestjs/common";
import { AuthorizationModule } from "./authorization/authorization.module.js";
import { ConfigModule } from "@nestjs/config";
import { getConfigOptions } from "../infrastructure/index.js";

@Module({
  imports: [AuthorizationModule, ConfigModule.forRoot(getConfigOptions())],
})
export class AppModule {}

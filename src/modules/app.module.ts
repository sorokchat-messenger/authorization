import { Module } from "@nestjs/common";
import { AuthorizationModule } from "./authorization/authorization.module.js";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule, getConfigOptions } from "../infrastructure/index.js";

@Module({
  imports: [
    ConfigModule.forRoot(getConfigOptions()),
    DatabaseModule,
    AuthorizationModule,
  ],
})
export class AppModule {}

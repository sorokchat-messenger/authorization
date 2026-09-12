import { Module } from "@nestjs/common";
import { AuthorizationModule } from "./authorization/authorization.module.js";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule, getConfigOptions } from "../infrastructure/index.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot(getConfigOptions()),
    DatabaseModule,
    AuthorizationModule,
    UsersModule,
  ],
})
export class AppModule {}

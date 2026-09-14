import { Module } from "@nestjs/common";
import { AuthorizationModule } from "./authorization/authorization.module.js";
import { ConfigModule } from "@nestjs/config";
import {
  CryptographyModule,
  DatabaseModule,
  getConfigOptions,
} from "../infrastructure/index.js";
import { TokensModule } from "./tokens/tokens.module.js";

@Module({
  imports: [
    ConfigModule.forRoot(getConfigOptions()),
    CryptographyModule,
    DatabaseModule,
    AuthorizationModule,
  ],
})
export class AppModule {}

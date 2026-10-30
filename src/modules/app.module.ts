import { Module } from "@nestjs/common";
import { AuthorizationModule } from "./authorization/authorization.module.js";
import { ConfigModule } from "@nestjs/config";
import {
  CryptographyModule,
  getConfigOptions,
  MicroservicesModule
} from "../infrastructure/index.js";
import { APP_FILTER } from "@nestjs/core";
import { GrpcPassthroughFilter } from "./grpc-passthrough.filter.js";

@Module({
  imports: [
    ConfigModule.forRoot(getConfigOptions()),
    CryptographyModule,
    AuthorizationModule,
    MicroservicesModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GrpcPassthroughFilter
    }
  ]
})
export class AppModule { }

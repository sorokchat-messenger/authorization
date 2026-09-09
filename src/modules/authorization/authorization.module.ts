import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service.js";
import { AuthorizationRpc } from "./authorization.rpc.js";

@Module({
  providers: [AuthorizationService],
  controllers: [AuthorizationRpc],
})
export class AuthorizationModule {}

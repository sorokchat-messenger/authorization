import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service.js";
import { AuthorizationGrpc } from "./authorization.grpc.js";
import { UsersModule } from "../users/users.module.js";

@Module({
  imports: [UsersModule],
  providers: [AuthorizationService],
  controllers: [AuthorizationGrpc],
})
export class AuthorizationModule {}

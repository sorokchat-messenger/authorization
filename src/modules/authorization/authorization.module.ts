import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service.js";
import { AuthorizationGrpc } from "./authorization.grpc.js";
import { UsersModule } from "../users/users.module.js";
import { TOKENS_OPTIONS_PROVIDER } from "../tokens/tokens.options.provider.js";
import { TokensModule } from "../tokens/tokens.module.js";

@Module({
  imports: [UsersModule, TokensModule],
  providers: [AuthorizationService, TOKENS_OPTIONS_PROVIDER],
  controllers: [AuthorizationGrpc],
})
export class AuthorizationModule {}

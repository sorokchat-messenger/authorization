import { Module } from "@nestjs/common";
import { TokensService } from "./tokens.service.js";
import { TOKENS_OPTIONS_PROVIDER } from "./tokens.options.provider.js";

@Module({
  providers: [TokensService, TOKENS_OPTIONS_PROVIDER],
  exports: [TokensService],
})
export class TokensModule {}

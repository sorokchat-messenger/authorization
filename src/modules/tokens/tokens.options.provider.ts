import { type Provider } from "@nestjs/common";
import {
  type AllConfigs,
  type TokensConfig,
} from "../../infrastructure/index.js";
import { ConfigService } from "@nestjs/config";

export const TOKENS_OPTIONS_TOKEN: string = "TOKENS_OPTIONS";

export const TOKENS_OPTIONS_PROVIDER: Provider<TokensConfig> = {
  provide: TOKENS_OPTIONS_TOKEN,
  inject: [ConfigService],
  useFactory(configService: ConfigService<AllConfigs>) {
    return {
      access: {
        secret: configService.getOrThrow("tokens.access.secret", {
          infer: true,
        }),
        duration: configService.getOrThrow("tokens.access.duration", {
          infer: true,
        }),
      },
      refresh: {
        secret: configService.getOrThrow("tokens.refresh.secret", {
          infer: true,
        }),
        duration: configService.getOrThrow("tokens.refresh.duration", {
          infer: true,
        }),
      },
    };
  },
};

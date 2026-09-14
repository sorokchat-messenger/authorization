import { Provider } from "@nestjs/common";
import { TokensConfig } from "../../src/infrastructure/index.js";
import { TOKENS_OPTIONS_TOKEN } from "../../src/modules/tokens/tokens.options.provider.js";

export const MOCK_TOKENS_OPTIONS_PROVIDER: Provider<TokensConfig> = {
  provide: TOKENS_OPTIONS_TOKEN,
  useValue: {
    access: {
      secret: "access secret",
      duration: 1000,
    },
    refresh: {
      secret: "refresh secret",
      duration: 1000,
    },
  },
};

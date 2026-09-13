import { type Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type AllConfigs } from "../config/index.js";

export const PASSWORD_SECRET_TOKEN: string = "PASSWORD_SECRET";

export const PASSWORD_SECRET_PROVIDER: Provider<string> = {
  provide: PASSWORD_SECRET_TOKEN,
  inject: [ConfigService],
  useFactory(configService: ConfigService<AllConfigs>) {
    return configService.getOrThrow("cryptography.passwordSecret", {
      infer: true,
    });
  },
};

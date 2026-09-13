import { Provider } from "@nestjs/common";
import { PASSWORD_SECRET_TOKEN } from "../../src/infrastructure/index.js";

export const MOCK_PASSWORD_SECRET_PROVIDER: Provider<string> = {
  provide: PASSWORD_SECRET_TOKEN,
  useValue: "password secret",
};

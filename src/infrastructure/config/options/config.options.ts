import { ConfigModuleOptions } from "@nestjs/config";
import { loadEnv } from "../env/index.js";

export function getConfigOptions(): ConfigModuleOptions {
  return {
    isGlobal: true,
    load: loadEnv,
  };
}

import {
  type GrpcConnectionConfig,
  type BasicConfig,
} from "@sorokchat-messenger/config";
import { CryptographyConfig, DatabaseConfig } from "../schemas/index.js";

export type AllConfigs = {
  basic: BasicConfig;
  grpc: GrpcConnectionConfig;
  database: DatabaseConfig;
  cryptography: CryptographyConfig;
};

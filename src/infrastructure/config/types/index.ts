import {
  type GrpcConnectionConfig,
  type BasicConfig,
} from "@sorokchat-messenger/config";
import type {
  CryptographyConfig,
  DatabaseConfig,
  TokensConfig,
} from "../schemas/index.js";

export type AllConfigs = {
  basic: BasicConfig;
  grpc: GrpcConnectionConfig;
  database: DatabaseConfig;
  cryptography: CryptographyConfig;
  tokens: TokensConfig;
};

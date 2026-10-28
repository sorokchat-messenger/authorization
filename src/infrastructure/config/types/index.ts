import {
  type GrpcConnectionConfig,
  type BasicConfig,
} from "@sorokchat-messenger/config";
import type {
  TokensConfig,
  UsersConfig,
} from "../schemas/index.js";

export type AllConfigs = {
  basic: BasicConfig;
  grpc: GrpcConnectionConfig;
  users: UsersConfig
  tokens: TokensConfig;
};

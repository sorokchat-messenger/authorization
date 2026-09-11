import {
  type GrpcConnectionConfig,
  type BasicConfig,
} from "@sorokchat-messenger/config";

export type AllConfigs = {
  basic: BasicConfig;
  grpc: GrpcConnectionConfig;
};

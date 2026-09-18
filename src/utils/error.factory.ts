import { RpcException } from "@nestjs/microservices";
import { GrpcStatus } from "@sorokchat-messenger/microservices";

export function createError(status: GrpcStatus, message: string): RpcException {
  return new RpcException({
    code: status,
    details: message,
  });
}

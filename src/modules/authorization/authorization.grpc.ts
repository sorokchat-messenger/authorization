import { GrpcMethod, GrpcService, Payload } from "@nestjs/microservices";
import {
  AUTHORIZATION_SERVICE,
  type RegisterResponse,
  type RegisterRequest,
  type LoginRequest,
  type LoginResponse,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  type ProfileRequest,
  type ProfileResponse,
} from "@sorokchat-messenger/microservices";
import { AuthorizationService } from "./authorization.service.js";

@GrpcService(AUTHORIZATION_SERVICE.NAME)
export class AuthorizationGrpc {
  public constructor(private readonly service: AuthorizationService) {}

  @GrpcMethod(AUTHORIZATION_SERVICE.NAME, AUTHORIZATION_SERVICE.REGISTER)
  public async register(
    @Payload() payload: RegisterRequest,
  ): Promise<RegisterResponse> {
    return await this.service.register(payload);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE.NAME, AUTHORIZATION_SERVICE.LOGIN)
  public async login(@Payload() payload: LoginRequest): Promise<LoginResponse> {
    return await this.service.login(payload);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE.NAME, AUTHORIZATION_SERVICE.REFRESH_TOKENS)
  public async refreshTokens(
    @Payload() payload: RefreshTokensRequest,
  ): Promise<RefreshTokensResponse> {
    return await this.service.refreshTokens(payload);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE.NAME, AUTHORIZATION_SERVICE.PROFILE)
  public async profile(
    @Payload() payload: ProfileRequest,
  ): Promise<ProfileResponse> {
    return await this.service.profile(payload);
  }
}

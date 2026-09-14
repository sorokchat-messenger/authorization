import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  GrpcStatus,
  type ProfileRequest,
  type ProfileResponse,
  type RefreshTokensRequest,
  type RefreshTokensResponse,
  type Role,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
} from "@sorokchat-messenger/microservices";
import { UsersService } from "../users/users.service.js";
import { UserModel } from "../users/user.model.js";
import { GrpcException } from "@nestjs/microservices";
import { AuthorizationCodes, UserCodes } from "@sorokchat-messenger/contracts";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
  type TokensConfig,
} from "../../infrastructure/index.js";
import { type ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { TokensService } from "../tokens/tokens.service.js";
import { TOKENS_OPTIONS_TOKEN } from "../tokens/tokens.options.provider.js";
import { TokenModel } from "../tokens/token.model.js";

@Injectable()
export class AuthorizationService {
  private static readonly EXCEPTION = new GrpcException(
    AuthorizationCodes.BAD_CREDENTIALS,
    GrpcStatus.INVALID_ARGUMENT,
  );

  private readonly logger: Logger = new Logger(AuthorizationService.name);

  public constructor(
    private readonly usersService: UsersService,
    @Inject(SIGNING_TOKEN) private readonly signingService: ISigning,
    @Inject(PASSWORD_SECRET_TOKEN) private readonly secret: string,
    @Inject(TOKENS_OPTIONS_TOKEN) private readonly tokensOptions: TokensConfig,
    private readonly tokensService: TokensService,
  ) {}

  public async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const user = await this.usersService.create(payload);
    return await this.authorize(user);
  }

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const candidate = await this.usersService.getByLogin(payload.login);
      const isPasswordValid = await candidate.verifyPassword(
        this.signingService,
        this.secret,
        payload.password,
      );
      if (!isPasswordValid) throw AuthorizationService.EXCEPTION;
      return await this.authorize(candidate);
    } catch (error) {
      throw this.validateError(error);
    }
  }

  public async refreshTokens({
    refreshToken,
  }: RefreshTokensRequest): Promise<RefreshTokensResponse> {
    try {
      const token = TokenModel.parse(
        refreshToken,
        this.tokensOptions.refresh.secret,
      );
      const user = await this.usersService.getByLogin(token.subject);
      return await this.authorize(user);
    } catch (error) {
      throw this.validateError(error);
    }
  }

  public async profile({
    accessToken,
  }: ProfileRequest): Promise<ProfileResponse> {
    try {
      const token = TokenModel.parse(
        accessToken,
        this.tokensOptions.access.secret,
      );
      const user = await this.usersService.getByLogin(token.subject);
      return {
        login: user.login,
        password: user.hashedPassword,
        role: user.role as Role,
        displayName: user.displayName,
      };
    } catch (error) {
      throw this.validateError(error);
    }
  }

  private async authorize(
    user: UserModel,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    return await this.tokensService.generateTokens(user);
  }

  private validateError(error: unknown): GrpcException | unknown {
    if (
      error instanceof GrpcException &&
      error.getCode() === GrpcStatus.NOT_FOUND &&
      error.message === UserCodes.NOT_FOUND
    ) {
      return AuthorizationService.EXCEPTION;
    }
    this.logger.error(`Authorization user error`, error);
    return error;
  }
}

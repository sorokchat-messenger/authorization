import { Inject, Injectable } from "@nestjs/common";
import { TOKENS_OPTIONS_TOKEN } from "./tokens.options.provider.js";
import { type TokensConfig } from "../../infrastructure/index.js";
import { TokenModel } from "./token.model.js";
import type {
  GetUserResponse,
  LoginResponse,
  RefreshTokensResponse,
  RegisterResponse,
} from "@sorokchat-messenger/microservices";

@Injectable()
export class TokensService {
  public constructor(
    @Inject(TOKENS_OPTIONS_TOKEN) private readonly tokensOptions: TokensConfig,
  ) { }

  public async generateTokens(
    user: GetUserResponse,
  ): Promise<RegisterResponse | LoginResponse | RefreshTokensResponse> {
    const refreshToken = this.generateRefreshToken(user);
    const acccessToken = this.generateAccessToken(user);
    return {
      accessToken: acccessToken.serialize(this.tokensOptions.access.secret),
      refreshToken: refreshToken.serialize(this.tokensOptions.refresh.secret),
    };
  }

  private generateRefreshToken(user: GetUserResponse): TokenModel {
    return this.generateToken(user, this.tokensOptions.refresh.duration);
  }

  private generateAccessToken(user: GetUserResponse): TokenModel {
    return this.generateToken(user, this.tokensOptions.access.duration);
  }

  private generateToken(user: GetUserResponse, duration: number): TokenModel {
    const now = Date.now();
    return TokenModel.of(user.id, now, now + duration);
  }
}

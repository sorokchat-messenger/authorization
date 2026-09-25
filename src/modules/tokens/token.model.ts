import { Logger } from "@nestjs/common";
import { AuthorizationCodes } from "@sorokchat-messenger/contracts";
import { GrpcStatus } from "@sorokchat-messenger/microservices";
import jwt from "jsonwebtoken";
import z from "zod";
import { createError } from "../../utils/index.js";
import { RpcException } from "@nestjs/microservices";

const TokenSchema = z
  .object({
    subject: z
      .string({ error: "subject має бути рядком" })
      .nonempty({ error: "subject не може бути порожнім" })
      .nonoptional({ error: "subject має бути" }),
    issuedAt: z.number({
      error: "Дата та час видачі токена має бути часовою міткою",
    }),
    expiredAt: z.number({
      error: "Дата та час закінчення дії токена має бути часовою міткою",
    }),
  })
  .refine((data) => data.expiredAt > data.issuedAt, {
    error:
      "Дата та час закінчення дії токена має бути пізніше ніж дата та час видачі токена",
    path: [],
  });

export class TokenModel {
  private static readonly LOGGER: Logger = new Logger(TokenModel.name);

  private readonly _subject: string;
  private readonly _issuedAt: number;
  private readonly _expiredAt: number;

  private constructor(subject: string, issuedAt: number, expiredAt: number) {
    this._subject = subject;
    this._issuedAt = issuedAt;
    this._expiredAt = expiredAt;
  }

  public static of(
    subject: string,
    issuedAt: number,
    expiredAt: number,
  ): TokenModel {
    const result = TokenSchema.safeParse({
      subject,
      issuedAt,
      expiredAt,
    });
    if (!result.success)
      throw new Error(
        result.error.issues
          .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
          .join("; "),
      );
    return new TokenModel(
      result.data.subject,
      result.data.issuedAt,
      result.data.expiredAt,
    );
  }

  public static parse(token: string, secret: string): TokenModel {
    const invalidToken = (): RpcException => {
      return createError(
        GrpcStatus.UNAUTHENTICATED,
        AuthorizationCodes.BAD_CREDENTIALS,
      );
    };
    try {
      const decoded = jwt.verify(token, secret);
      if (typeof decoded === "string") {
        throw invalidToken();
      }
      const { iat, exp, sub } = decoded;
      if (typeof sub !== "string") throw invalidToken();
      if (typeof iat !== "number") throw invalidToken();
      if (typeof exp !== "number") throw invalidToken();
      TokenModel.LOGGER.debug(`Subject: ${sub}`);
      TokenModel.LOGGER.debug(`Issued at at: ${iat}`);
      TokenModel.LOGGER.debug(`Expiration at: ${exp}`);
      const model = TokenModel.of(
        sub,
        iat,
        exp,
      );
      return model;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        TokenModel.LOGGER.debug("Access token expired");
        throw invalidToken();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        TokenModel.LOGGER.warn(`Invalid token: ${error.message}`);
        throw invalidToken();
      }
      if (error instanceof RpcException) {
        this.LOGGER.error(`Rpc error`, error);
        throw error;
      }
      TokenModel.LOGGER.error("Unknown error", error);
      throw invalidToken();
    }
  }

  public get subject(): string {
    return this._subject;
  }

  public get issuedAt(): number {
    return this._issuedAt;
  }

  public get expiredAt(): number {
    return this._expiredAt;
  }

  public get isExpired(): boolean {
    return this._expiredAt <= Date.now();
  }

  public get lifetimeSeconds(): number {
    return Math.floor(
      (this._expiredAt - this._issuedAt) / 1000,
    );
  }

  public serialize(secret: string): string {
    return jwt.sign(
      {
        sub: this._subject,
        iat: Math.floor(this._issuedAt / 1000),
        exp: Math.floor(this._expiredAt / 1000),
      },
      secret,
    );
  }
}

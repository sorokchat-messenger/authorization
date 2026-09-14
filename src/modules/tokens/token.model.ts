import z from "zod";

const TokenSchema = z
  .object({
    subject: z
      .string({ error: "subject має бути рядком" })
      .nonempty({ error: "subject не може бути порожнім" })
      .nonoptional({ error: "subject має бути" }),
    issuedAt: z.date({
      error: "Дата та час видачі токена має бути часовою міткою",
    }),
    expiredAt: z.date({
      error: "Дата та час закінчення дії токена має бути часовою міткою",
    }),
  })
  .refine((data) => data.expiredAt.getTime() > data.issuedAt.getTime(), {
    error:
      "Дата та час закінчення дії токена має бути пізніше ніж дата та час видачі токена",
    path: [],
  });

export class TokenModel {
  private readonly _subject: string;
  private readonly _issuedAt: Date;
  private readonly _expiredAt: Date;

  private constructor(subject: string, issuedAt: Date, expiredAt: Date) {
    this._subject = subject;
    this._issuedAt = issuedAt;
    this._expiredAt = expiredAt;
  }

  public static of(
    subject: string,
    issuedAt: Date,
    expiredAt: Date,
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

  public get subject(): string {
    return this._subject;
  }

  public get issuedAt(): Date {
    return this._issuedAt;
  }

  public get expiredAt(): Date {
    return this._expiredAt;
  }

  public get isExpired(): boolean {
    return this._expiredAt.getTime() <= Date.now();
  }

  public get lifetimeSeconds(): number {
    return Math.floor(
      (this._expiredAt.getTime() - this._issuedAt.getTime()) / 1000,
    );
  }
}

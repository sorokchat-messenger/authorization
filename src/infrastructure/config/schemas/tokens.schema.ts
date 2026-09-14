import z from "zod";

export const TokenSchema = z
  .object({
    TOKENS_ACCESS_SECRET: z
      .string({ error: "Ключ для токену доступу має бути рядком" })
      .nonempty({ error: "Ключ для токену доступу не може бути порожнім" })
      .nonoptional({ error: "Ключ для токену доступу має бути" }),
    TOKENS_ACCESS_DURATION: z.coerce
      .number({ error: "Час дії токену доступу має бути числом" })
      .positive({ error: "Час дії токену доступу має бути позитивним числом" }),
    TOKENS_REFRESH_SECRET: z
      .string({ error: "Ключ для токена відновдення має бути рядком" })
      .nonempty({ error: "Ключ для токену відновлення не може бути порожнім" })
      .nonoptional({ error: "Ключ для токену відновлення має бути" }),
    TOKENS_REFRESH_DURATION: z.coerce
      .number({ error: "Час дії токену відновлення має бути числом" })
      .positive({
        error: "Час дії токену відновдення має бути позитивним числом",
      }),
  })
  .transform(
    ({
      TOKENS_ACCESS_DURATION,
      TOKENS_ACCESS_SECRET,
      TOKENS_REFRESH_DURATION,
      TOKENS_REFRESH_SECRET,
    }) => ({
      access: {
        secret: TOKENS_ACCESS_SECRET,
        duration: TOKENS_ACCESS_DURATION,
      },
      refresh: {
        secret: TOKENS_REFRESH_SECRET,
        duration: TOKENS_REFRESH_DURATION,
      },
    }),
  );
export type TokensConfig = z.infer<typeof TokenSchema>;

import z from "zod";

export const CryptographySchema = z
  .object({
    CRYPTOGRAPHY_PASSWORD_SECRET: z
      .string({
        error: "Секрет для паролю має бути рядком",
      })
      .nonempty({ error: "Секрет для паролю не можу бути порожнім" })
      .nonoptional({ error: "Секрет для паролю має бути" }),
  })
  .transform(({ CRYPTOGRAPHY_PASSWORD_SECRET }) => ({
    passwordSecret: CRYPTOGRAPHY_PASSWORD_SECRET,
  }));

export type CryptographyConfig = z.infer<typeof CryptographySchema>;

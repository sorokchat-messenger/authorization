import { HostSchema, PortSchema } from "@sorokchat-messenger/config";
import z from "zod";

export const DatabaseSchema = z
  .object({
    DATABASE_HOST: HostSchema,
    DATABASE_PORT: PortSchema,
    DATABASE_USER: z
      .string({ error: "Користувач має бути рядком" })
      .nonempty({ error: "Користувач не може бути порожнім" })
      .nonoptional({ error: "Користувач має бути" }),
    DATABASE_PASSWORD: z
      .string({ error: "Пароль користувача має бути рядком" })
      .nonempty({ error: "Пароль користувача не може бути порожнім" })
      .nonoptional({ error: "Пароль користувача має бути" }),
    DATABASE_NAME: z
      .string({ error: "Назва бази даних має бути рядком" })
      .nonempty({ error: "Назва бази даних не може бути порожнім" })
      .nonoptional({ error: "Назва бази даних має бути" }),
    DATABASE_SYNCHRONIZE: z.coerce.boolean({
      error: "Прапорець синхронізації має бути 'true' чи 'false'",
    }),
    DATABASE_SSL: z.coerce.boolean({
      error: "Прапоречь сертифікату має бути 'true' чи 'false'",
    }),
  })
  .transform(
    ({
      DATABASE_HOST,
      DATABASE_NAME,
      DATABASE_PASSWORD,
      DATABASE_PORT,
      DATABASE_SSL,
      DATABASE_SYNCHRONIZE,
      DATABASE_USER,
    }) => ({
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      name: DATABASE_NAME,
      ssl: DATABASE_SSL,
      synchronize: DATABASE_SYNCHRONIZE,
    }),
  );

export type DatabaseConfig = z.infer<typeof DatabaseSchema>;

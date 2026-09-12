import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { UserModel } from "./user.model.js";
import { Role } from "@sorokchat-messenger/contracts";

const createSigningMock = (): ISigning => ({
  sign: vi.fn(async (value: string, secret: string) => `${secret}:${value}`),
  verify: vi.fn(
    async (value: string, hash: string, secret: string) =>
      hash === `${secret}:${value}`,
  ),
});

describe("User model tests", () => {
  let signing: ISigning;
  let secret: string = "secret";
  let baseUser: UserModel;

  beforeAll(() => {
    signing = createSigningMock();
  });

  beforeEach(async () => {
    baseUser = await UserModel.create(
      "andrey",
      "password",
      signing,
      secret,
      "Сороковський Андрій",
    );
  });

  it("should correct create without display name", async () => {
    const user = await UserModel.create("andrey", "password", signing, secret);
    expect(user.id).toBe(0);
    expect(user.login).toBe("andrey");
    expect(
      user.verifyPassword(signing, secret, "password"),
    ).resolves.toBeTruthy();
    expect(user.displayName).toBe("andrey");
    expect(user.isUser).toBeTruthy();
    expect(user.isPro).toBeFalsy();
    expect(user.isAdmin).toBeFalsy();
  });

  it("should correct create with display name", async () => {
    const user = await UserModel.create(
      "andrey",
      "password",
      signing,
      secret,
      "Сороковський Андрій",
    );
    expect(user.id).toBe(0);
    expect(user.login).toBe("andrey");
    expect(
      user.verifyPassword(signing, secret, "password"),
    ).resolves.toBeTruthy();
    expect(user.displayName).toBe("Сороковський Андрій");
    expect(user.isUser).toBeTruthy();
    expect(user.isPro).toBeFalsy();
    expect(user.isAdmin).toBeFalsy();
  });

  it("should correct update login", () => {
    baseUser.login = "andrey";
    expect(baseUser.login).toBe("andrey");
  });

  it("should correct update displayName", () => {
    baseUser.displayName = "andrey";
    expect(baseUser.displayName).toBe("andrey");
  });

  it("should correct update role", () => {
    baseUser.role = Role.PRO;
    expect(baseUser.isAdmin).toBeFalsy();
    expect(baseUser.isUser).toBeTruthy();
    expect(baseUser.isPro).toBeTruthy();
  });

  it("should success change password", async () => {
    await baseUser.changePassword(signing, secret, "new");
    expect(
      baseUser.verifyPassword(signing, secret, "new"),
    ).resolves.toBeTruthy();
  });
});

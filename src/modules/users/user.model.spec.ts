import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { UserModel } from "./user.model.js";
import { Role } from "@sorokchat-messenger/contracts";
import { Test, TestingModule } from "@nestjs/testing";
import {
  PASSWORD_SECRET_TOKEN,
  SIGNING_TOKEN,
} from "../../infrastructure/index.js";
import {
  MOCK_PASSWORD_SECRET_PROVIDER,
  MOCK_SIGNING_PROVIDER,
} from "../../../test/index.js";

describe("User model tests", () => {
  let signing: ISigning;
  let secret: string;
  let baseUser: UserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MOCK_SIGNING_PROVIDER, MOCK_PASSWORD_SECRET_PROVIDER],
    }).compile();

    signing = module.get<ISigning>(SIGNING_TOKEN);
    secret = module.get<string>(PASSWORD_SECRET_TOKEN);
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
    expect(user.hashedPassword).toBe(`password:${secret}`);
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
    expect(user.hashedPassword).toBe(`password:${secret}`);
    expect(user.displayName).toBe("Сороковський Андрій");
    expect(user.role).toBe(Role.USER);
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

  it("should correct getting from storage", () => {
    const user = UserModel.fromStorage(
      1,
      "sorokovsky_andrey",
      "password",
      "sorokovsky_andrey",
      Role.USER,
    );
    expect(user.id).toBe(1);
    expect(user.login).toBe("sorokovsky_andrey");
    expect(user.hashedPassword).toBe("password");
    expect(user.displayName).toBe("sorokovsky_andrey");
    expect(user.role).toBe(Role.USER);
  });
});

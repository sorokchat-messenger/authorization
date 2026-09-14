import { TokenModel } from "./token.model.js";

describe("TokenModel", () => {
  it("should throw error on of if subject empty", () => {
    const now = new Date();
    expect(() =>
      TokenModel.of("", now, new Date(now.getTime() + 1000)),
    ).toThrow();
  });

  it("should throw error of if issuedTime >= expiredTime", () => {
    const now = new Date();
    expect(() =>
      TokenModel.of("", now, new Date(now.getTime() - 1000)),
    ).toThrow();
  });

  it("should success create token", () => {
    const subject: string = "andrey";
    const now: Date = new Date();
    const lifetimeSeconds: number = 1;
    const expiredAt: Date = new Date(now.getTime() + lifetimeSeconds * 1000);
    const secret: string = "secret";
    const token = TokenModel.of(subject, now, expiredAt);
    expect(token.subject).toBe(subject);
    expect(token.issuedAt).toBe(now);
    expect(token.expiredAt).toBe(expiredAt);
    expect(token.isExpired).toBeFalsy();
    expect(token.lifetimeSeconds).toBe(lifetimeSeconds);
  });
});

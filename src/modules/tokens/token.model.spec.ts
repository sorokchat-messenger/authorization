import { sign } from "jsonwebtoken";
import { TokenModel } from "./token.model.js";
import { createHmac } from "node:crypto";

const SECRET = "test-secret";
const OTHER_SECRET = "wrong-secret";

const nowSec = () => Math.floor(Date.now() / 1000);

function makeToken(
  subject: string,
  durationMs: number,
  secret: string = SECRET,
): string {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    {
      sub: subject,
      iat: now,
      exp: now + Math.floor(durationMs / 1000),
    },
    secret,
  );
}

function makeRawToken(
  payload: Record<string, unknown> | string,
  secret: string,
): string {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function checkJwt(token: string): void {
  const parts: string[] = token.split(".");
  expect(parts.length).toBe(3);
  for (const part of parts) {
    expect(part.length).toBeGreaterThan(0);
  }
}

describe("TokenModel", () => {
  it("should throw error on of if subject empty", () => {
    const now = new Date();
    expect(() =>
      TokenModel.of("", now, new Date(now.getTime() + 1000)),
    ).toThrow();
  });

  it("should throw error on of if issuedTime >= expiredTime", () => {
    const now = new Date();
    expect(() =>
      TokenModel.of("andrey", now, new Date(now.getTime() - 1000)),
    ).toThrow();
  });

  it("should success create token", () => {
    const subject: string = "andrey";
    const now: Date = new Date();
    const lifetimeSeconds: number = 1;
    const expiredAt: Date = new Date(now.getTime() + lifetimeSeconds * 1000);
    const token = TokenModel.of(subject, now, expiredAt);
    expect(token.subject).toBe(subject);
    expect(token.issuedAt).toBe(now);
    expect(token.expiredAt).toBe(expiredAt);
    expect(token.isExpired).toBeFalsy();
    expect(token.lifetimeSeconds).toBe(lifetimeSeconds);
  });

  it("should success serialize token", () => {
    const subject: string = "andrey";
    const now: Date = new Date();
    const lifetimeSeconds: number = 1;
    const expiredAt: Date = new Date(now.getTime() + lifetimeSeconds * 1000);
    const secret: string = "secret";
    const token = TokenModel.of(subject, now, expiredAt);
    checkJwt(token.serialize(secret));
  });

  it("should success parse valid token", () => {
    const token: string = makeToken("andrey", 1000 * 1000);
    const model = TokenModel.parse(token, SECRET);
    expect(model.subject).toBe("andrey");
  });

  it("should restore issuedAt and expiredAt from iat and exp", () => {
    const token: string = makeToken("andrey", 7200 * 1000);
    const model = TokenModel.parse(token, SECRET);
    expect(model.lifetimeSeconds).toBe(7200);
  });

  it("should not be expired on valid token", () => {
    const token: string = makeToken("andrey", 7200 * 1000);
    const model = TokenModel.parse(token, SECRET);
    expect(model.isExpired).toBeFalsy();
  });

  it("should throw error on parse if secret is wrong", () => {
    const token: string = makeToken("user-1", 3600 * 1000);
    expect(() => TokenModel.parse(token, OTHER_SECRET)).toThrow();
  });

  it("should throw error on parse if token is not a jwt", () => {
    expect(() => TokenModel.parse("not-a-jwt", SECRET)).toThrow();
  });

  it("should throw error on parse if token is empty", () => {
    expect(() => TokenModel.parse("", SECRET)).toThrow();
  });

  it("should throw error on parse if token has no signature", () => {
    expect(() => TokenModel.parse("a.b.c", SECRET)).toThrow();
  });

  it("should throw error on parse if iat is not a number", () => {
    const token: string = makeRawToken(
      { sub: "user-1", iat: "not-a-number", exp: nowSec() + 3600 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if token is expired", () => {
    const token: string = sign(
      { sub: "user-1", iat: nowSec() - 7200, exp: nowSec() - 3600 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if sub is missing", () => {
    const token: string = sign({ iat: nowSec(), exp: nowSec() + 3600 }, SECRET);
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if sub is not a string", () => {
    const token: string = makeRawToken(
      { sub: 123, iat: nowSec(), exp: nowSec() + 3600 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if sub is empty", () => {
    const token: string = makeRawToken(
      { sub: "", iat: nowSec(), exp: nowSec() + 3600 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse iat is not number", () => {
    const token: string = makeRawToken(
      { sub: "andrey", exp: nowSec() + 3600 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse exp is not number", () => {
    const token: string = sign({ sub: "user-1", iat: nowSec() }, SECRET);
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if iat >= exp", () => {
    const base: number = nowSec();
    const token: string = sign(
      { sub: "user-1", iat: base + 10_000, exp: base + 5_000 },
      SECRET,
    );
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });

  it("should throw error on parse if payload is a string", () => {
    const token: string = makeRawToken("user-1", SECRET);
    expect(() => TokenModel.parse(token, SECRET)).toThrow();
  });
});

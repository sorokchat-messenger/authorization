import { Provider } from "@nestjs/common";
import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { SIGNING_TOKEN } from "../../src/infrastructure/index.js";

class SigningMock implements ISigning {
  public async sign(plaintext: string, secret: string): Promise<string> {
    return `${plaintext}:${secret}`;
  }

  public async verify(
    plaintext: string,
    signing: string,
    secret: string,
  ): Promise<boolean> {
    const hash = await this.sign(plaintext, secret);
    return hash === signing;
  }
}

export const MOCK_SIGNING_PROVIDER: Provider<ISigning> = {
  provide: SIGNING_TOKEN,
  useClass: SigningMock,
};

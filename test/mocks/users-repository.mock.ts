import { Provider } from "@nestjs/common";
import { UserModel } from "../../src/modules/users/user.model.js";
import {
  IUsersRepository,
  USERS_REPOSITORY_TOKEN,
} from "../../src/modules/users/users.repository.interface.js";

class UsersRepository implements IUsersRepository {
  private users: UserModel[];

  public constructor() {
    this.users = [];
  }

  public async save(user: UserModel): Promise<UserModel> {
    const index = this.users.findIndex((candidate) => candidate.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
      return this.users[index];
    } else {
      this.users.push(
        UserModel.fromStorage(
          this.users.length + 1,
          user.login,
          user.hashedPassword,
          user.displayName,
          user.role,
        ),
      );
      return this.users[this.users.length - 1];
    }
  }

  public async getById(id: number): Promise<UserModel | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  public async getByLogin(login: string): Promise<UserModel | null> {
    return this.users.find((user) => user.login === login) || null;
  }

  public async delete(id: number): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }
}

export const MOCK_USERS_REPOSITORY_PROVIDER: Provider<IUsersRepository> = {
  provide: USERS_REPOSITORY_TOKEN,
  useClass: UsersRepository,
};

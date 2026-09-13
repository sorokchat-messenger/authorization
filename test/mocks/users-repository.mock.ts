import { Provider } from "@nestjs/common";
import { UserModel } from "../../src/modules/users/user.model.js";
import {
  IUsersRepository,
  USERS_REPOSITORY_TOKEN,
} from "../../src/modules/users/users.repository.interface.js";

class UsersRepository implements IUsersRepository {
  public async save(user: UserModel): Promise<UserModel> {
    throw new Error("Method not implemented.");
  }

  public async getById(id: number): Promise<UserModel | null> {
    throw new Error("Method not implemented.");
  }

  public async delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export const MOCK_USERS_REPOSITORY_PROVIDER: Provider<IUsersRepository> = {
  provide: USERS_REPOSITORY_TOKEN,
  useClass: UsersRepository,
};

import { type NewUser } from "./new-user.type.js";
import { type UserModel } from "./user.model.js";

export interface IUsersRepository {
  create(user: NewUser): Promise<UserModel>;
  save(user: UserModel): Promise<UserModel>;
  getById(id: string): Promise<UserModel | null>;
  getByLogin(login: string): Promise<UserModel | null>;
  delete(id: string): Promise<void>;
}

export const USERS_REPOSITORY_TOKEN: string = "USERS_REPOSITORY";

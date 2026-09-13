import { type UserModel } from "./user.model.js";

export interface IUsersRepository {
  save(user: UserModel): Promise<UserModel>;
  getById(id: number): Promise<UserModel | null>;
  getByLogin(login: string): Promise<UserModel | null>;
  delete(id: number): Promise<void>;
}

export const USERS_REPOSITORY_TOKEN: string = "USERS_REPOSITORY";

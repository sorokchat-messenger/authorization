import { Role } from "@sorokchat-messenger/contracts";
import { ISigning } from "@sorokchat-messenger/cryptography-abstractions";
import { RoleHierarchy } from "../../utils/index.js";

export class UserModel {
  private static readonly HIERARCHY = new RoleHierarchy(
    new Map<string, string[]>([
      [Role.USER, []],
      [Role.PRO, [Role.USER]],
      [Role.ADMIN, [Role.PRO]],
    ]),
  );

  private readonly _id: number | null;
  private _login: string;
  private _password: string;
  private _displayName: string;
  private _role: Role;

  private constructor(
    id: number | null,
    login: string,
    password: string,
    displayName: string,
    role: Role,
  ) {
    this._id = id;
    this._login = login;
    this._password = password;
    this._displayName = displayName;
    this._role = role;
  }

  public get id(): number {
    return this._id ?? 0;
  }

  public get login(): string {
    return this._login;
  }

  public set login(value: string) {
    this._login = value;
  }

  public async verifyPassword(
    service: ISigning,
    secret: string,
    password: string,
  ): Promise<boolean> {
    return await service.verify(password, this._password, secret);
  }

  public async changePassword(
    service: ISigning,
    secret: string,
    password: string,
  ): Promise<void> {
    this._password = await service.sign(password, secret);
  }

  public get displayName(): string {
    return this._displayName;
  }

  public get hashedPassword(): string {
    return this._password;
  }

  public set displayName(value: string) {
    this._displayName = value;
  }

  public get isUser(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.USER, this._role);
  }

  public get isPro(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.PRO, this._role);
  }

  public get isAdmin(): boolean {
    return UserModel.HIERARCHY.hasRole(Role.ADMIN, this._role);
  }

  public get role(): Role {
    return this._role;
  }

  public set role(role: Role) {
    this._role = role;
  }

  public static async create(
    login: string,
    password: string,
    signingService: ISigning,
    secret: string,
    displayName?: string,
  ): Promise<UserModel> {
    const signedPassword: string = await signingService.sign(password, secret);
    return new UserModel(
      null,
      login,
      signedPassword,
      displayName || login,
      Role.USER,
    );
  }

  public static fromStorage(
    id: number,
    login: string,
    password: string,
    displayName: string,
    role: Role,
  ): UserModel {
    return new UserModel(id, login, password, displayName, role);
  }
}

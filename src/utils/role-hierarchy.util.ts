import { Role } from "@sorokchat-messenger/contracts";

export class RoleHierarchy {
  private readonly map: Map<string, string[]>;
  private readonly cache: Map<string, boolean>;

  public constructor(map: Map<string, string[]>) {
    this.map = new Map<string, string[]>(
      [...map.entries()].map(([role, inheritedRoles]) => [
        role,
        [...inheritedRoles],
      ]),
    );
    this.cache = new Map<string, boolean>();
  }

  public hasRole(needRole: string, currentRole: string): boolean {
    const key: string = this.generateKey(currentRole, needRole);
    const fromCache: boolean | undefined = this.cache.get(key);
    if (fromCache !== undefined) return fromCache;
    if (needRole === currentRole) {
      this.save(key, true);
      return true;
    }
    const currentRoles = this.map.get(currentRole);
    if (!currentRoles) {
      this.save(key, false);
      return false;
    }
    if (currentRoles.includes(needRole)) {
      this.save(key, true);
      return true;
    }
    const result: boolean = currentRoles.some((role) =>
      this.hasRole(needRole, role),
    );
    this.save(key, result);
    return result;
  }

  private save(key: string, flag: boolean): void {
    this.cache.set(key, flag);
  }

  private generateKey(current: string, needed: string): string {
    return `${current}:${needed}`;
  }
}

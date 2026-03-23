import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: bigint;
    name: string;
    tier: Tier;
    avatarUrl?: string;
    gameMode: string;
    points: bigint;
}
export enum Tier {
    a = "a",
    b = "b",
    c = "c",
    d = "d",
    s = "s"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlayer(player: Player): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePlayer(id: bigint): Promise<void>;
    getAllPlayers(): Promise<Array<Player>>;
    getCallerUserRole(): Promise<UserRole>;
    getPlayer(id: bigint): Promise<Player>;
    getPlayersByTier(tier: Tier): Promise<Array<Player>>;
    getPodium(): Promise<Array<Player>>;
    getTop3Players(): Promise<Array<Player>>;
    isCallerAdmin(): Promise<boolean>;
    seedSampleData(): Promise<void>;
    setPodium(first: bigint, second: bigint, third: bigint): Promise<void>;
    updatePlayer(id: bigint, player: Player): Promise<void>;
}

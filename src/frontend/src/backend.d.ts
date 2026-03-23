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
    entries: Array<GameModeEntry>;
    avatarUrl?: string;
}
export interface UserProfile {
    name: string;
}
export interface GameModeEntry {
    tier: Tier;
    gameMode: string;
}
export enum Tier {
    ht1 = "ht1",
    ht2 = "ht2",
    ht3 = "ht3",
    ht4 = "ht4",
    ht5 = "ht5",
    lt1 = "lt1",
    lt2 = "lt2",
    lt3 = "lt3",
    lt4 = "lt4",
    lt5 = "lt5"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / --- Player Management ---
     */
    addPlayer(name: string, entries: Array<GameModeEntry>, avatarUrl: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAllPlayers(): Promise<void>;
    deletePlayer(id: bigint): Promise<boolean>;
    /**
     * / --- Player Queries ---
     */
    getAllPlayers(): Promise<Array<Player>>;
    /**
     * / --- User Profile Management ---
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlayersByTier(tier: Tier): Promise<Array<Player>>;
    /**
     * / --- Podium / Top 3 ---
     */
    getPodium(): Promise<Array<Player>>;
    getTopPlayers(n: bigint): Promise<Array<Player>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedSamplePlayers(): Promise<void>;
    setPodium(firstId: bigint, secondId: bigint, thirdId: bigint): Promise<void>;
    updatePlayer(id: bigint, name: string, entries: Array<GameModeEntry>, avatarUrl: string): Promise<boolean>;
}

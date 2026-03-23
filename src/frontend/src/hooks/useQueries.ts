import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type GameModeEntry, type Player, Tier } from "../backend";
import { useActor } from "./useActor";

export function useGetAllPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPodium() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["podium"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPodium();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      entries,
      avatarUrl,
    }: {
      name: string;
      entries: GameModeEntry[];
      avatarUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPlayer(name, entries, avatarUrl);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      entries,
      avatarUrl,
    }: {
      id: bigint;
      name: string;
      entries: GameModeEntry[];
      avatarUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePlayer(id, name, entries, avatarUrl);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useDeletePlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePlayer(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useSetPodium() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      first,
      second,
      third,
    }: { first: bigint; second: bigint; third: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setPodium(first, second, third);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podium"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.seedSamplePlayers();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players"] });
      qc.invalidateQueries({ queryKey: ["podium"] });
    },
  });
}

export const TIER_ORDER: Tier[] = [
  Tier.ht1,
  Tier.lt1,
  Tier.ht2,
  Tier.lt2,
  Tier.ht3,
  Tier.lt3,
  Tier.ht4,
  Tier.lt4,
  Tier.ht5,
  Tier.lt5,
];

export function tierLabel(tier: Tier): string {
  return tier.toUpperCase();
}

export function getTierClass(tier: Tier): string {
  return `tier-${tier}`;
}

/** Returns the best (highest-ranked) tier entry for a player, or null */
export function getBestEntry(player: Player) {
  if (!player.entries || player.entries.length === 0) return null;
  const RANK: Record<Tier, number> = {
    [Tier.ht1]: 1,
    [Tier.lt1]: 2,
    [Tier.ht2]: 3,
    [Tier.lt2]: 4,
    [Tier.ht3]: 5,
    [Tier.lt3]: 6,
    [Tier.ht4]: 7,
    [Tier.lt4]: 8,
    [Tier.ht5]: 9,
    [Tier.lt5]: 10,
  };
  return player.entries.reduce((best, e) =>
    RANK[e.tier] < RANK[best.tier] ? e : best,
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Player, Tier } from "../backend";
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

export function useGetTop3Players() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["top3"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTop3Players();
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
    mutationFn: async (player: Player) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPlayer(player);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, player }: { id: bigint; player: Player }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePlayer(id, player);
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
      qc.invalidateQueries({ queryKey: ["top3"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.seedSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players"] });
      qc.invalidateQueries({ queryKey: ["podium"] });
      qc.invalidateQueries({ queryKey: ["top3"] });
    },
  });
}

export const TIER_ORDER: Tier[] = [Tier.s, Tier.a, Tier.b, Tier.c, Tier.d];

export function tierLabel(tier: Tier): string {
  return tier.toUpperCase();
}

export function getTierClass(tier: Tier): string {
  return `tier-${tier}`;
}

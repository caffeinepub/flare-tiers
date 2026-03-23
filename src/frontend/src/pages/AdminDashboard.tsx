import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Database,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Player, Tier } from "../backend";
import PlayerAvatar from "../components/PlayerAvatar";
import SiteNav from "../components/SiteNav";
import TierBadge from "../components/TierBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddPlayer,
  useDeletePlayer,
  useGetAllPlayers,
  useGetPodium,
  useIsCallerAdmin,
  useSeedData,
  useSetPodium,
  useUpdatePlayer,
} from "../hooks/useQueries";

const TIERS = [Tier.s, Tier.a, Tier.b, Tier.c, Tier.d];

interface PlayerFormData {
  name: string;
  tier: Tier;
  points: string;
  gameMode: string;
  avatarUrl: string;
}

const emptyForm: PlayerFormData = {
  name: "",
  tier: Tier.b,
  points: "0",
  gameMode: "",
  avatarUrl: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: allPlayers = [], isLoading: playersLoading } =
    useGetAllPlayers();
  const { data: podium = [] } = useGetPodium();

  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const setPodium = useSetPodium();
  const seedData = useSeedData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<PlayerFormData>(emptyForm);

  const [podium1, setPodium1] = useState<string>("");
  const [podium2, setPodium2] = useState<string>("");
  const [podium3, setPodium3] = useState<string>("");

  useEffect(() => {
    if (podium.length >= 1) setPodium1(podium[0].id.toString());
    if (podium.length >= 2) setPodium2(podium[1].id.toString());
    if (podium.length >= 3) setPodium3(podium[2].id.toString());
  }, [podium]);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/admin" });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      toast.error("Access denied. Admin privileges required.");
      navigate({ to: "/" });
    }
  }, [isAdmin, adminLoading, navigate]);

  const openAddDialog = () => {
    setEditingPlayer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      name: player.name,
      tier: player.tier,
      points: player.points.toString(),
      gameMode: player.gameMode,
      avatarUrl: player.avatarUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSavePlayer = async () => {
    if (!form.name.trim() || !form.gameMode.trim()) {
      toast.error("Name and Gamemode are required.");
      return;
    }
    const playerData: Player = {
      id: editingPlayer?.id ?? BigInt(0),
      name: form.name.trim(),
      tier: form.tier,
      points: BigInt(Number.parseInt(form.points) || 0),
      gameMode: form.gameMode.trim(),
      avatarUrl: form.avatarUrl.trim() || undefined,
    };
    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({
          id: editingPlayer.id,
          player: playerData,
        });
        toast.success(`${playerData.name} updated successfully.`);
      } else {
        await addPlayer.mutateAsync(playerData);
        toast.success(`${playerData.name} added successfully.`);
      }
      setDialogOpen(false);
    } catch (_e) {
      toast.error("Failed to save player.");
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    try {
      await deletePlayer.mutateAsync(player.id);
      toast.success(`${player.name} removed.`);
    } catch (_e) {
      toast.error("Failed to delete player.");
    }
  };

  const handleSavePodium = async () => {
    if (!podium1 || !podium2 || !podium3) {
      toast.error("Select all 3 podium positions.");
      return;
    }
    try {
      await setPodium.mutateAsync({
        first: BigInt(podium1),
        second: BigInt(podium2),
        third: BigInt(podium3),
      });
      toast.success("Podium updated!");
    } catch (_e) {
      toast.error("Failed to update podium.");
    }
  };

  const handleSeedData = async () => {
    try {
      await seedData.mutateAsync();
      toast.success("Sample data seeded!");
    } catch (_e) {
      toast.error("Failed to seed data.");
    }
  };

  const isSaving = addPlayer.isPending || updatePlayer.isPending;

  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="dashboard.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-pixel text-base sm:text-lg text-foreground">
                ADMIN DASHBOARD
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage players and podium
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedData}
                disabled={seedData.isPending}
                className="text-muted-foreground border-border hover:text-foreground"
                data-ocid="dashboard.secondary_button"
              >
                {seedData.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Seed Data
              </Button>
              <Button
                onClick={openAddDialog}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider"
                data-ocid="dashboard.primary_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player Table */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-pixel text-xs text-foreground">
                    PLAYER ROSTER
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {playersLoading ? (
                    <div
                      className="p-6 space-y-3"
                      data-ocid="players.loading_state"
                    >
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : allPlayers.length === 0 ? (
                    <div
                      className="text-center py-16 text-muted-foreground"
                      data-ocid="players.empty_state"
                    >
                      <p className="font-pixel text-xs mb-2">No players yet</p>
                      <p className="text-sm">
                        Add a player or seed sample data.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto" data-ocid="players.table">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/20">
                            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              Player
                            </th>
                            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider hidden sm:table-cell">
                              Gamemode
                            </th>
                            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              Points
                            </th>
                            <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              Tier
                            </th>
                            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allPlayers.map((player, idx) => (
                            <tr
                              key={player.id.toString()}
                              className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors"
                              data-ocid={`players.item.${idx + 1}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <PlayerAvatar
                                    name={player.name}
                                    avatarUrl={player.avatarUrl}
                                    size="sm"
                                  />
                                  <span className="font-semibold text-sm text-foreground">
                                    {player.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell">
                                {player.gameMode}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm">
                                {player.points.toString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TierBadge tier={player.tier} size="sm" />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(player)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    data-ocid={`players.edit_button.${idx + 1}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        data-ocid={`players.delete_button.${idx + 1}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent
                                      className="bg-card border-border"
                                      data-ocid="players.dialog"
                                    >
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete {player.name}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel data-ocid="players.cancel_button">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeletePlayer(player)
                                          }
                                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                          data-ocid="players.confirm_button"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Podium Picker */}
            <div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-pixel text-xs text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-mc-gold" />
                    TOP 3 PODIUM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      🥇 1st Place
                    </Label>
                    <Select value={podium1} onValueChange={setPodium1}>
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="podium.select"
                      >
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {allPlayers.map((p) => (
                          <SelectItem
                            key={p.id.toString()}
                            value={p.id.toString()}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      🥈 2nd Place
                    </Label>
                    <Select value={podium2} onValueChange={setPodium2}>
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="podium.select"
                      >
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {allPlayers.map((p) => (
                          <SelectItem
                            key={p.id.toString()}
                            value={p.id.toString()}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      🥉 3rd Place
                    </Label>
                    <Select value={podium3} onValueChange={setPodium3}>
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="podium.select"
                      >
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {allPlayers.map((p) => (
                          <SelectItem
                            key={p.id.toString()}
                            value={p.id.toString()}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSavePodium}
                    disabled={setPodium.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider"
                    data-ocid="podium.save_button"
                  >
                    {setPodium.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Podium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Add/Edit Player Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border sm:max-w-md"
          data-ocid="player-form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-pixel text-xs text-foreground">
              {editingPlayer ? "EDIT PLAYER" : "ADD PLAYER"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Player Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Notch"
                className="bg-secondary border-border"
                data-ocid="player-form.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Tier *
                </Label>
                <Select
                  value={form.tier}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, tier: v as Tier }))
                  }
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="player-form.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {TIERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.toUpperCase()} Tier
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Points
                </Label>
                <Input
                  type="number"
                  value={form.points}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, points: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                  className="bg-secondary border-border"
                  data-ocid="player-form.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Gamemode *
              </Label>
              <Input
                value={form.gameMode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, gameMode: e.target.value }))
                }
                placeholder="e.g. PvP, Survival, UHC"
                className="bg-secondary border-border"
                data-ocid="player-form.input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Avatar URL (optional)
              </Label>
              <Input
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-secondary border-border"
                data-ocid="player-form.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-border text-muted-foreground"
              data-ocid="player-form.cancel_button"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSavePlayer}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              data-ocid="player-form.submit_button"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingPlayer ? "Save Changes" : "Add Player"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

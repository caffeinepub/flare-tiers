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
  Lock,
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
import { type GameModeEntry, type Player, Tier } from "../backend";
import PlayerAvatar from "../components/PlayerAvatar";
import SiteNav from "../components/SiteNav";
import TierBadge from "../components/TierBadge";
import { useActor } from "../hooks/useActor";
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

const TIERS: Tier[] = [
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

interface EntryWithId extends GameModeEntry {
  _id: number;
}
interface PlayerFormData {
  name: string;
  avatarUrl: string;
  entries: EntryWithId[];
}

let _nextId = 0;
const newEntry = (): EntryWithId => ({
  gameMode: "",
  tier: Tier.ht3,
  _id: _nextId++,
});
const emptyForm: PlayerFormData = {
  name: "",
  avatarUrl: "",
  entries: [newEntry()],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isFetching } = useActor();

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
    if (!isInitializing && !isAuthenticated) navigate({ to: "/admin" });
  }, [isInitializing, isAuthenticated, navigate]);

  const openAddDialog = () => {
    setEditingPlayer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      name: player.name,
      avatarUrl: player.avatarUrl || "",
      entries:
        player.entries.length > 0
          ? player.entries.map((e) => ({ ...e, _id: _nextId++ }))
          : [newEntry()],
    });
    setDialogOpen(true);
  };

  const addEntry = () => {
    setForm((prev) => ({
      ...prev,
      entries: [...prev.entries, newEntry()],
    }));
  };

  const removeEntry = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== idx),
    }));
  };

  const updateEntry = (
    idx: number,
    field: keyof GameModeEntry,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      entries: prev.entries.map((e, i) =>
        i === idx ? { ...e, [field]: value } : e,
      ),
    }));
  };

  const handleSavePlayer = async () => {
    if (!form.name.trim()) {
      toast.error("Player name is required.");
      return;
    }
    if (form.entries.length === 0) {
      toast.error("At least one game mode entry is required.");
      return;
    }
    for (const e of form.entries) {
      if (!e.gameMode.trim()) {
        toast.error("All game mode entries must have a name.");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      entries: form.entries.map((e) => ({
        gameMode: e.gameMode.trim(),
        tier: e.tier,
      })),
      avatarUrl: form.avatarUrl.trim(),
    };

    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({ id: editingPlayer.id, ...payload });
        toast.success(`${payload.name} updated successfully.`);
      } else {
        await addPlayer.mutateAsync(payload);
        toast.success(`${payload.name} added successfully.`);
      }
      setDialogOpen(false);
    } catch (_e) {
      toast.error("Failed to save player data.");
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

  if (isInitializing || isFetching || adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="dashboard.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminLoading && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              className="bg-card border-border max-w-md w-full text-center"
              data-ocid="dashboard.error_state"
            >
              <CardContent className="pt-10 pb-8 px-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <h2 className="font-pixel text-sm text-foreground mb-3">
                  ACCESS DENIED
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  You don&apos;t have admin privileges. Make sure you&apos;re
                  accessing this page from the Caffeine platform dashboard.
                </p>
                <Button
                  onClick={() => navigate({ to: "/" })}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider"
                  data-ocid="dashboard.primary_button"
                >
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
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
                            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              Entries
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
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {player.entries.map((e, ei) => (
                                    <span
                                      key={`${e.gameMode}-${e.tier}-${ei}`}
                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted/40 border border-border/50"
                                    >
                                      <TierBadge tier={e.tier} size="sm" />
                                      <span className="text-xs text-muted-foreground">
                                        {e.gameMode}
                                      </span>
                                    </span>
                                  ))}
                                </div>
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
          className="bg-card border-border sm:max-w-lg"
          data-ocid="player-form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-pixel text-xs text-foreground">
              {editingPlayer ? "EDIT PLAYER" : "ADD PLAYER"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-1">
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

            {/* Entries */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                Game Mode Entries *
              </Label>
              <div className="space-y-2">
                {form.entries.map((entry, idx) => (
                  <div
                    key={entry._id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/20 border border-border/50"
                    data-ocid={`player-form.item.${idx + 1}`}
                  >
                    <Input
                      value={entry.gameMode}
                      onChange={(e) =>
                        updateEntry(idx, "gameMode", e.target.value)
                      }
                      placeholder="e.g. PvP, UHC"
                      className="bg-secondary border-border flex-1 h-8 text-sm"
                    />
                    <Select
                      value={entry.tier}
                      onValueChange={(v) => updateEntry(idx, "tier", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border w-24 h-8 text-sm"
                        data-ocid="player-form.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {TIERS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.entries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        data-ocid={`player-form.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addEntry}
                className="mt-2 w-full border-dashed border-border text-muted-foreground hover:text-foreground text-xs"
                data-ocid="player-form.secondary_button"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Game Mode
              </Button>
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

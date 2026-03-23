import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { type Player, Tier } from "../backend";
import PlayerAvatar from "../components/PlayerAvatar";
import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import TierBadge from "../components/TierBadge";
import {
  TIER_ORDER,
  useGetAllPlayers,
  useGetPodium,
} from "../hooks/useQueries";

const tierNames: Record<Tier, string> = {
  [Tier.s]: "S Tier — God Tier",
  [Tier.a]: "A Tier — Elite",
  [Tier.b]: "B Tier — Advanced",
  [Tier.c]: "C Tier — Intermediate",
  [Tier.d]: "D Tier — Beginner",
};

function PodiumCard({
  player,
  place,
  height,
}: {
  player: Player | undefined;
  place: 1 | 2 | 3;
  height: string;
}) {
  const labels = { 1: "1ST", 2: "2ND", 3: "3RD" } as const;
  const podiumClass = {
    1: "podium-gold",
    2: "podium-silver",
    3: "podium-bronze",
  };
  const textClass = {
    1: "text-mc-gold",
    2: "text-mc-silver",
    3: "text-mc-bronze",
  };
  const trophyColor = {
    1: "#D1A84A",
    2: "#8C93A1",
    3: "#B07A4A",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar floats above podium */}
      {player ? (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2.5 + place * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-2"
        >
          <PlayerAvatar
            name={player.name}
            avatarUrl={player.avatarUrl}
            size="xl"
            className="border-4"
          />
          <TierBadge tier={player.tier} size="lg" />
        </motion.div>
      ) : (
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-2xl">?</span>
        </div>
      )}

      {/* Podium block */}
      <div
        className={`${podiumClass[place]} rounded-t-lg w-28 sm:w-36 flex flex-col items-center justify-start pt-4 gap-1 relative`}
        style={{ height }}
      >
        <Trophy className="w-5 h-5" style={{ color: trophyColor[place] }} />
        <span className={`font-pixel text-xs font-bold ${textClass[place]}`}>
          {labels[place]}
        </span>
        {player ? (
          <>
            <span className="text-foreground font-bold text-sm text-center px-2 line-clamp-1">
              {player.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {player.points.toString()} pts
            </span>
          </>
        ) : (
          <span className="text-muted-foreground text-xs">TBD</span>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const tierListRef = useRef<HTMLDivElement>(null);
  const { data: allPlayers = [], isLoading: playersLoading } =
    useGetAllPlayers();
  const { data: podium = [], isLoading: podiumLoading } = useGetPodium();

  const scrollToTierList = () => {
    tierListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group players by tier
  const playersByTier = TIER_ORDER.reduce(
    (acc, tier) => {
      acc[tier] = allPlayers
        .filter((p) => p.tier === tier)
        .sort((a, b) => Number(b.points) - Number(a.points));
      return acc;
    },
    {} as Record<Tier, Player[]>,
  );

  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  return (
    <div
      className="min-h-screen"
      style={{
        background: `url('/assets/generated/mc-bg.dim_1920x1080.jpg') center/cover fixed`,
      }}
    >
      {/* overlay */}
      <div className="min-h-screen hero-overlay">
        <SiteNav />

        {/* ── HERO ── */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <p className="glow-cyan font-pixel text-[10px] tracking-[0.3em] uppercase mb-6">
              Minecraft Tier Testing
            </p>
            <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl text-foreground glow-blue leading-tight mb-6">
              FLARE
              <br />
              TIERS
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              The official tier testing leaderboard for our Discord server.
              Compete, rank up, and prove your skills.
            </p>
            <Button
              onClick={scrollToTierList}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider px-8 py-3 text-sm shadow-glow"
              data-ocid="hero.primary_button"
            >
              VIEW ALL TIERS
            </Button>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-8 text-muted-foreground"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </section>

        {/* ── TOP 3 ── */}
        <section id="top3" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="glow-cyan font-pixel text-[9px] tracking-[0.3em] uppercase mb-3">
                Hall of Fame
              </p>
              <h2 className="font-pixel text-xl sm:text-2xl text-foreground glow-blue">
                THE TOP 3 PLAYERS
              </h2>
            </motion.div>

            {podiumLoading ? (
              <div className="flex justify-center gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-36 h-48 rounded-lg" />
                ))}
              </div>
            ) : (
              <div
                className="flex items-end justify-center gap-4 sm:gap-8"
                data-ocid="top3.section"
              >
                {/* 2nd */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <PodiumCard player={second} place={2} height="100px" />
                </motion.div>
                {/* 1st */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <PodiumCard player={first} place={1} height="140px" />
                </motion.div>
                {/* 3rd */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <PodiumCard player={third} place={3} height="80px" />
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section id="tier-list" ref={tierListRef} className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Tier List */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="font-pixel text-base sm:text-lg text-foreground mb-2">
                    CURRENT PLAYER TIER LIST
                  </h2>
                  <div className="h-0.5 bg-gradient-to-r from-primary to-transparent w-48" />
                </motion.div>

                {playersLoading ? (
                  <div
                    className="space-y-4"
                    data-ocid="tier-list.loading_state"
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : allPlayers.length === 0 ? (
                  <div
                    className="text-center py-20 text-muted-foreground"
                    data-ocid="tier-list.empty_state"
                  >
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-pixel text-xs">No players yet.</p>
                    <p className="text-sm mt-2">
                      Admins can add players from the dashboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6" data-ocid="tier-list.table">
                    {TIER_ORDER.map((tier) => {
                      const players = playersByTier[tier];
                      if (!players || players.length === 0) return null;
                      return (
                        <motion.div
                          key={tier}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <TierBadge tier={tier} size="md" />
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                              {tierNames[tier]}
                            </h3>
                          </div>
                          <div className="rounded-lg border border-border overflow-hidden bg-card/60 backdrop-blur-sm">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border bg-muted/30">
                                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider w-12">
                                    #
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    Player
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider hidden sm:table-cell">
                                    Gamemode
                                  </th>
                                  <th className="text-right px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    Points
                                  </th>
                                  <th className="text-center px-4 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider w-16">
                                    Tier
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {players.map((player, idx) => (
                                  <tr
                                    key={player.id.toString()}
                                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                                    data-ocid={`tier-list.item.${idx + 1}`}
                                  >
                                    <td className="px-4 py-3 text-muted-foreground text-sm font-mono">
                                      {idx + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <PlayerAvatar
                                          name={player.name}
                                          avatarUrl={player.avatarUrl}
                                          size="sm"
                                        />
                                        <span className="font-semibold text-foreground text-sm">
                                          {player.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell">
                                      {player.gameMode}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                                      {player.points.toString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <TierBadge tier={player.tier} size="sm" />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Sidebar */}
              <aside className="lg:w-72 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="rounded-lg border border-border bg-card/60 backdrop-blur-sm p-6"
                >
                  <h3 className="font-pixel text-xs text-foreground mb-4">
                    ABOUT FLARE TIERS
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Flare Tiers is the official tier testing leaderboard for our
                    Minecraft Discord community. Players are tested by our
                    admins across various PvP and survival scenarios and ranked
                    based on their skill level and performance.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    Join our Discord server to get tested and claim your rank!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="rounded-lg border border-border bg-card/60 backdrop-blur-sm p-6"
                >
                  <h3 className="font-pixel text-xs text-foreground mb-4">
                    TIER RULES
                  </h3>
                  <ul className="space-y-3">
                    {[
                      {
                        tier: Tier.s,
                        desc: "Reserved for the absolute best. Flawless mechanics and game sense.",
                      },
                      {
                        tier: Tier.a,
                        desc: "Elite players with exceptional skill and consistency.",
                      },
                      {
                        tier: Tier.b,
                        desc: "Above average. Solid mechanics and game knowledge.",
                      },
                      {
                        tier: Tier.c,
                        desc: "Intermediate players still improving their skills.",
                      },
                      {
                        tier: Tier.d,
                        desc: "New or beginner-level players just starting out.",
                      },
                    ].map(({ tier, desc }) => (
                      <li key={tier} className="flex items-start gap-3">
                        <TierBadge tier={tier} size="sm" />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </aside>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}

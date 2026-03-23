import { Link } from "@tanstack/react-router";
import { Sword } from "lucide-react";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Sword className="w-5 h-5 text-primary" />
            <span className="font-pixel text-xs text-foreground">
              FLARE TIERS
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <a
              href="/#tier-list"
              className="hover:text-foreground transition-colors"
            >
              Tier List
            </a>
            <a
              href="/#top3"
              className="hover:text-foreground transition-colors"
            >
              Top 3
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

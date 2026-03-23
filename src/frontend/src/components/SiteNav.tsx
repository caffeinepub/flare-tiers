import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SiteNavProps {
  showAdminButton?: boolean;
}

export default function SiteNav({ showAdminButton = true }: SiteNavProps) {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: "/" });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-border"
      data-ocid="nav.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-ocid="nav.link">
            <span className="font-pixel text-primary text-xs sm:text-sm tracking-tight leading-tight">
              FLARE
              <br />
              TIERS
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              data-ocid="nav.link"
            >
              Home
            </Link>
            <a
              href="/#tier-list"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              data-ocid="nav.link"
            >
              Tier List
            </a>
            <a
              href="/#top3"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              data-ocid="nav.link"
            >
              Top 3
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {showAdminButton && !isAuthenticated && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold tracking-wider uppercase text-xs"
                data-ocid="nav.button"
              >
                <Link to="/admin">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Login
                </Link>
              </Button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-primary font-bold tracking-wider uppercase text-xs"
                  data-ocid="nav.link"
                >
                  <Link to="/admin/dashboard">
                    <Shield className="w-3 h-3 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loginStatus === "logging-in"}
                  className="border-border text-muted-foreground hover:text-foreground font-semibold tracking-wider uppercase text-xs"
                  data-ocid="nav.button"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

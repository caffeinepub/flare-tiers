import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import SiteNav from "../components/SiteNav";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminLoginPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "User is already authenticated") {
        await clear();
        qc.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `url('/assets/generated/mc-bg.dim_1920x1080.jpg') center/cover fixed`,
      }}
    >
      <div className="min-h-screen hero-overlay flex flex-col">
        <SiteNav showAdminButton={false} />
        <main className="flex-1 flex items-center justify-center px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card
              className="bg-card/80 backdrop-blur-md border-border"
              data-ocid="admin.modal"
            >
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="font-pixel text-sm text-foreground">
                  ADMIN ACCESS
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Authenticate with Internet Identity to access the admin
                  dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-sm py-3"
                  data-ocid="admin.submit_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Only authorized admins can access the dashboard.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

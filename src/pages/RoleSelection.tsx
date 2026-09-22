import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Dumbbell, Building2, Users, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userDataService, UserRole } from "@/lib/userDataService";
import { useUserData } from "@/hooks/useUserData";
import { dashboardPathForRole } from "@/lib/roleRoutes";
import { ROLE_THEME } from "@/lib/roleTheme";
import wefitLogo from "@/assets/wefit-logo.png";

const roles: { id: string; db: UserRole; title: string; description: string; icon: typeof Store }[] = [
  { id: "user", title: "Member", description: "Workouts, nutrition, and tracking", icon: Users, db: "user" },
  { id: "vendor", title: "Meal Vendor", description: "Menu and incoming meal requests", icon: Store, db: "vendor" },
  { id: "trainer", title: "Personal Trainer", description: "Clients, sessions, and live streams", icon: Dumbbell, db: "trainer" },
  { id: "gym-owner", title: "Gym Owner", description: "Memberships and facility schedule", icon: Building2, db: "gym_owner" },
  { id: "influencer", title: "Fitness Influencer", description: "Content and partnership requests", icon: Users, db: "influencer" },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshData } = useUserData();
  const [saving, setSaving] = useState<string | null>(null);
  const selected = profile?.role ?? "user";

  const handleRoleSelect = async (db: UserRole) => {
    setSaving(db);
    try {
      await userDataService.setRole(db);
      await refreshData();
      toast({ title: "Role saved", description: "Your workspace will match this role." });
      navigate(dashboardPathForRole(db));
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not save role",
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Orbs — matches Onboarding so the funnel reads as one continuous flow */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
            <img src={wefitLogo} alt="WeFit" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">Select Your Role</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Saved to your account. Business roles get a public listing and a live revenue dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.db;
            const tint = ROLE_THEME[role.db as keyof typeof ROLE_THEME] ?? ROLE_THEME.user;

            return (
              <Card
                key={role.id}
                className={`glass cursor-pointer transition-all hover-lift ${isSelected ? "ring-2 ring-primary shadow-glow" : ""}`}
                onClick={() => { if (!saving) void handleRoleSelect(role.db); }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-11 h-11 rounded-xl ${tint.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${tint.icon}`} />
                    </div>
                    {isSelected && (
                      <span className="ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${isSelected ? "shadow-glow" : ""}`}
                    disabled={!!saving}
                  >
                    {saving === role.db ? <Loader2 className="h-4 w-4 animate-spin" /> : isSelected ? "Current role" : "Use this role"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

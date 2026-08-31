import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Dumbbell, Building2, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userDataService, UserRole } from "@/lib/userDataService";
import { useUserData } from "@/hooks/useUserData";

const roles: { id: string; db: UserRole; title: string; description: string; icon: typeof Store; color: string }[] = [
  { id: "user", title: "Member", description: "Workouts, nutrition, and tracking", icon: Users, color: "text-primary", db: "user" },
  { id: "vendor", title: "Meal Vendor", description: "Menu and incoming meal requests", icon: Store, color: "text-orange-500", db: "vendor" },
  { id: "trainer", title: "Personal Trainer", description: "Clients, sessions, and live streams", icon: Dumbbell, color: "text-blue-500", db: "trainer" },
  { id: "gym-owner", title: "Gym Owner", description: "Memberships and facility schedule", icon: Building2, color: "text-green-500", db: "gym_owner" },
  { id: "influencer", title: "Fitness Influencer", description: "Content and partnership requests", icon: Users, color: "text-purple-500", db: "influencer" },
];

function pathFor(role: UserRole) {
  if (role === "user") return "/dashboard";
  if (role === "gym_owner") return "/gym-owner-dashboard";
  return `/${role}-dashboard`;
}

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
      navigate(pathFor(db));
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient">Select Your Role</h1>
          <p className="text-muted-foreground">
            Saved to your account. Business roles get a public listing and a live revenue dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.db;

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-primary" : ""}`}
                onClick={() => { if (!saving) void handleRoleSelect(role.db); }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-8 w-8 ${role.color}`} />
                    {isSelected && (
                      <span className="ml-auto px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                        Active
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant={isSelected ? "default" : "outline"} className="w-full" disabled={!!saving}>
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

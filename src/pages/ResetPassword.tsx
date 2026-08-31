import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const { updatePassword, session, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not update password", description: error.message });
      return;
    }
    toast({ title: "Password updated", description: "You can sign in with your new password." });
    navigate("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md space-y-4">
          <h1 className="text-xl font-bold">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            Open the reset link from your email again, or request a new one from the sign-in page.
          </p>
          <Button asChild className="w-full">
            <Link to="/auth">Back to sign in</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gradient">Set a new password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}

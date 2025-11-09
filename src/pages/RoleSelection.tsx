import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Dumbbell, Building2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roles = [
  {
    id: "vendor",
    title: "Meal Vendor/Restaurant",
    description: "Manage menu items, orders, and deliveries",
    icon: Store,
    color: "text-orange-500"
  },
  {
    id: "trainer",
    title: "Personal Trainer",
    description: "Track clients, sessions, and training programs",
    icon: Dumbbell,
    color: "text-blue-500"
  },
  {
    id: "gym-owner",
    title: "Gym Owner/Facility",
    description: "Manage memberships, staff, and equipment",
    icon: Building2,
    color: "text-green-500"
  },
  {
    id: "influencer",
    title: "Fitness Influencer",
    description: "Track content, engagement, and partnerships",
    icon: Users,
    color: "text-purple-500"
  },
  {
    id: "user",
    title: "Regular User",
    description: "Access fitness plans, nutrition, and tracking",
    icon: Users,
    color: "text-primary"
  }
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>(
    localStorage.getItem("userRole") || "user"
  );

  const handleRoleSelect = (roleId: string) => {
    localStorage.setItem("userRole", roleId);
    setSelectedRole(roleId);
    
    toast({
      title: "Role Updated",
      description: `You are now viewing as ${roles.find(r => r.id === roleId)?.title}`,
    });

    // Navigate to appropriate dashboard
    if (roleId === "user") {
      navigate("/dashboard");
    } else {
      navigate(`/${roleId}-dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient">Select Your Role</h1>
          <p className="text-muted-foreground">Choose how you want to use the platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleRoleSelect(role.id)}
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
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                  >
                    {isSelected ? "Current Role" : "Select Role"}
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

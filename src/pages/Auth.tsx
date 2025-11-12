import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = (data: AuthFormData) => {
    if (isSignUp) {
      // Sign up
      const users = JSON.parse(localStorage.getItem("fitnaija_users") || "[]");
      const existingUser = users.find((u: any) => u.email === data.email);
      
      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Account already exists",
          description: "Please sign in instead.",
        });
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        email: data.email,
        password: data.password,
        name: data.name || data.email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem("fitnaija_users", JSON.stringify(users));
      
      // Auto sign in
      localStorage.setItem("fitnaija_current_user", JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }));
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to FitNaija!",
      });
      
      navigate("/onboarding");
    } else {
      // Sign in
      const users = JSON.parse(localStorage.getItem("fitnaija_users") || "[]");
      const user = users.find((u: any) => u.email === data.email && u.password === data.password);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password.",
        });
        return;
      }
      
      localStorage.setItem("fitnaija_current_user", JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      }));
      
      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.email}`,
      });
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem("fitnaija_onboarding_completed");
      if (hasCompletedOnboarding) {
        const role = localStorage.getItem("selectedRole");
        if (role) {
          navigate(`/${role}-dashboard`);
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/onboarding");
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-20"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px] float"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] float" style={{ animationDelay: '2s' }}></div>
      
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md p-8 glass shadow-premium relative z-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="font-display text-2xl font-bold">FitNaija<span className="text-primary">Coach</span></span>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Start your fitness journey today" : "Sign in to continue your journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? (
              <>Already have an account? <span className="text-primary font-semibold">Sign In</span></>
            ) : (
              <>Don't have an account? <span className="text-primary font-semibold">Sign Up</span></>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;

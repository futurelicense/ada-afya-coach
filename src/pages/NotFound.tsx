import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import wefitLogo from "@/assets/wefit-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
          <img src={wefitLogo} alt="WeFit" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-gradient mb-2">404</h1>
          <p className="text-muted-foreground">This page doesn't exist — even Ada couldn't find it.</p>
        </div>
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/dashboard"><Compass className="h-4 w-4 mr-2" /> Back to WeFit</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

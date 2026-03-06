import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell, UtensilsCrossed, Brain, TrendingUp, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-fitness.jpg";
import workoutImage from "@/assets/workout-session.jpg";
import mealImage from "@/assets/nigerian-meal.jpg";
import wefitLogo from "@/assets/wefit-logo.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  const navigate = useNavigate();
  const featuresReveal = useScrollReveal();
  const workoutReveal = useScrollReveal();
  const nutritionReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src={wefitLogo} alt="WeFit" className="w-8 h-8" />
              <span className="font-display text-xl font-bold text-gradient">WeFit</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How It Works</a>
              <a href="#community" className="text-muted-foreground hover:text-foreground transition-smooth">Community</a>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow" onClick={() => navigate("/onboarding")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px] float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] float" style={{ animationDelay: '2s' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Brain className="w-3 h-3 mr-1" />
                Powered by AI
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight">
                Train Smarter,
                <br />
                <span className="text-gradient">Live Fitter</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Your AI-powered wellness companion built for Nigerian lifestyles. Personalized workouts, local meal plans, and smart health insights — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-lg" onClick={() => navigate("/onboarding")}>
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-4">
                <div>
                  <div className="font-display text-2xl lg:text-3xl font-bold text-primary">50K+</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="font-display text-2xl lg:text-3xl font-bold text-secondary">10M+</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Calories Burned</div>
                </div>
                <div>
                  <div className="font-display text-2xl lg:text-3xl font-bold">4.9★</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 gradient-primary opacity-30 blur-3xl rounded-full"></div>
              <div className="relative overflow-hidden rounded-3xl shadow-premium card-3d">
                <img 
                  src={heroImage} 
                  alt="African woman exercising with confidence" 
                  className="w-full h-auto relative z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={featuresReveal.ref}>
          <div className="text-center mb-16">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4">
              Everything You Need
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl mb-4">
              Wellness Powered by <span className="text-gradient">Smart AI</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From personalized workouts to Nigerian meal plans, our AI understands your goals and adapts to your lifestyle.
            </p>
          </div>

          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 scroll-reveal ${featuresReveal.isVisible ? 'visible' : ''}`}>
            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">AI Workout Plans</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Customized exercise routines based on your fitness level, goals, and available equipment. Every rep counts.
              </p>
              <Link to="/workouts" className="text-primary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                Explore workouts <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>

            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">Nigerian Meal Plans</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Delicious, balanced meal recommendations featuring local dishes. From jollof to efo riro — healthy and tasty.
              </p>
              <Link to="/nutrition" className="text-secondary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                View meal plans <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>

            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">Coach Ada AI</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Your 24/7 AI wellness coach. Ask questions, get motivation, and receive personalized tips in real-time.
              </p>
              <Link to="/dashboard" className="text-primary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                Chat with Ada <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>

            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">Smart Analytics</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Track your progress with detailed insights. AI predicts plateaus and suggests adjustments to keep you moving.
              </p>
              <Link to="/analytics" className="text-secondary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                See your stats <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>

            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.5s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">Community Power</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Join thousands of Nigerians on the same journey. Share progress, compete, and stay motivated together.
              </p>
              <Link to="/community" className="text-primary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                Join community <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>

            <Card className="p-6 lg:p-8 glass shadow-card hover:shadow-premium transition-smooth border-border/50 stagger-item group overflow-hidden" style={{ animationDelay: '0.6s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl mb-3 relative z-10">Culturally Yours</h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                AI trained on Nigerian lifestyles, foods, and fitness culture. This isn't generic — it's built for you.
              </p>
              <Link to="/onboarding" className="text-secondary font-medium inline-flex items-center hover:gap-2 transition-all relative z-10">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Workout Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={workoutReveal.ref}>
          <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center scroll-reveal ${workoutReveal.isVisible ? 'visible' : ''}`}>
            <div className="order-2 lg:order-1">
              <img 
                src={workoutImage} 
                alt="Workout session in progress" 
                className="rounded-2xl lg:rounded-3xl shadow-card w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Dumbbell className="w-3 h-3 mr-1" />
                AI-Powered Training
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl">
                Your Perfect Workout,
                <br />
                <span className="text-gradient">Designed by AI</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Whether you're at home, in the gym, or outdoors, WeFit generates workouts tailored to your equipment, space, and goals. No guesswork — just results.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <div className="font-semibold">Adaptive Difficulty</div>
                    <div className="text-sm text-muted-foreground">AI adjusts intensity based on your progress and feedback</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <div className="font-semibold">Video Demonstrations</div>
                    <div className="text-sm text-muted-foreground">3D motion illustrations and proper form guidance</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <div className="font-semibold">Rest Day Intelligence</div>
                    <div className="text-sm text-muted-foreground">AI knows when to push and when to recover</div>
                  </div>
                </li>
              </ul>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow" onClick={() => navigate("/workouts")}>
                Try a Workout Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Preview Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={nutritionReveal.ref}>
          <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center scroll-reveal ${nutritionReveal.isVisible ? 'visible' : ''}`}>
            <div className="space-y-6">
              <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                Smart Nutrition
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl">
                Eat What You Love,
                <br />
                <span className="text-gradient">Stay Healthy</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI creates meal plans featuring authentic Nigerian cuisine. Every recommendation includes calories, macros, and healthier ingredient swaps — no boring diets.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 gradient-card border-border/50">
                  <div className="text-2xl font-display font-bold text-secondary mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Nigerian Dishes</div>
                </Card>
                <Card className="p-4 gradient-card border-border/50">
                  <div className="text-2xl font-display font-bold text-primary mb-1">Local</div>
                  <div className="text-sm text-muted-foreground">Ingredients</div>
                </Card>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                  <div>
                    <div className="font-semibold">Cultural Authenticity</div>
                    <div className="text-sm text-muted-foreground">From jollof rice to moi moi — real Nigerian food</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                  <div>
                    <div className="font-semibold">Macro Balancing</div>
                    <div className="text-sm text-muted-foreground">AI ensures proper protein, carbs, and fats for your goals</div>
                  </div>
                </li>
              </ul>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                <Link to="/nutrition">
                  Explore Meal Plans
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div>
              <img 
                src={mealImage} 
                alt="Delicious Nigerian healthy meal" 
                className="rounded-2xl lg:rounded-3xl shadow-card w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={ctaReveal.ref}>
          <Card className={`gradient-hero p-8 md:p-12 lg:p-16 text-center relative overflow-hidden shadow-glow scroll-reveal ${ctaReveal.isVisible ? 'visible' : ''}`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>
            <div className="relative space-y-6">
              <h2 className="font-display text-3xl md:text-5xl text-white">
                Ready to Transform Your Wellness Journey?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of Nigerians already training smarter with AI-powered fitness and nutrition.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg shadow-lg" onClick={() => navigate("/onboarding")}>
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={wefitLogo} alt="WeFit" className="w-8 h-8" />
                <span className="font-display text-xl font-bold text-gradient">WeFit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered wellness for Nigerian lifestyles.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-smooth">Pricing</Link></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-smooth">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-smooth">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-smooth">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-smooth">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about#support" className="hover:text-foreground transition-smooth">Help Center</Link></li>
                <li><Link to="/about#contact" className="hover:text-foreground transition-smooth">Contact</Link></li>
                <li><Link to="/about#privacy" className="hover:text-foreground transition-smooth">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 WeFit — Health Fitness Movement. 💚</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

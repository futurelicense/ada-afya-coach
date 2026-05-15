import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Loader2, Dumbbell, UtensilsCrossed, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { userDataService } from "@/lib/userDataService";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import wefitLogo from "@/assets/wefit-logo.png";

const STEPS = [
  { icon: "👋", label: "About you",   desc: "Let's get to know you" },
  { icon: "⚖️", label: "Body stats",  desc: "Help us personalise your plan" },
  { icon: "🎯", label: "Your goals",  desc: "What do you want to achieve?" },
  { icon: "🍽️", label: "Diet & taste", desc: "We'll pick the right Nigerian meals" },
];

const GOAL_OPTIONS = [
  { value: "lose-weight",        label: "Lose Weight",        emoji: "🔥" },
  { value: "build-muscle",       label: "Build Muscle",        emoji: "💪" },
  { value: "stay-fit",           label: "Stay Fit",            emoji: "⚡" },
  { value: "improve-endurance",  label: "Improve Endurance",   emoji: "🏃" },
];

const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Beginner",     desc: "Just starting out" },
  { value: "intermediate", label: "Intermediate", desc: "Training 2–4× per week" },
  { value: "advanced",     label: "Advanced",     desc: "Training 5+× per week" },
];

const DIET_OPTIONS = [
  { value: "everything",   label: "Everything",   emoji: "🍖" },
  { value: "vegetarian",   label: "Vegetarian",   emoji: "🥗" },
  { value: "vegan",        label: "Vegan",        emoji: "🌱" },
  { value: "pescatarian",  label: "Pescatarian",  emoji: "🐟" },
];

const Onboarding = () => {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [formData, setFormData] = useState({
    name: "", gender: "", age: "",
    weight: "", height: "",
    goal: "", fitnessLevel: "", dietPreference: "",
  });

  const totalSteps  = STEPS.length;
  const currentStep = STEPS[step - 1];

  const update = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }));

  const handleNext = async () => {
    if (step < totalSteps) { setStep(s => s + 1); return; }

    setSaving(true);
    const profile = {
      name:          formData.name || "User",
      email:         "",
      age:           parseInt(formData.age) || 25,
      fitnessLevel:  (formData.fitnessLevel || "intermediate") as "beginner" | "intermediate" | "advanced",
      goals:         formData.goal ? [formData.goal] : [],
      weight:        parseFloat(formData.weight) || 70,
      targetWeight:  parseFloat(formData.weight) || 70,
      height:        parseInt(formData.height) || 170,
      location:      "",
      joinDate:      new Date().toISOString().split("T")[0],
    };
    userDataService.saveProfile(profile);
    localStorage.setItem("wefit_onboarding_completed", "true");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id:              user.id,
        name:            profile.name,
        age:             profile.age,
        gender:          formData.gender || null,
        weight:          profile.weight,
        height:          profile.height,
        target_weight:   profile.targetWeight,
        fitness_level:   profile.fitnessLevel,
        goals:           profile.goals,
        diet_preference: formData.dietPreference || null,
      }, { onConflict: "id" });
    }

    setSaving(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(270_53%_4%)] relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <header className="flex items-center gap-2.5 p-6 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
          <img src={wefitLogo} alt="WeFit" className="w-5 h-5 object-contain" />
        </div>
        <span className="font-display font-bold text-lg text-gradient">WeFit</span>
      </header>

      {/* Step progress */}
      <div className="flex items-center gap-2 justify-center px-6 pb-8 relative z-10">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              i + 1 < step  ? "bg-primary text-white"
              : i + 1 === step ? "bg-primary/20 text-primary border border-primary/40 ring-4 ring-primary/10"
              : "bg-white/5 text-white/30 border border-white/10"
            )}>
              {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-8 sm:w-14 transition-all duration-500", i + 1 < step ? "bg-primary" : "bg-white/10")} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass border border-white/10 rounded-3xl p-7 shadow-premium">

            {/* Step header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">{currentStep.icon}</div>
              <h2 className="font-display font-black text-2xl text-white mb-1">{currentStep.label}</h2>
              <p className="text-sm text-white/50">{currentStep.desc}</p>
            </div>

            {/* Step 1 — About */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Full name</Label>
                  <Input
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => update("name", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Age</Label>
                  <Input
                    type="number"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={e => update("age", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={v => update("gender", v)} className="grid grid-cols-3 gap-2">
                    {["male", "female", "other"].map(g => (
                      <Label
                        key={g}
                        htmlFor={g}
                        className={cn(
                          "flex items-center justify-center gap-2 h-11 rounded-xl border cursor-pointer transition-all capitalize text-sm font-medium",
                          formData.gender === g
                            ? "bg-primary/20 border-primary/50 text-primary"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        )}
                      >
                        <RadioGroupItem value={g} id={g} className="sr-only" />
                        {g}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2 — Body */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Current weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 72"
                    value={formData.weight}
                    onChange={e => update("weight", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 175"
                    value={formData.height}
                    onChange={e => update("height", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 h-12 rounded-xl"
                  />
                </div>
                {formData.weight && formData.height && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-xs text-primary/80">
                      BMI: <strong>{(parseFloat(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1)}</strong> — AI will use this to calibrate your plan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — Goals */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Primary fitness goal</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_OPTIONS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update("goal", g.value)}
                        className={cn(
                          "flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all duration-200",
                          formData.goal === g.value
                            ? "bg-primary/20 border-primary/50 text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                        )}
                      >
                        <span className="text-xl">{g.emoji}</span>
                        <span className="text-sm font-medium">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Current fitness level</Label>
                  <div className="space-y-2">
                    {LEVEL_OPTIONS.map(l => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => update("fitnessLevel", l.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200",
                          formData.fitnessLevel === l.value
                            ? "bg-primary/20 border-primary/50 text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                        )}
                      >
                        <span className="text-sm font-semibold capitalize">{l.label}</span>
                        <span className="text-xs text-white/40">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Diet */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Diet preference</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIET_OPTIONS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => update("dietPreference", d.value)}
                        className={cn(
                          "flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all duration-200",
                          formData.dietPreference === d.value
                            ? "bg-secondary/20 border-secondary/50 text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                        )}
                      >
                        <span className="text-xl">{d.emoji}</span>
                        <span className="text-sm font-medium">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">What happens next</p>
                  {[
                    { icon: Dumbbell,        text: "AI generates a personalised workout plan" },
                    { icon: UtensilsCrossed, text: "Nigerian meal plans tailored to your diet" },
                    { icon: Target,          text: "Daily goals set based on your body stats" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-white/50">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 gap-3">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  className="border-white/20 text-white hover:bg-white/10 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNext}
                disabled={saving}
                className="ml-auto gap-2 shadow-glow px-6"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === totalSteps ? (saving ? "Setting up…" : "Start training 🚀") : "Continue"}
                {!saving && step < totalSteps && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

            <p className="text-center text-xs text-white/25 mt-5">
              Step {step} of {totalSteps} · Your data is kept private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

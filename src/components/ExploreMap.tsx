import { Dumbbell, MapPin, Navigation, Utensils, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const ExploreMap = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
    >
      <section className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-[#10233f]">
              <MapPin className="h-5 w-5 text-violet-600" /> Explore Fitness Locations
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Find gyms, trainers, healthy kitchens and more near you.</p>
          </div>
          <Button size="sm" variant="outline" className="gap-2 text-xs" asChild>
            <a href="https://www.google.com/maps/search/gyms+near+me+Nigeria" target="_blank" rel="noreferrer">
              <Navigation className="h-3.5 w-3.5" /> Open in Google Maps
            </a>
          </Button>
        </div>

        <div className="grid min-h-[360px] md:grid-cols-[220px_1fr]">
          <div className="space-y-1 border-b p-3 md:border-b-0 md:border-r">
            {[
              { icon: Dumbbell, label: "Gyms", meta: "124+ near you", active: true },
              { icon: User, label: "Trainers", meta: "86+ near you" },
              { icon: Utensils, label: "Healthy Kitchens", meta: "64+ near you" },
              { icon: MapPin, label: "Vendors", meta: "40+ near you" },
            ].map(({ icon: Icon, label, meta, active }) => (
              <div key={label} className={`flex items-center gap-3 rounded-xl p-3 ${active ? "bg-primary/10" : ""}`}>
                <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-[#536579]"}`} />
                <div><p className="text-xs font-bold">{label}</p><p className="text-[10px] text-muted-foreground">{meta}</p></div>
              </div>
            ))}
          </div>

          <div
            className="relative min-h-[360px] overflow-hidden bg-[#e8f4ee]"
            style={{
              backgroundImage: "linear-gradient(32deg, transparent 47%, rgba(255,255,255,.9) 48%, rgba(255,255,255,.9) 52%, transparent 53%), linear-gradient(115deg, transparent 46%, rgba(255,255,255,.85) 47%, rgba(255,255,255,.85) 51%, transparent 52%), linear-gradient(15deg, transparent 72%, rgba(203,224,236,.7) 73%, rgba(203,224,236,.7) 77%, transparent 78%)",
              backgroundSize: "180px 160px, 240px 210px, 320px 250px",
            }}
          >
            <span className="absolute left-[48%] top-[48%] text-lg font-black tracking-wide text-[#46647a]/70">Lagos</span>
            {[
              { left: "18%", top: "30%", color: "text-blue-500", label: "Bola Adebisi Gym" },
              { left: "52%", top: "18%", color: "text-pink-500", label: "" },
              { left: "68%", top: "52%", color: "text-primary", label: "Kem's Kitchen" },
              { left: "38%", top: "68%", color: "text-amber-500", label: "" },
              { left: "76%", top: "77%", color: "text-primary", label: "" },
            ].map((marker, index) => (
              <div key={index} className="absolute" style={{ left: marker.left, top: marker.top }}>
                <MapPin className={`h-7 w-7 -translate-x-1/2 -translate-y-full fill-white drop-shadow-md ${marker.color}`} />
                {marker.label && (
                  <div className="absolute left-3 top-[-42px] whitespace-nowrap rounded-lg bg-white px-2.5 py-2 text-[10px] font-bold shadow-elevated">
                    {marker.label}
                  </div>
                )}
              </div>
            ))}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8 bg-white">+</Button>
              <Button size="icon" variant="outline" className="h-8 w-8 bg-white">−</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

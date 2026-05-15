import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, Lightbulb, Loader2, Star } from "lucide-react";
import { aiService } from "@/lib/aiService";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressAnalysis {
  summary:          string
  strengths:        string[]
  areas_to_improve: string[]
  recommendations:  string[]
  weekly_score:     number
  next_week_focus?: string
}

export const AICoachPanel = () => {
  const [isAnalysing, setIsAnalysing]   = useState(false);
  const [analysis, setAnalysis]         = useState<ProgressAnalysis | null>(null);
  const { todayStats, weeklyStats }     = useUserData();
  const { toast }                       = useToast();
  const { session }                     = useAuth();

  const runAnalysis = async () => {
    if (!session) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Sign in to get your AI coach analysis.' })
      return
    }

    setIsAnalysing(true)
    try {
      const result = await aiService.analyzeProgress(weeklyStats ?? [], todayStats)
      setAnalysis(result)
    } catch (err: any) {
      const isLimit = err?.status === 429
      toast({
        variant:     'destructive',
        title:       isLimit ? 'Daily limit reached' : 'Analysis failed',
        description: isLimit
          ? "You've hit today's limit. Upgrade to Pro for more AI analyses!"
          : 'Could not analyse progress. Please try again.',
      })
    } finally {
      setIsAnalysing(false)
    }
  }

  return (
    <Card className="shadow-glow bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Coach Analysis
          <Badge variant="secondary" className="ml-auto">Powered by Claude</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <>
            <div className="p-4 bg-background/50 rounded-lg text-sm text-muted-foreground">
              Get a personalised weekly analysis from Coach Ada — including your strengths, areas to improve, and concrete recommendations for next week.
            </div>
            <Button onClick={runAnalysis} disabled={isAnalysing} className="w-full">
              {isAnalysing
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysing your progress...</>
                : <><Sparkles className="mr-2 h-4 w-4" />Analyse My Progress</>}
            </Button>
          </>
        ) : (
          <>
            {/* Score + summary */}
            <div className="p-4 bg-background/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Weekly Score</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-lg">{analysis.weekly_score}/100</span>
                </div>
              </div>
              <p className="text-sm">{analysis.summary}</p>
            </div>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h4 className="font-semibold text-green-500 text-sm">Your Strengths</h4>
                </div>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-green-500">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to improve */}
            {analysis.areas_to_improve.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-semibold text-yellow-500 text-sm">Areas to Focus</h4>
                </div>
                <ul className="space-y-1">
                  {analysis.areas_to_improve.map((area, idx) => (
                    <li key={idx} className="text-sm pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-yellow-500">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-blue-500 text-sm">Ada's Recommendations</h4>
                </div>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm pl-6 relative before:content-['💡'] before:absolute before:left-0">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next week focus */}
            {analysis.next_week_focus && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs font-semibold text-primary mb-1">Next Week's Focus</p>
                <p className="text-sm">{analysis.next_week_focus}</p>
              </div>
            )}

            <Button onClick={runAnalysis} disabled={isAnalysing} variant="secondary" className="w-full">
              {isAnalysing
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Re-analysing...</>
                : <><Sparkles className="mr-2 h-4 w-4" />Refresh Analysis</>}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

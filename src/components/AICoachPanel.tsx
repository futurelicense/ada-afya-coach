import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { aiService } from "@/lib/aiService";

export const AICoachPanel = () => {
  const analysis = aiService.analyzeProgress();
  const quote = aiService.getMotivationalQuote();

  return (
    <Card className="shadow-glow bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Coach Analysis
          <Badge variant="secondary" className="ml-auto">Powered by AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-4 bg-background/50 rounded-lg">
          <p className="font-medium text-lg">{analysis.summary}</p>
          <p className="text-sm text-muted-foreground mt-2 italic">"{quote}"</p>
        </div>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h4 className="font-semibold text-green-500">Your Strengths</h4>
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

        {/* Areas to Improve */}
        {analysis.areas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-yellow-500" />
              <h4 className="font-semibold text-yellow-500">Areas to Focus</h4>
            </div>
            <ul className="space-y-1">
              {analysis.areas.map((area, idx) => (
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
              <h4 className="font-semibold text-blue-500">AI Recommendations</h4>
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

        <Button className="w-full mt-4" variant="secondary">
          <Sparkles className="mr-2 h-4 w-4" />
          Get Detailed Analysis
        </Button>
      </CardContent>
    </Card>
  );
};

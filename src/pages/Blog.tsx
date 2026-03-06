import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const articles = [
  {
    title: "The Ultimate Guide to Nigerian Superfoods",
    excerpt: "From moringa to tiger nuts — discover the nutritional powerhouses hiding in your local market.",
    category: "Nutrition",
    readTime: "5 min read",
    date: "Feb 28, 2026",
    emoji: "🥬",
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "How to Stay Fit During Ramadan: A Nigerian Guide",
    excerpt: "Maintaining your fitness routine during fasting doesn't have to be hard. Here's how WeFit users do it.",
    category: "Fitness",
    readTime: "7 min read",
    date: "Feb 20, 2026",
    emoji: "🌙",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Egusi Soup: Nigeria's Hidden Protein Powerhouse",
    excerpt: "You've been eating one of Africa's best muscle-building foods all along. Here's the nutritional breakdown.",
    category: "Nutrition",
    readTime: "4 min read",
    date: "Feb 15, 2026",
    emoji: "🍲",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "5 Home Workouts That Require Zero Equipment",
    excerpt: "No gym? No problem. These bodyweight routines are used by WeFit's top 1% performers — in their living rooms.",
    category: "Fitness",
    readTime: "6 min read",
    date: "Feb 10, 2026",
    emoji: "💪",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Mental Health & Fitness: The Nigerian Conversation",
    excerpt: "Breaking the stigma around mental wellness in Nigeria, and how physical fitness is a powerful first step.",
    category: "Wellness",
    readTime: "8 min read",
    date: "Feb 5, 2026",
    emoji: "🧠",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Corporate Wellness in Lagos: What Top Companies Are Doing",
    excerpt: "How leading Nigerian companies are investing in employee wellness — and the ROI they're seeing.",
    category: "Corporate",
    readTime: "9 min read",
    date: "Jan 28, 2026",
    emoji: "🏢",
    color: "bg-blue-500/10 text-blue-600",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <span className="font-bold text-lg text-gradient ml-auto">WeFit</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20">WeFit Blog</Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold">
            Wellness <span className="text-gradient">Stories</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fitness tips, nutrition science, and wellness insights — all rooted in Nigerian culture.
          </p>
        </div>

        <Card className="mb-12 overflow-hidden border-primary/20 hover:shadow-xl transition-all group">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 w-fit">Featured</Badge>
              <h2 className="font-display text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                {articles[0].title}
              </h2>
              <p className="text-muted-foreground">{articles[0].excerpt}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{articles[0].readTime}</span>
                <span>·</span>
                <span>{articles[0].date}</span>
              </div>
              <Button className="w-fit shadow-glow">
                Read Article
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="min-h-48 md:min-h-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-8xl">
              {articles[0].emoji}
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1).map((article) => (
            <Card key={article.title} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border-border/50">
              <div className={`h-24 flex items-center justify-center text-5xl ${article.color.split(" ")[0]}`}>
                {article.emoji}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs ${article.color}`}>{article.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime}
                  </span>
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-sm">{article.excerpt}</CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                    Read More <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-16 p-8 md:p-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get weekly wellness tips, new Nigerian recipes, and fitness insights delivered to your inbox.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button className="shadow-glow">Subscribe</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

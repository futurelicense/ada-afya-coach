import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { aiService } from "@/lib/aiService";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! 👋 I\'m your AI fitness coach. I can help you with workout tips, nutrition advice, form corrections, and motivation. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { todayWorkouts, todayMeals, todayStats, weeklyStats } = useUserData();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    // Workout related
    if (msg.includes('workout') || msg.includes('exercise')) {
      const workoutCount = todayWorkouts.length;
      if (workoutCount === 0) {
        return "I see you haven't started your workout today. Let's begin with a warm-up! Head to the Workouts page and I'll generate a personalized plan for you. 💪";
      }
      return `Great job on your workout plan today! You have ${workoutCount} workout${workoutCount > 1 ? 's' : ''} scheduled. Remember to focus on proper form and controlled movements. Need help with any specific exercise?`;
    }
    
    // Nutrition related
    if (msg.includes('meal') || msg.includes('food') || msg.includes('nutrition') || msg.includes('eat')) {
      const calories = todayMeals.reduce((sum, m) => sum + (m.eaten ? m.calories : 0), 0);
      if (calories === 0) {
        return "You haven't logged any meals yet today. Proper nutrition is key to reaching your fitness goals! Check out the Nutrition page for Nigerian-inspired meal plans. 🍲";
      }
      return `You've consumed ${calories} calories today. Nigerian cuisine offers great nutrition - plenty of protein from beans, healthy fats from palm oil, and fiber from plantains. Stay consistent! 🌟`;
    }
    
    // Motivation
    if (msg.includes('motivat') || msg.includes('tired') || msg.includes('give up')) {
      return aiService.getMotivationalQuote() + " Remember, every workout counts and progress isn't always linear. You're doing amazing! 🔥";
    }
    
    // Progress tracking
    if (msg.includes('progress') || msg.includes('result')) {
      const weekWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);
      return `This week you've completed ${weekWorkouts} workouts and burned ${todayStats?.caloriesBurned || 0} calories today! Keep up the consistency - that's where transformation happens. 📈`;
    }
    
    // Form advice
    if (msg.includes('form') || msg.includes('technique') || msg.includes('how to')) {
      return "Proper form is crucial! Here are key tips: Keep your core tight, control the movement (don't use momentum), breathe properly (exhale on exertion), and start with lighter weights to master the technique. Which exercise would you like specific guidance on?";
    }
    
    // Recovery
    if (msg.includes('rest') || msg.includes('recovery') || msg.includes('sore')) {
      return "Rest is when muscles grow! Make sure you're getting 7-9 hours of sleep, staying hydrated (aim for 3L daily), and eating protein-rich Nigerian foods like beans and fish. Light stretching and walking can help with soreness. 💤";
    }
    
    // Default friendly responses
    const responses = [
      "That's a great question! For personalized guidance, tell me more about your specific goals or concerns. I'm here to help! 🎯",
      "I'm analyzing your progress and fitness data. Based on what I see, you're making solid progress! What specific aspect of your fitness journey would you like to focus on?",
      "Your dedication is inspiring! Let me know if you need workout modifications, nutrition tips, or motivation. I've got your back! 💪",
      "Consistency is key in fitness. Whether it's workouts, meals, or recovery - small daily actions lead to big results. What can I help you with today?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <Card className="shadow-glow h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Fitness Coach
          <Badge variant="secondary" className="ml-auto">Live Chat</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4 pt-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about fitness, nutrition, or your progress..."
            className="resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

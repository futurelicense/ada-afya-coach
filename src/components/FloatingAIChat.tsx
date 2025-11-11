import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X, Mic, Bot, User, Minimize2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  "💪 Need workout tips",
  "🍽️ Nutrition advice",
  "📊 Check my progress",
  "🔥 Motivate me!",
];

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey there! 👋 I\'m Ada, your AI fitness coach. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { todayWorkouts, todayMeals, todayStats, weeklyStats } = useUserData();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    // Workout related
    if (msg.includes('workout') || msg.includes('exercise') || msg.includes('tips')) {
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
    
    // Progress tracking
    if (msg.includes('progress') || msg.includes('result') || msg.includes('check')) {
      const weekWorkouts = weeklyStats.reduce((sum, s) => sum + s.workoutsCompleted, 0);
      return `This week you've completed ${weekWorkouts} workouts and burned ${todayStats?.caloriesBurned || 0} calories today! Keep up the consistency - that's where transformation happens. 📈`;
    }
    
    // Motivation
    if (msg.includes('motivat') || msg.includes('tired') || msg.includes('give up')) {
      const quotes = [
        "Your only limit is you. Push harder today! 💪",
        "Success is the sum of small efforts repeated daily. You've got this! 🔥",
        "The body achieves what the mind believes. Stay focused! ✨",
        "Don't wish for it, work for it! Every rep counts! 🎯",
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    // Default friendly responses
    const responses = [
      "That's a great question! For personalized guidance, tell me more about your specific goals or concerns. I'm here to help! 🎯",
      "I'm analyzing your progress. Based on what I see, you're making solid progress! What specific aspect would you like to focus on?",
      "Your dedication is inspiring! Let me know if you need workout modifications, nutrition tips, or motivation. I've got your back! 💪",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowQuickReplies(false);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(textToSend);
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

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 w-14 h-14 rounded-full shadow-premium p-0",
            "bg-gradient-to-br from-primary to-secondary",
            "hover:scale-110 transition-all duration-300 animate-scale-in",
            "bottom-20 md:bottom-6 right-6"
          )}
          aria-label="Open AI Chat"
        >
          <Sparkles className="h-6 w-6 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col transition-all duration-300",
            "bottom-20 md:bottom-6 right-6",
            "w-[calc(100vw-3rem)] md:w-96",
            isMinimized ? "h-14" : "h-[600px] max-h-[calc(100vh-10rem)]",
            "glass shadow-premium rounded-2xl border border-border/50 overflow-hidden",
            "animate-scale-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Coach Ada</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 animate-fade-in",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 shadow-card",
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                            : 'glass'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-4 w-4 text-secondary" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2 justify-start animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="glass rounded-2xl px-4 py-3 shadow-card">
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

              {/* Quick Replies */}
              {showQuickReplies && messages.length <= 1 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <Badge
                        key={reply}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all text-xs px-3 py-1"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border/50 bg-card/50">
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
                    placeholder="Ask me anything..."
                    className="resize-none min-h-[44px] max-h-[100px]"
                    rows={1}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 shrink-0"
                      title="Voice input (coming soon)"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      size="icon"
                      className="h-10 w-10 shrink-0 shadow-glow"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

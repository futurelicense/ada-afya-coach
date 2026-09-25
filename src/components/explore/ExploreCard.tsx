import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ExploreCardProps {
  title: string;
  subtitle?: string;
  rating?: number;
  location?: string;
  phone?: string;
  verified?: boolean;
  badges?: string[];
  image?: string;
  category?: string;
  categoryIcon?: ReactNode;
  children?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: ReactNode;
  featured?: boolean;
}

export const ExploreCard = ({
  title,
  subtitle,
  rating,
  location,
  phone,
  verified,
  badges,
  image,
  category,
  categoryIcon,
  children,
  onAction,
  actionLabel = "View Details",
  actionIcon,
  featured = false,
}: ExploreCardProps) => {
  return (
    <Card 
      className={cn(
        "group flex h-full min-h-[190px] overflow-hidden border-border/60 bg-white transition-all duration-300",
        "hover:border-primary/20 hover:shadow-elevated",
        featured && "ring-2 ring-primary/20"
      )}
    >
      {image && (
        <div className="relative w-[38%] min-w-[120px] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 sm:min-w-[150px]">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Category badge */}
          {category && (
            <Badge 
              className="absolute left-2 top-2 gap-1 bg-background/90 px-2 text-[10px] text-foreground backdrop-blur-sm border-0"
            >
              {categoryIcon}
              {category}
            </Badge>
          )}
          
          {/* Featured badge */}
          {featured && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          
          {/* Verified badge on image */}
          {verified && (
            <div className="absolute bottom-2 right-2 bg-primary rounded-full p-1">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      )}

      <CardContent className={cn("flex min-w-0 flex-1 flex-col space-y-2.5 p-4", !image && "pt-5")}>
        {/* Title and verification */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold leading-tight text-[#10233f] transition-colors group-hover:text-primary sm:text-base">
              {title}
            </h3>
            {!image && verified && (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            )}
          </div>
          {subtitle && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Quick info row */}
        <div className="flex items-center gap-3 text-xs">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              <span className="font-medium">{rating}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1 text-muted-foreground truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </div>
        )}

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-muted/60 px-1.5 py-0 text-[9px] font-medium"
              >
                {badge}
              </Badge>
            ))}
            {badges.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{badges.length - 3}
              </Badge>
            )}
          </div>
        )}

        {children}

        {onAction && (
          <Button 
            onClick={onAction}
            className="group/btn mt-auto h-8 w-full bg-primary text-xs hover:bg-primary/90"
            size="sm"
          >
            <span className="flex-1 text-left">{actionLabel}</span>
            {actionIcon || <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

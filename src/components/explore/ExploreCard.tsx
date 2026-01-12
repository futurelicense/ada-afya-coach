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
        "group h-full overflow-hidden border-border/50 transition-all duration-300",
        "hover:shadow-elevated hover:border-primary/20 hover:-translate-y-1",
        featured && "ring-2 ring-primary/20"
      )}
    >
      {/* Image Header */}
      {image && (
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Category badge */}
          {category && (
            <Badge 
              className="absolute top-3 left-3 gap-1.5 bg-background/90 backdrop-blur-sm text-foreground border-0"
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
            <div className="absolute bottom-3 right-3 bg-primary rounded-full p-1">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      )}

      <CardContent className={cn("p-4 space-y-3", !image && "pt-5")}>
        {/* Title and verification */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            {!image && verified && (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
          )}
        </div>

        {/* Quick info row */}
        <div className="flex items-center gap-4 text-sm">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{rating}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1 text-muted-foreground truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{phone}</span>
          </div>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-muted/50"
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

        {/* Custom content */}
        {children}

        {/* Action button */}
        {onAction && (
          <Button 
            onClick={onAction}
            variant="outline"
            className="w-full group/btn hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
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

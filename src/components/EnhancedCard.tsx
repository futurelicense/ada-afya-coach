import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

interface EnhancedCardProps {
  title: string;
  subtitle?: string;
  rating?: number;
  location?: string;
  phone?: string;
  verified?: boolean;
  badges?: string[];
  children?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: ReactNode;
}

export const EnhancedCard = ({
  title,
  subtitle,
  rating,
  location,
  phone,
  verified,
  badges,
  children,
  onAction,
  actionLabel,
  actionIcon,
}: EnhancedCardProps) => {
  return (
    <Card className="group h-full hover-lift overflow-hidden border-primary/10">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          {verified && (
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rating and Location */}
        <div className="space-y-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold">{rating}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Custom content */}
        {children}

        {/* Action button */}
        {onAction && (
          <Button 
            onClick={onAction}
            className="w-full shadow-glow"
            size="sm"
          >
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

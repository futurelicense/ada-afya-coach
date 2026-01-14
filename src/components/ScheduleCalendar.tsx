import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, User, MapPin, Trash2, Edit2 } from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: string;
  type: string;
  client?: string;
  location?: string;
}

interface ScheduleCalendarProps {
  title: string;
  description: string;
  eventTypes: { value: string; label: string; color: string }[];
  storageKey: string;
  clientLabel?: string;
  showClient?: boolean;
  showLocation?: boolean;
}

const getStoredEvents = (key: string): ScheduleEvent[] => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const events = JSON.parse(stored);
      return events.map((e: ScheduleEvent) => ({
        ...e,
        date: new Date(e.date)
      }));
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
  return [];
};

const saveEvents = (key: string, events: ScheduleEvent[]) => {
  localStorage.setItem(key, JSON.stringify(events));
};

export const ScheduleCalendar = ({
  title,
  description,
  eventTypes,
  storageKey,
  clientLabel = "Client",
  showClient = true,
  showLocation = true
}: ScheduleCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>(() => getStoredEvents(storageKey));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "09:00",
    duration: "1h",
    type: eventTypes[0]?.value || "",
    client: "",
    location: ""
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      time: "09:00",
      duration: "1h",
      type: eventTypes[0]?.value || "",
      client: "",
      location: ""
    });
    setEditingEvent(null);
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields",
        variant: "destructive"
      });
      return;
    }

    const newEvent: ScheduleEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: startOfDay(selectedDate),
      time: formData.time,
      duration: formData.duration,
      type: formData.type,
      client: formData.client,
      location: formData.location
    };

    let updatedEvents: ScheduleEvent[];
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? newEvent : e);
      toast({
        title: "Event Updated",
        description: `${newEvent.title} has been updated`
      });
    } else {
      updatedEvents = [...events, newEvent];
      toast({
        title: "Event Added",
        description: `${newEvent.title} scheduled for ${format(selectedDate, "MMM d, yyyy")} at ${formData.time}`
      });
    }

    setEvents(updatedEvents);
    saveEvents(storageKey, updatedEvents);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(storageKey, updatedEvents);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your schedule"
    });
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      time: event.time,
      duration: event.duration,
      type: event.type,
      client: event.client || "",
      location: event.location || ""
    });
    setSelectedDate(new Date(event.date));
    setIsAddDialogOpen(true);
  };

  const selectedDayEvents = events
    .filter(event => isSameDay(new Date(event.date), selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType?.color || "bg-primary/20 text-primary";
  };

  const datesWithEvents = events.map(e => startOfDay(new Date(e.date)));

  return (
    <Card className="border-primary/10">
      <CardHeader className="border-b bg-gradient-to-r from-card to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent 
                    ? "Update the event details below"
                    : `Schedule an event for ${format(selectedDate, "MMMM d, yyyy")}`
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30m">30 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="1.5h">1.5 hours</SelectItem>
                        <SelectItem value="2h">2 hours</SelectItem>
                        <SelectItem value="3h">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showClient && (
                  <div className="grid gap-2">
                    <Label htmlFor="client">{clientLabel}</Label>
                    <Input
                      id="client"
                      placeholder={`Enter ${clientLabel.toLowerCase()} name`}
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    />
                  </div>
                )}
                {showLocation && (
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="description">Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Calendar */}
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className={cn("rounded-md border pointer-events-auto")}
              modifiers={{
                hasEvent: datesWithEvents
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "hsl(var(--primary))",
                  textUnderlineOffset: "4px"
                }
              }}
            />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {events.length} total event{events.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <Badge variant="outline">
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No events scheduled for this day</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Add an event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
                              {eventTypes.find(t => t.value === event.type)?.label || event.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time} ({event.duration})
                            </span>
                          </div>
                          <h4 className="font-medium">{event.title}</h4>
                          {event.client && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {event.client}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;

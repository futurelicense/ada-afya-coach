import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, TrendingUp, Video, Clock, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TrainerDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 gradient-primary opacity-5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">Trainer Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your clients and training sessions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 stagger-item">
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">24</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +3 this month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">18 Sessions</div>
            <p className="text-xs text-muted-foreground mt-1">5 today</p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">156</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group shimmer">
          <div className="absolute inset-0 gradient-premium opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gradient">4.9</div>
            <p className="text-xs text-muted-foreground mt-1">Based on 45 reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="clients" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Clients</TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Schedule</TabsTrigger>
          <TabsTrigger value="programs" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Training Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
              <CardDescription>Track your client progress and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Next Session</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Tunde Adeyemi</TableCell>
                    <TableCell>Weight Loss</TableCell>
                    <TableCell>65%</TableCell>
                    <TableCell>Today, 3:00 PM</TableCell>
                    <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ngozi Okeke</TableCell>
                    <TableCell>Muscle Building</TableCell>
                    <TableCell>42%</TableCell>
                    <TableCell>Tomorrow, 9:00 AM</TableCell>
                    <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your upcoming training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "9:00 AM", client: "John Doe", type: "1-on-1 Training" },
                  { time: "11:00 AM", client: "Jane Smith", type: "Group Session" },
                  { time: "3:00 PM", client: "Tunde Adeyemi", type: "Progress Check" }
                ].map((session) => (
                  <div key={session.time} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{session.time}</h4>
                        <p className="text-sm text-muted-foreground">{session.client} - {session.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Start Session</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Training Programs</CardTitle>
                <CardDescription>Manage your workout programs</CardDescription>
              </div>
              <Button>Create Program</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Beginner Fat Loss", "Advanced Muscle Building", "HIIT Conditioning", "Strength Training"].map((program) => (
                  <div key={program} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{program}</h4>
                      <p className="text-sm text-muted-foreground">8 weeks • 12 clients enrolled</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainerDashboard;

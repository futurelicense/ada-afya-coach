import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, Dumbbell, Calendar, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GymOwnerDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 gradient-primary opacity-5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">Gym Owner Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your facility and memberships</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 stagger-item">
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">342</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +18 this month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group shimmer">
          <div className="absolute inset-0 gradient-premium opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gradient">₦1.2M</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">78%</div>
            <p className="text-xs text-muted-foreground mt-1">Current capacity</p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group border-destructive/20">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground mt-1">Memberships this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="members" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Members</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Staff</TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Equipment</TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Classes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Overview</CardTitle>
              <CardDescription>Track memberships and renewals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Membership Type</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Adeola Williams</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Feb 28, 2025</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs">Active</span></TableCell>
                    <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ibrahim Musa</TableCell>
                    <TableCell>Basic</TableCell>
                    <TableCell>Jan 15, 2025</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs">Expiring Soon</span></TableCell>
                    <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>Manage trainers and employees</CardDescription>
              </div>
              <Button>Add Staff</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Coach Mike", role: "Head Trainer", clients: 15 },
                  { name: "Sarah Johnson", role: "Trainer", clients: 12 },
                  { name: "David Obi", role: "Receptionist", clients: 0 }
                ].map((staff) => (
                  <div key={staff.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.role} {staff.clients > 0 && `• ${staff.clients} clients`}</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
              <CardDescription>Monitor equipment condition and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Treadmill #1", status: "Good", maintenance: "Next: Mar 15" },
                  { name: "Bench Press", status: "Needs Service", maintenance: "Overdue" },
                  { name: "Rowing Machine", status: "Good", maintenance: "Next: Apr 1" }
                ].map((equipment) => (
                  <div key={equipment.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{equipment.name}</h4>
                      <p className="text-sm text-muted-foreground">{equipment.status} • {equipment.maintenance}</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Schedule</CardTitle>
                <CardDescription>Manage group fitness classes</CardDescription>
              </div>
              <Button>Add Class</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Morning Yoga", time: "6:00 AM", instructor: "Sarah", capacity: "15/20" },
                  { name: "HIIT Bootcamp", time: "6:00 PM", instructor: "Mike", capacity: "20/20" },
                  { name: "Spin Class", time: "7:00 PM", instructor: "David", capacity: "12/15" }
                ].map((cls) => (
                  <div key={cls.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">{cls.time} • {cls.instructor} • {cls.capacity}</p>
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

export default GymOwnerDashboard;

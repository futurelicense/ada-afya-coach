import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, Dumbbell, Calendar, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GymOwnerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Gym Owner Dashboard</h1>
        <p className="text-muted-foreground">Manage your facility and memberships</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+18 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦1.2M</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Current capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Memberships this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
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

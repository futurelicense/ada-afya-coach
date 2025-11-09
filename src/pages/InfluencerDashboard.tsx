import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Heart, Eye, Share2, Video } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InfluencerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground">Track your fitness content and engagement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">+1.2K this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active collaborations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest fitness content</CardDescription>
              </div>
              <Button>Create Post</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>30-Min HIIT Workout</TableCell>
                    <TableCell>Instagram</TableCell>
                    <TableCell>45.2K</TableCell>
                    <TableCell>3.8K</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs">Live</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Meal Prep Guide</TableCell>
                    <TableCell>YouTube</TableCell>
                    <TableCell>120K</TableCell>
                    <TableCell>9.6K</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs">Live</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Track your content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Follower Growth</h4>
                      <p className="text-sm text-muted-foreground">+1,234 this week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">+15%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Average Views</h4>
                      <p className="text-sm text-muted-foreground">Per post</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">42.5K</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-semibold">Engagement Rate</h4>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">8.4%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Brand Collaborations</CardTitle>
                <CardDescription>Manage your partnerships</CardDescription>
              </div>
              <Button>New Partnership</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { brand: "FitGear Nigeria", type: "Product Review", status: "Active", payment: "₦150,000" },
                  { brand: "HealthHub", type: "Sponsored Content", status: "Active", payment: "₦200,000" },
                  { brand: "NutriMax", type: "Ambassador", status: "Pending", payment: "₦100,000" }
                ].map((partnership) => (
                  <div key={partnership.brand} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{partnership.brand}</h4>
                      <p className="text-sm text-muted-foreground">{partnership.type} • {partnership.payment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        partnership.status === "Active" 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-yellow-500/20 text-yellow-600"
                      }`}>
                        {partnership.status}
                      </span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
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

export default InfluencerDashboard;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Heart, Eye, Share2, Video } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InfluencerDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 gradient-primary opacity-5 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">Influencer Dashboard</h1>
          <p className="text-muted-foreground text-lg">Track your fitness content and engagement</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 stagger-item">
        <Card className="hover-lift overflow-hidden relative group shimmer">
          <div className="absolute inset-0 gradient-premium opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gradient">45.2K</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +1.2K this month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">8.4%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +0.5% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">1.2M</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="hover-lift overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">12</div>
            <p className="text-xs text-muted-foreground mt-1">Active collaborations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="content" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Content</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Analytics</TabsTrigger>
          <TabsTrigger value="partnerships" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Partnerships</TabsTrigger>
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

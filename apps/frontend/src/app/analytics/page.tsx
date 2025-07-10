import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Target,
  Activity,
  Download,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your stream performance and audience engagement.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stream Time
              </CardTitle>
              <Icon icon={Clock} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127h 32m</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Viewers
              </CardTitle>
              <Icon icon={Users} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chat Engagement
              </CardTitle>
              <Icon
                icon={MessageSquare}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Response Rate
              </CardTitle>
              <Icon icon={Target} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Viewer Growth</CardTitle>
              <CardDescription>Monthly viewer count trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Icon
                    icon={BarChart3}
                    className="h-12 w-12 text-muted-foreground mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Chart visualization
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Viewer growth over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Chat activity and interaction rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Icon
                    icon={TrendingUp}
                    className="h-12 w-12 text-muted-foreground mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Chart visualization
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Engagement trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Game Performance</CardTitle>
            <CardDescription>
              Viewer engagement by game category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Mobile Legends: Bang Bang</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">1,456 avg viewers</div>
                  <div className="text-sm text-muted-foreground">
                    89% engagement
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Free Fire</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">1,234 avg viewers</div>
                  <div className="text-sm text-muted-foreground">
                    92% engagement
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium">Valorant</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">987 avg viewers</div>
                  <div className="text-sm text-muted-foreground">
                    85% engagement
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium">GTA V</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">756 avg viewers</div>
                  <div className="text-sm text-muted-foreground">
                    78% engagement
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader>
            <CardTitle>AI Response Performance</CardTitle>
            <CardDescription>
              AI response accuracy and effectiveness metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-muted-foreground">
                  Accuracy Rate
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">7.2%</div>
                <div className="text-sm text-muted-foreground">
                  Response Rate
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.3s</div>
                <div className="text-sm text-muted-foreground">
                  Avg Response Time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download analytics reports and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Download} className="h-8 w-8 mb-2" />
                <span className="font-medium">Monthly Report</span>
                <span className="text-sm text-muted-foreground">
                  PDF format
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Download} className="h-8 w-8 mb-2" />
                <span className="font-medium">Raw Data</span>
                <span className="text-sm text-muted-foreground">
                  CSV format
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Download} className="h-8 w-8 mb-2" />
                <span className="font-medium">Charts</span>
                <span className="text-sm text-muted-foreground">
                  PNG format
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

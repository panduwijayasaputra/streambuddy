import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { GameIcon } from "@/components/ui/game-icon";

import {
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your stream.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Viewers
              </CardTitle>
              <Icon icon={Eye} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chat Messages
              </CardTitle>
              <Icon
                icon={MessageSquare}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">567</div>
              <p className="text-xs text-muted-foreground">
                +8% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Responses
              </CardTitle>
              <Icon icon={Zap} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                15.7% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Icon icon={Heart} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last stream
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Game & Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Game</CardTitle>
              <CardDescription>What you're currently streaming</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <GameIcon game="Mobile Legends: Bang Bang" size="lg" />
                <div>
                  <h3 className="font-semibold">Mobile Legends: Bang Bang</h3>
                  <p className="text-sm text-muted-foreground">
                    Streaming for 2h 15m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest stream events and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon icon={Users} className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New follower: @gamer123
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon
                    icon={MessageSquare}
                    className="h-4 w-4 text-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      AI responded to @viewer456
                    </p>
                    <p className="text-xs text-muted-foreground">
                      5 minutes ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon icon={TrendingUp} className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Viewer count peaked at 1,456
                    </p>
                    <p className="text-xs text-muted-foreground">
                      10 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Icon icon={Activity} className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Start Overlay</p>
                  <p className="text-sm text-muted-foreground">
                    Launch stream overlay
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Icon icon={MessageSquare} className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Chat Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Configure AI responses
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Icon icon={TrendingUp} className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Check performance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

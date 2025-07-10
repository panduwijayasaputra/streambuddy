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
  MessageSquare,
  Bot,
  Settings,
  Play,
  Pause,
  Zap,
  Filter,
  Users,
  TrendingUp,
} from "lucide-react";

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Processing</h1>
          <p className="text-muted-foreground">
            Monitor and configure AI responses for your chat.
          </p>
        </div>

        {/* AI Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Bot} className="h-5 w-5" />
              <span>AI Response Status</span>
            </CardTitle>
            <CardDescription>
              Current AI processing status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Active</span>
                <span className="text-sm text-muted-foreground">
                  Processing chat messages
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Icon icon={Pause} className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button variant="outline" size="sm">
                  <Icon icon={Settings} className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Messages Processed
              </CardTitle>
              <Icon
                icon={MessageSquare}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Responses
              </CardTitle>
              <Icon icon={Bot} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                7.2% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Filtered Messages
              </CardTitle>
              <Icon icon={Filter} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">1.9% filter rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Icon icon={Users} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Configuration */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Settings</CardTitle>
              <CardDescription>Configure AI response behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Style</span>
                  <span className="text-sm text-muted-foreground">
                    Casual & Friendly
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Max Response Length
                  </span>
                  <span className="text-sm text-muted-foreground">
                    100 characters
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Confidence Threshold
                  </span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Delay</span>
                  <span className="text-sm text-muted-foreground">
                    2-5 seconds
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Filtering</CardTitle>
              <CardDescription>Manage content filtering rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profanity Filter</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Spam Detection</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toxicity Filter</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-moderation</span>
                  <div className="h-6 w-11 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Responses</CardTitle>
            <CardDescription>
              Latest AI-generated responses and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Icon icon={Bot} className="h-5 w-5 text-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">@gamer123</span>
                    <span className="text-xs text-muted-foreground">
                      2 min ago
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    "What's your favorite hero?"
                  </p>
                  <p className="text-sm">
                    "I love playing as Layla! Her range is amazing for team
                    fights. What about you?"
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Confidence: 92%
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Mobile Legends
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Icon icon={Bot} className="h-5 w-5 text-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">@viewer456</span>
                    <span className="text-xs text-muted-foreground">
                      5 min ago
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    "How do you stay so calm during ranked?"
                  </p>
                  <p className="text-sm">
                    "Deep breaths and focus on objectives! Don't let toxic
                    teammates get to you. Stay positive!"
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Confidence: 88%
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Gaming Tips
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Icon icon={Filter} className="h-5 w-5 text-red-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">@user789</span>
                    <span className="text-xs text-muted-foreground">
                      8 min ago
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    [Message filtered]
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Profanity Filter
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

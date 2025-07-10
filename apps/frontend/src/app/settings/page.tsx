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
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your StreamBuddy preferences and account settings.
          </p>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={User} className="h-5 w-5" />
              <span>Account Settings</span>
            </CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Display Name</p>
                  <p className="text-sm text-muted-foreground">
                    StreamBuddy User
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    user@streambuddy.com
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed 30 days ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Globe} className="h-5 w-5" />
              <span>Platform Connections</span>
            </CardTitle>
            <CardDescription>
              Connect your streaming platforms and social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <div>
                    <p className="font-medium">Twitch</p>
                    <p className="text-sm text-muted-foreground">
                      Connected as @streamer123
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Y</span>
                  </div>
                  <div>
                    <p className="font-medium">YouTube</p>
                    <p className="text-sm text-muted-foreground">
                      Not connected
                    </p>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <div>
                    <p className="font-medium">Discord</p>
                    <p className="text-sm text-muted-foreground">
                      Connected as StreamBuddy#1234
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Key} className="h-5 w-5" />
              <span>AI Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure AI response settings and API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">OpenAI API Key</p>
                  <p className="text-sm text-muted-foreground">
                    Configured • Last used 2 hours ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Anthropic API Key</p>
                  <p className="text-sm text-muted-foreground">
                    Configured • Last used 1 hour ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Response Style</p>
                  <p className="text-sm text-muted-foreground">
                    Casual & Friendly
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Palette} className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of StreamBuddy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    System (follows your OS)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Time Zone</p>
                  <p className="text-sm text-muted-foreground">
                    UTC+7 (Asia/Jakarta)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Bell} className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Weekly reports and updates
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-green-500"></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time alerts
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-green-500"></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stream Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    When you go live
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon icon={Database} className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Manage your data and exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Export My Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Download Analytics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon icon={Shield} className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>Security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

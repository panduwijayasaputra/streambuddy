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
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Palette,
  Type,
} from "lucide-react";

export default function OverlayPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overlay</h1>
          <p className="text-muted-foreground">
            Configure and manage your stream overlays.
          </p>
        </div>

        {/* Overlay Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={Monitor} className="h-5 w-5" />
              <span>Overlay Status</span>
            </CardTitle>
            <CardDescription>
              Current overlay configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Active</span>
                <span className="text-sm text-muted-foreground">
                  Running on OBS
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Icon icon={Eye} className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Icon icon={Settings} className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overlay URL */}
        <Card>
          <CardHeader>
            <CardTitle>Overlay URL</CardTitle>
            <CardDescription>
              Add this URL to your OBS browser source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value="http://localhost:3000/overlay/chat"
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
              />
              <Button variant="outline" size="sm">
                <Icon icon={Copy} className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Icon icon={ExternalLink} className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overlay Components */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon icon={Type} className="h-5 w-5" />
                <span>Chat Display</span>
              </CardTitle>
              <CardDescription>Show chat messages on stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enabled</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Show Usernames</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Show Timestamps</span>
                  <div className="h-6 w-11 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Message Duration</span>
                  <span className="text-sm text-muted-foreground">
                    5 seconds
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon icon={Palette} className="h-5 w-5" />
                <span>AI Responses</span>
              </CardTitle>
              <CardDescription>Display AI-generated responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enabled</span>
                  <div className="h-6 w-11 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Show Confidence</span>
                  <div className="h-6 w-11 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Style</span>
                  <span className="text-sm text-muted-foreground">Casual</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Length</span>
                  <span className="text-sm text-muted-foreground">
                    100 chars
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common overlay tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Monitor} className="h-8 w-8 mb-2" />
                <span className="font-medium">Launch Overlay</span>
                <span className="text-sm text-muted-foreground">
                  Open in browser
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Settings} className="h-8 w-8 mb-2" />
                <span className="font-medium">Customize</span>
                <span className="text-sm text-muted-foreground">
                  Edit appearance
                </span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Icon icon={Eye} className="h-8 w-8 mb-2" />
                <span className="font-medium">Test Mode</span>
                <span className="text-sm text-muted-foreground">
                  Preview with sample data
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Settings" 
        description="Manage system configuration and preferences"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="data-card p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">System Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution Name</Label>
                  <Input defaultValue="University of Technology" />
                </div>
                <div className="space-y-2">
                  <Label>System Code</Label>
                  <Input defaultValue="IKNOW-V2" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year Format</Label>
                  <Input defaultValue="YYYY/YY" />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Input defaultValue="English" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Display Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Use condensed spacing in tables and lists</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Course Codes</p>
                    <p className="text-sm text-muted-foreground">Display course codes alongside names</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="data-card p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enrollment Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about enrollment period changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rule Violations</p>
                    <p className="text-sm text-muted-foreground">Alert when enrollment rules are triggered</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Accreditation Reminders</p>
                    <p className="text-sm text-muted-foreground">Remind about upcoming accreditation deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="data-card p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Access Control</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all administrative actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

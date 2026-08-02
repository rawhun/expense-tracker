"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logout } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  name: string;
  email: string;
  currency: string;
};

export default function SettingsClient({ name, email, currency }: Props) {
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(name);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: selectedCurrency }),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      toast.success("Preferences saved successfully!");
    } catch {
      toast.error("Failed to update preferences.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 flex-1 max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        {/* Profile */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Preferences */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage currency and theme settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={selectedCurrency} onValueChange={(val) => setSelectedCurrency(val ?? selectedCurrency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(val) => setTheme(val ?? "system")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4">
            <Button onClick={handleSavePreferences}>Update Preferences</Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5 glass">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="text-sm">Sign out of your account on this device.</div>
              <form action={logout}>
                <Button variant="outline" type="submit" className="text-destructive hover:bg-destructive/10 border-destructive/20">
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

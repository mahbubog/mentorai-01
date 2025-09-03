import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Bell, Palette } from "lucide-react";
import { Database, Json } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

// Define an interface for preferences to ensure type safety
interface UserPreferences {
  tone: string;
  language: string;
  theme: string;
  notifications: boolean;
  [key: string]: Json | undefined; // Add index signature to make it compatible with Supabase's Json type
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{
    name: string;
    role: UserRole;
    preferences: UserPreferences; // Use the new interface here
  }>({
    name: "",
    role: "student",
    preferences: {
      tone: "academic",
      language: "en",
      theme: "system",
      notifications: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile settings.",
        });
      }

      if (data) {
        // Ensure data.preferences is treated as UserPreferences or default
        const loadedPreferences: UserPreferences = (data.preferences as unknown as UserPreferences) || { // Cast to unknown first, then to UserPreferences
          tone: "academic",
          language: "en",
          theme: "system",
          notifications: true
        };

        setProfile({
          name: data.name,
          role: data.role,
          preferences: loadedPreferences
        });
      }
    };

    loadProfile();
  }, [navigate, toast]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          role: profile.role,
          preferences: profile.preferences
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={profile.role}
                  onValueChange={(value: UserRole) => setProfile({ ...profile, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="job_seeker">Job Seeker</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                AI Preferences
              </CardTitle>
              <CardDescription>
                Customize how the AI assistant responds to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Response Tone</Label>
                <Select
                  value={profile.preferences.tone}
                  onValueChange={(value) => 
                    setProfile({ 
                      ...profile, 
                      preferences: { ...profile.preferences, tone: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={profile.preferences.language}
                  onValueChange={(value) => 
                    setProfile({ 
                      ...profile, 
                      preferences: { ...profile.preferences, language: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new responses and updates
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.notifications}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, notifications: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button onClick={handleSave} disabled={loading}>
              Save Changes
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
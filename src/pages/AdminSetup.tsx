import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("admin@atlaasgo.ma");
  const [password, setPassword] = useState("Admin@2024");
  const [fullName, setFullName] = useState("AtlaasGo Admin");

  useEffect(() => {
    checkExistingAdmin();
  }, []);

  const checkExistingAdmin = async () => {
    try {
      // Check if any admin already exists
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        toast.error("Admin account already exists. Please use /auth to login.");
        navigate("/auth");
        return;
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up the admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Ensure we're authenticated before inserting role
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Wait a bit for the trigger to create the profile
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Assign admin role (first admin policy allows this)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      toast.success("Admin account created successfully!");

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Super Admin</CardTitle>
          <CardDescription>
            Set up the first admin account for AtlaasGo platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter admin name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@atlaasgo.ma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter secure password"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters required
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Default Credentials:</strong><br />
              Email: admin@atlaasgo.ma<br />
              Password: Admin@2024
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You can change these before creating the account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
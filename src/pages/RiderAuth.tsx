import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bike, ArrowLeft, Wallet, MapPin, Clock } from "lucide-react";
import { signUpSchema, signInSchema } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

const RiderAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (roles?.some(r => r.role === 'rider')) navigate("/rider");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validatedData = signUpSchema.parse({ email: email.trim(), password, fullName: fullName.trim() });
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: { data: { full_name: validatedData.fullName }, emailRedirectTo: `${window.location.origin}/rider` },
      });
      if (error) throw error;
      if (data.user) {
        const { error: roleError } = await supabase.rpc("assign_rider_role", { user_id_param: data.user.id });
        if (roleError) throw roleError;
      }
      toast({ title: "Check your email!", description: "We've sent you a verification link to activate your rider account." });
    } catch (error: any) {
      toast({ title: "Error", description: error.errors?.[0]?.message || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validatedData = signInSchema.parse({ email: email.trim(), password });
      const { data, error } = await supabase.auth.signInWithPassword({ email: validatedData.email, password: validatedData.password });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (!roles?.some(r => r.role === 'rider')) {
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a rider.");
      }
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      navigate("/rider");
    } catch (error: any) {
      toast({ title: "Error", description: error.errors?.[0]?.message || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 zellij-pattern relative overflow-hidden">
      <div className="absolute top-32 -left-24 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 -right-24 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        className="w-full max-w-md p-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          className="bg-card rounded-3xl shadow-xl p-8 border border-border/50 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div className="flex items-center justify-center gap-3 mb-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Bike className="w-7 h-7 text-primary" />
            </div>
          </motion.div>
          <motion.h1 className="text-3xl font-bold text-center mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Rider <span className="text-primary">Portal</span>
          </motion.h1>
          <motion.p className="text-center text-muted-foreground text-sm mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Deliver orders and earn money
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            {[
              { icon: Wallet, label: "Earn" },
              { icon: MapPin, label: "Navigate" },
              { icon: Clock, label: "Flexible" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <badge.icon className="w-3.5 h-3.5 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
              <TabsTrigger value="signin" className="data-[state=active]:shadow-sm transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:shadow-sm transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="signin" key="signin">
                <motion.form onSubmit={handleSignIn} className="space-y-4" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="rider@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Signing in...
                      </motion.div>
                    ) : "Sign In as Rider"}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup" key="signup">
                <motion.form onSubmit={handleSignUp} className="space-y-4" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" type="text" placeholder="Ahmed Benali" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="rider@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-11 transition-all focus:scale-[1.01]" />
                    <p className="text-xs text-muted-foreground">8+ characters with uppercase, lowercase, and number</p>
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                        Creating account...
                      </motion.div>
                    ) : "Sign Up as Rider"}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <motion.p className="text-center text-xs text-muted-foreground mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            By continuing, you agree to ATLAAS GO's{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">Terms</a> and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RiderAuth;

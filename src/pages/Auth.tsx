import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, ArrowLeft, Shield, Zap, Sparkles, Store, Bike, User, Mail } from "lucide-react";
import { signUpSchema, signInSchema } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

type UserRole = "customer" | "merchant" | "rider";

type UserRoleRow = {
  role: UserRole | "admin" | "super_admin";
};

const PENDING_ROLE_KEY = "atlaas_pending_role";

const ROLE_CONFIG: Record<UserRole, { icon: typeof MapPin; label: string; color: string; desc: string }> = {
  customer: { icon: User, label: "Customer", color: "bg-primary/10 text-primary", desc: "Order food from Morocco's best restaurants" },
  merchant: { icon: Store, label: "Restaurant", color: "bg-accent/10 text-accent-foreground", desc: "Manage your restaurant and orders" },
  rider: { icon: Bike, label: "Rider", color: "bg-primary/10 text-primary", desc: "Deliver orders and earn money" },
};

interface AuthProps {
  defaultRole?: UserRole;
}

const Auth = ({ defaultRole }: AuthProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const authHandledRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole || "customer");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const getPreferredRole = (): UserRole => {
    const roleFromQuery = searchParams.get("role") as UserRole | null;
    if (roleFromQuery && ROLE_CONFIG[roleFromQuery]) return roleFromQuery;
    return defaultRole || "customer";
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchUserRoles = async (userId: string, retries = 5): Promise<UserRoleRow[]> => {
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        return data as UserRoleRow[];
      }

      if (attempt < retries - 1) {
        await wait(400);
      }
    }

    return [];
  };

  const assignRoleIfNeeded = async (userId: string, role: UserRole | null) => {
    if (!role || role === "customer") return;

    const existingRoles = await fetchUserRoles(userId, 2);
    if (existingRoles.some((entry) => entry.role === role)) return;

    const { error } = await supabase.rpc(
      role === "merchant" ? "assign_merchant_role" : "assign_rider_role",
      { user_id_param: userId }
    );

    if (error) {
      throw error;
    }
  };

  const redirectByRole = async (userId: string, preferredRole?: UserRole | null) => {
    const roles = await fetchUserRoles(userId);

    if (preferredRole && roles.some((entry) => entry.role === preferredRole)) {
      if (preferredRole === "merchant") {
        navigate("/lyn-dashboard", { replace: true });
        return;
      }
      if (preferredRole === "rider") {
        navigate("/rider", { replace: true });
        return;
      }
      navigate("/customer", { replace: true });
      return;
    }

    if (roles.some((entry) => entry.role === "admin")) navigate("/admin", { replace: true });
    else if (roles.some((entry) => entry.role === "merchant")) navigate("/lyn-dashboard", { replace: true });
    else if (roles.some((entry) => entry.role === "rider")) navigate("/rider", { replace: true });
    else navigate("/customer", { replace: true });
  };

  const handlePostAuthRedirect = async (userId: string, explicitRole?: UserRole | null) => {
    const pendingRole = localStorage.getItem(PENDING_ROLE_KEY) as UserRole | null;
    const preferredRole = explicitRole || pendingRole || getPreferredRole();

    // Always try to assign the role chosen in the UI or pending OAuth role
    const roleToAssign = explicitRole || pendingRole || preferredRole;

    try {
      await assignRoleIfNeeded(userId, roleToAssign);
    } catch (error) {
      console.error("Error assigning pending role:", error);
      toast({
        title: "Role setup issue",
        description: "We signed you in, but your account role could not be applied yet.",
        variant: "destructive",
      });
    } finally {
      localStorage.removeItem(PENDING_ROLE_KEY);
    }

    await redirectByRole(userId, preferredRole);
  };

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      toast({ title: "Referral Code Applied!", description: "You'll get 10% off your first order!" });
    }

    const mode = searchParams.get("mode");
    if (mode === "signup") setActiveTab("signup");

    setSelectedRole(getPreferredRole());
    authHandledRef.current = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        if (event === "INITIAL_SESSION") {
          setCheckingAuth(false);
        }
        return;
      }

      if (authHandledRef.current) return;
      authHandledRef.current = true;

      try {
        const pendingRole = localStorage.getItem(PENDING_ROLE_KEY) as UserRole | null;
        await handlePostAuthRedirect(session.user.id, pendingRole || selectedRole);
      } finally {
        setCheckingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [defaultRole, searchParams, toast]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      localStorage.setItem(PENDING_ROLE_KEY, selectedRole);

      const params = new URLSearchParams(location.search);
      params.set("role", selectedRole);
      const redirectUri = `${window.location.origin}${location.pathname}?${params.toString()}`;

      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
      });

      if (error) throw error;
    } catch (error: any) {
      localStorage.removeItem(PENDING_ROLE_KEY);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const pendingRole = selectedRole === "merchant" || selectedRole === "rider" ? selectedRole : null;

    try {
      const validatedData = signUpSchema.parse({ email: email.trim(), password, fullName: fullName.trim() });

      if (pendingRole) {
        localStorage.setItem(PENDING_ROLE_KEY, pendingRole);
      }

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: { full_name: validatedData.fullName },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      if (data.session?.user) {
        if (referralCode && selectedRole === "customer") {
          await supabase.rpc("apply_referral_code", {
            user_id: data.session.user.id,
            ref_code: referralCode.trim().toUpperCase(),
          });
        }

        toast({ title: "Welcome!", description: "Your account has been created. Redirecting..." });
        await handlePostAuthRedirect(data.session.user.id, selectedRole);
        return;
      }

      toast({
        title: "Check your email",
        description: "Confirm your email, then sign in to finish setting up your account.",
      });
      setActiveTab("signin");
    } catch (error: any) {
      localStorage.removeItem(PENDING_ROLE_KEY);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      await handlePostAuthRedirect(data.user.id, selectedRole);
    } catch (error: any) {
      toast({ title: "Error", description: error.errors?.[0]?.message || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email!", description: "We've sent you a password reset link." });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const roleConfig = ROLE_CONFIG[selectedRole];

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/5 zellij-pattern relative overflow-hidden">
      <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

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
          {/* Logo */}
          <motion.div className="flex items-center justify-center gap-3 mb-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${roleConfig.color}`}>
              <roleConfig.icon className="w-7 h-7" />
            </div>
          </motion.div>
          <motion.h1 className="text-3xl font-bold text-center mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            ATLAAS <span className="text-primary">GO</span>
          </motion.h1>
          <motion.p className="text-center text-muted-foreground text-sm mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            {roleConfig.desc}
          </motion.p>

          {/* Role Selector */}
          <motion.div className="flex gap-2 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
              const config = ROLE_CONFIG[role];
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm scale-[1.02]"
                      : "border-border/50 hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <config.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Google Sign In */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              variant="outline"
              className="w-full h-11 mb-4 font-medium gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <motion.form
                key="forgot"
                onSubmit={handleForgotPassword}
                className="space-y-4"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center mb-2">
                  <Mail className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-lg font-semibold">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="h-11 transition-all focus:scale-[1.01]"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  Back to Sign In
                </Button>
              </motion.form>
            ) : (
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
                        <Input id="signin-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                      </div>
                      <Button type="submit" className="w-full h-11 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                        {loading ? (
                          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Signing in...
                          </motion.div>
                        ) : "Sign In"}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup" key="signup">
                    <motion.form onSubmit={handleSignUp} className="space-y-4" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">{selectedRole === "merchant" ? "Restaurant Name" : "Full Name"}</Label>
                        <Input id="signup-name" type="text" placeholder={selectedRole === "merchant" ? "Atlas Tajine House" : "Ahmed Benali"} value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 transition-all focus:scale-[1.01]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-11 transition-all focus:scale-[1.01]" />
                        <p className="text-xs text-muted-foreground">8+ characters with uppercase, lowercase, and number</p>
                      </div>
                      {selectedRole === "customer" && (
                        <div className="space-y-2">
                          <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                          <Input id="referral-code" type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} maxLength={8} className="h-11 transition-all focus:scale-[1.01]" />
                          <AnimatePresence>
                            {referralCode && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-primary font-medium">
                                🎉 Get 10% off your first order!
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      <Button type="submit" className="w-full h-11 font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                        {loading ? (
                          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                            Creating account...
                          </motion.div>
                        ) : `Sign Up as ${roleConfig.label}`}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <motion.div className="flex items-center justify-center gap-4 mt-6 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            {[
              { icon: Shield, label: "Secure" },
              { icon: Zap, label: "Fast" },
              { icon: Sparkles, label: "Easy" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <badge.icon className="w-3.5 h-3.5 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.p className="text-center text-xs text-muted-foreground mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            By continuing, you agree to ATLAAS GO's{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">Terms</a> and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;

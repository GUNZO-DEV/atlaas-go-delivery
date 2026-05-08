import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface RlsTestResult {
  name: string;
  pass: boolean;
  expected: string;
  actual: string;
}

interface RlsReport {
  summary: { total: number; passed: number; failed: number };
  results: RlsTestResult[];
  testOrderId: string;
  timestamp: string;
}

export default function TestSetup() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [rlsLoading, setRlsLoading] = useState(false);
  const [rlsReport, setRlsReport] = useState<RlsReport | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createTestAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts');
      if (error) throw error;
      toast({ title: "Success!", description: "Test accounts created successfully" });
      setCreated(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runRlsTests = async () => {
    setRlsLoading(true);
    setRlsReport(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Not authenticated", description: "Please log in as admin first.", variant: "destructive" });
        return;
      }

      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed?.session?.access_token ?? session.access_token;

      const { data, error } = await supabase.functions.invoke('rls-regression-test', {
        headers: { access_token: accessToken },
      });

      if (error) throw error;

      setRlsReport(data as RlsReport);
      const report = data as RlsReport;
      if (report.summary.failed === 0) {
        toast({ title: "All RLS tests passed ✅", description: `${report.summary.total} checks verified.` });
      } else {
        toast({ title: "RLS failures detected ❌", description: `${report.summary.failed} of ${report.summary.total} failed.`, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "RLS Test Error", description: error.message, variant: "destructive" });
    } finally {
      setRlsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Setup</CardTitle>
            <CardDescription>Create test accounts for ATLAAS GO platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!created ? (
              <>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">This will create:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Admin account: admin@atlaas.com / admin123456</li>
                    <li>Merchant account: merchant@test.com / merchant123</li>
                    <li>Rider account: rider@test.com / rider123</li>
                    <li>Customer account: customer@test.com / customer123</li>
                    <li>Atlas Tajine House restaurant with 8 menu items</li>
                  </ul>
                </div>
                <Button onClick={createTestAccounts} disabled={loading} className="w-full" size="lg">
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : 'Create Test Accounts'}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Test accounts created successfully!</span>
                </div>
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div><p className="font-semibold">Admin Login:</p><p className="text-sm text-muted-foreground">admin@atlaas.com / admin123456</p></div>
                  <div><p className="font-semibold">Merchant Login:</p><p className="text-sm text-muted-foreground">merchant@test.com / merchant123</p></div>
                  <div><p className="font-semibold">Rider Login:</p><p className="text-sm text-muted-foreground">rider@test.com / rider123</p></div>
                  <div><p className="font-semibold">Customer Login:</p><p className="text-sm text-muted-foreground">customer@test.com / customer123</p></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/auth')} className="flex-1">Go to Login</Button>
                  <Button onClick={() => navigate('/')} variant="outline" className="flex-1">Go to Home</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RLS Regression Tests
            </CardTitle>
            <CardDescription>
              Automated security checks — verifies SELECT, INSERT, and UPDATE policies on chat_messages for authorized and unauthorized users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runRlsTests} disabled={rlsLoading} className="w-full" size="lg" variant="secondary">
              {rlsLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running 8 RLS checks...</>) : (<><ShieldCheck className="mr-2 h-4 w-4" />Run RLS Tests</>)}
            </Button>

            {rlsReport && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 p-3 rounded-lg ${rlsReport.summary.failed === 0 ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                  {rlsReport.summary.failed === 0 ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  <span className="font-semibold">
                    {rlsReport.summary.passed}/{rlsReport.summary.total} passed
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(rlsReport.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Expected</th>
                        <th className="text-left p-2">Actual</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rlsReport.results.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-medium">{r.name}</td>
                          <td className="p-2 text-muted-foreground">{r.expected}</td>
                          <td className="p-2 text-muted-foreground">{r.actual}</td>
                          <td className="p-2 text-center">
                            <Badge variant={r.pass ? "default" : "destructive"} className={r.pass ? "bg-green-600" : ""}>
                              {r.pass ? "PASS" : "FAIL"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TestSetup() {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createTestAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts');

      if (error) throw error;

      console.log('Test accounts created:', data);
      
      toast({
        title: "Success!",
        description: "Test accounts created successfully",
      });
      
      setCreated(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Test Setup</CardTitle>
          <CardDescription>
            Create test accounts for ATLAAS GO platform
          </CardDescription>
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

              <Button 
                onClick={createTestAccounts} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Test Accounts'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Test accounts created successfully!</span>
              </div>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">Admin Login:</p>
                  <p className="text-sm text-muted-foreground">admin@atlaas.com / admin123456</p>
                </div>
                <div>
                  <p className="font-semibold">Merchant Login:</p>
                  <p className="text-sm text-muted-foreground">merchant@test.com / merchant123</p>
                </div>
                <div>
                  <p className="font-semibold">Rider Login:</p>
                  <p className="text-sm text-muted-foreground">rider@test.com / rider123</p>
                </div>
                <div>
                  <p className="font-semibold">Customer Login:</p>
                  <p className="text-sm text-muted-foreground">customer@test.com / customer123</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate('/auth')} className="flex-1">
                  Go to Login
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

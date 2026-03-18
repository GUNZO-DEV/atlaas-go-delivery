import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  optional?: boolean;
}

const PhoneVerification = ({ onVerified, phone, onPhoneChange, optional = false }: PhoneVerificationProps) => {
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const formatPhone = (value: string): string => {
    // Allow only digits and +
    return value.replace(/[^\d+]/g, "");
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number with country code (e.g. +212...)", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp-sms", {
        body: { phone, action: "send" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to send OTP");
      setOtpSent(true);
      toast({ title: "OTP Sent! 📱", description: `Verification code sent to ${phone}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp-sms", {
        body: { phone, action: "verify", otp: otpCode },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Invalid OTP");
      setVerified(true);
      onVerified(phone);
      toast({ title: "Phone Verified! ✅", description: "Your phone number has been verified." });
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
      >
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Phone Verified</p>
          <p className="text-xs text-muted-foreground truncate">{phone}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="phone-input" className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          Phone Number {optional && <span className="text-muted-foreground">(Optional)</span>}
        </Label>
        <div className="flex gap-2">
          <Input
            id="phone-input"
            type="tel"
            placeholder="+212612345678"
            value={phone}
            onChange={(e) => onPhoneChange(formatPhone(e.target.value))}
            disabled={otpSent}
            className="h-11 flex-1 transition-all focus:scale-[1.01]"
          />
          <Button
            type="button"
            variant={otpSent ? "outline" : "default"}
            size="sm"
            onClick={handleSendOTP}
            disabled={sending || !phone || phone.length < 10}
            className="h-11 px-4 shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? "Resend" : "Send Code"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {otpSent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Label className="text-sm">Enter 6-digit verification code</Label>
            <div className="flex items-center gap-3">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={verifying || otpCode.length !== 6}
                className="h-10 shrink-0"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive the code? Check your SMS or tap Resend.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneVerification;

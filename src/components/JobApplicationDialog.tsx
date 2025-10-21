import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const applicationSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  cover_letter: z.string().min(50, "Cover letter must be at least 50 characters").max(2000),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  years_of_experience: z.number().min(0).max(50).optional(),
  current_position: z.string().max(100).optional(),
});

interface JobApplicationDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobApplicationDialog = ({
  jobId,
  jobTitle,
  open,
  onOpenChange,
}: JobApplicationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    linkedin_url: "",
    portfolio_url: "",
    years_of_experience: "",
    current_position: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to apply for jobs");
        setLoading(false);
        return;
      }

      // Validate form data
      const validatedData = applicationSchema.parse({
        ...formData,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
        linkedin_url: formData.linkedin_url || undefined,
        portfolio_url: formData.portfolio_url || undefined,
      });

      // Submit application
      const { error } = await supabase.from("job_applications").insert({
        job_id: jobId,
        user_id: user.id,
        ...validatedData,
        years_of_experience: validatedData.years_of_experience || null,
        current_position: validatedData.current_position || null,
        linkedin_url: validatedData.linkedin_url || null,
        portfolio_url: validatedData.portfolio_url || null,
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      onOpenChange(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        cover_letter: "",
        linkedin_url: "",
        portfolio_url: "",
        years_of_experience: "",
        current_position: "",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_position">Current Position</Label>
            <Input
              id="current_position"
              value={formData.current_position}
              onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_of_experience">Years of Experience</Label>
            <Input
              id="years_of_experience"
              type="number"
              min="0"
              max="50"
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              type="url"
              placeholder="https://your-portfolio.com"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter *</Label>
            <Textarea
              id="cover_letter"
              rows={6}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters
            </p>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

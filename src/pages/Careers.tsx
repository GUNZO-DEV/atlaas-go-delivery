import { useState, useEffect } from "react";
import { Briefcase, Users, TrendingUp, Heart, MapPin, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobApplicationDialog } from "@/components/JobApplicationDialog";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string | null;
}

const Careers = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast.error("Failed to load job postings");
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob({ id: job.id, title: job.title });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="w-12 h-12 text-primary-glow" />
            <h1 className="text-4xl md:text-5xl font-bold">Careers at ATLAAS GO</h1>
          </div>

          <p className="text-xl text-muted-foreground mb-12">
            Join us in building Morocco's fairest delivery platform. We're always looking for passionate people who want to make a difference.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Heart className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Our Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe in fairness, innovation, and community. Our team is diverse, collaborative, and passionate about transforming Morocco's delivery industry.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Work With Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Whether you're a developer, designer, marketer, or operations expert, we have opportunities for talented individuals to grow with us.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We invest in our team's development with training programs, mentorship, and clear career progression paths.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Competitive salary, health insurance, flexible working hours, and the opportunity to build something meaningful for Morocco.
                </p>
              </CardContent>
            </Card>
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Open Positions</h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading job postings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No open positions at the moment. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.employment_type}
                            </span>
                            <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                              {job.department}
                            </span>
                          </div>
                          {job.salary_range && (
                            <p className="text-sm font-semibold text-primary mb-2">
                              {job.salary_range}
                            </p>
                          )}
                          <p className="text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <Button onClick={() => handleApplyClick(job)} className="md:mt-0">
                          Apply Now
                        </Button>
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-primary font-semibold">
                          View Details
                        </summary>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Requirements:</h4>
                            <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Responsibilities:</h4>
                            <p className="text-muted-foreground whitespace-pre-line">{job.responsibilities}</p>
                          </div>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="bg-card p-8 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-muted-foreground mb-6">
              We're always interested in meeting talented people. Send us your CV and tell us how you'd like to contribute to ATLAAS GO.
            </p>
            <Button size="lg">Send General Application</Button>
          </section>

          <section className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Working Here?</h2>
            <p className="text-muted-foreground mb-4">
              Get in touch with our HR team
            </p>
            <p className="text-lg">
              <a href="mailto:careers@atlaasgo.ma" className="text-primary-glow hover:underline">
                careers@atlaasgo.ma
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
      
      {selectedJob && (
        <JobApplicationDialog
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
};

export default Careers;

import { Briefcase, Users, TrendingUp, Heart } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Careers = () => {
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
            <div className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Senior Full-Stack Developer</h3>
                      <p className="text-muted-foreground">Casablanca • Full-time</p>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                  <p className="text-muted-foreground">
                    Build and scale our platform using React, Node.js, and modern cloud technologies. 3+ years experience required.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Product Designer</h3>
                      <p className="text-muted-foreground">Casablanca • Full-time</p>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                  <p className="text-muted-foreground">
                    Design beautiful, intuitive experiences for customers, riders, and restaurants. Portfolio required.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Operations Manager</h3>
                      <p className="text-muted-foreground">Casablanca • Full-time</p>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                  <p className="text-muted-foreground">
                    Manage daily operations, optimize delivery routes, and ensure exceptional service quality. 2+ years in logistics.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Marketing Specialist</h3>
                      <p className="text-muted-foreground">Casablanca • Full-time</p>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                  <p className="text-muted-foreground">
                    Drive growth through digital marketing, content creation, and community engagement. Experience in tech startups preferred.
                  </p>
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
};

export default Careers;

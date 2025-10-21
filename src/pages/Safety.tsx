import { Shield, AlertCircle, Phone, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Safety = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-12 h-12 text-primary-glow" />
            <h1 className="text-4xl md:text-5xl font-bold">Safety First</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-12">
            Your safety and security are our top priorities at ATLAAS GO.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <AlertCircle className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Emergency SOS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Every delivery includes an Emergency SOS button for immediate assistance. Press it anytime you feel unsafe.
                </p>
                <p className="font-semibold">Emergency: 190</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="w-10 h-10 text-primary mb-2" />
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our safety team is available around the clock to respond to any concerns.
                </p>
                <p className="font-semibold">+212 5 23 45 67 89</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">For Customers</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Real-Time Tracking:</strong> Track your rider's location and estimated arrival time in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Verified Riders:</strong> All riders undergo background checks and training</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Contactless Delivery:</strong> Request no-contact delivery for added safety</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Secure Payments:</strong> All transactions are encrypted and secure</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">For Riders</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Safety Equipment:</strong> Required helmet and reflective gear for all riders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Insurance Coverage:</strong> Comprehensive insurance for all active deliveries</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Emergency Support:</strong> Direct line to safety team and emergency services</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Training Programs:</strong> Regular safety and road awareness training</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Food Safety</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Restaurant Standards:</strong> Partner restaurants meet strict hygiene requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Temperature Control:</strong> Insulated delivery bags maintain food temperature</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Sealed Packaging:</strong> Tamper-evident seals on all orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Regular Audits:</strong> Ongoing restaurant inspections and quality checks</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Privacy & Data Security</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Encrypted Communications:</strong> All app communications are end-to-end encrypted</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Limited Data Sharing:</strong> Personal information shared only as needed for delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-glow mt-1 flex-shrink-0" />
                  <span><strong>Secure Storage:</strong> Data protected with industry-leading security measures</span>
                </li>
              </ul>
            </section>

            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Report a Safety Concern</h2>
              <p className="mb-4">
                If you experience or witness any safety issues, please contact us immediately:
              </p>
              <div className="space-y-2">
                <p><strong>Emergency Hotline:</strong> 190 (24/7)</p>
                <p><strong>Safety Team:</strong> +212 5 23 45 67 89</p>
                <p><strong>Email:</strong> safety@atlaasgo.ma</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Safety;

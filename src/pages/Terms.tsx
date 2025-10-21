import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p>By accessing and using ATLAAS GO, you accept and agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily use ATLAAS GO for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
              <p className="mt-4">Under this license you may not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
              <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
              <p className="mt-4">You are responsible for safeguarding your password and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Orders and Payments</h2>
              <p>All orders are subject to acceptance and availability. Prices are subject to change without notice. Payment must be made through approved methods at the time of order.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Delivery</h2>
              <p>We strive to deliver orders within estimated timeframes. However, delivery times are estimates and may vary due to factors beyond our control.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cancellations and Refunds</h2>
              <p>Orders may be cancelled before restaurant confirmation. Refund policies vary by circumstance and are processed at our discretion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <p>ATLAAS GO shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of Morocco, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at hello@atlaasgo.ma</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

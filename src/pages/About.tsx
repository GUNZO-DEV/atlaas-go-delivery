import { MapPin } from "lucide-react";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-12 h-12 text-primary-glow" />
            <h1 className="text-4xl md:text-5xl font-bold">
              About ATLAAS <span className="text-primary-glow">GO</span>
            </h1>
          </div>

          <div className="space-y-8 text-lg">
            <section>
              <h2 className="text-2xl font-bold text-primary-glow mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                ATLAAS GO is Morocco's first truly fair delivery platform. Built by Moroccans, for Morocco. 
                We're revolutionizing food delivery by putting fairness first - fair prices for customers, 
                fair earnings for riders, and fair commissions for restaurants.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-glow mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded in Casablanca, ATLAAS GO emerged from a simple observation: the delivery industry 
                in Morocco needed a platform that truly served all stakeholders. We saw riders working long 
                hours for minimal pay, restaurants squeezed by high commissions, and customers paying premium 
                prices without premium service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our name draws inspiration from the Atlas Mountains - a symbol of strength, endurance, and 
                Moroccan pride. Like these mountains, we stand strong in our commitment to fairness and quality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-glow mb-4">What Makes Us Different</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary-glow font-bold">•</span>
                  <span><strong>Fair Rider Earnings:</strong> Our riders receive competitive compensation with transparent earning structures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-glow font-bold">•</span>
                  <span><strong>Low Restaurant Commissions:</strong> We take lower commissions so restaurants can thrive</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-glow font-bold">•</span>
                  <span><strong>Real-Time Tracking:</strong> Full transparency with live order tracking and rider location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-glow font-bold">•</span>
                  <span><strong>Local Focus:</strong> We understand Moroccan culture, cuisine, and communities</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-glow mb-4">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-bold text-xl mb-2">Fairness</h3>
                  <p className="text-muted-foreground">Equal opportunity and fair treatment for all</p>
                </div>
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-bold text-xl mb-2">Quality</h3>
                  <p className="text-muted-foreground">Excellence in every delivery, every time</p>
                </div>
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-bold text-xl mb-2">Community</h3>
                  <p className="text-muted-foreground">Supporting local businesses and riders</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;

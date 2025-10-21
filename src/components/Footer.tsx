import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-midnight text-midnight-foreground relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-primary-glow" />
              <h3 className="text-3xl font-bold">
                ATLAAS <span className="text-primary-glow">GO</span>
              </h3>
            </div>
            <p className="text-midnight-foreground/70 mb-4 italic">
              "From the mountains to your door."
            </p>
            <p className="text-midnight-foreground/70 text-sm">
              Morocco's first truly fair delivery platform. 
              Built by Moroccans, for Morocco.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-glow">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Become a Partner
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Become a Rider
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-glow">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Safety
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-glow">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-midnight-foreground/70">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:hello@atlaasgo.ma" className="hover:text-primary-glow transition-colors">
                  hello@atlaasgo.ma
                </a>
              </li>
              <li className="flex items-center gap-2 text-midnight-foreground/70">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+212123456789" className="hover:text-primary-glow transition-colors">
                  +212 5 23 45 67 89
                </a>
              </li>
              <li className="flex items-center gap-2 text-midnight-foreground/70">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Casablanca, Morocco</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              <Button
                size="icon"
                variant="outline"
                className="border-midnight-foreground/20 hover:border-primary hover:bg-primary/10"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-midnight-foreground/20 hover:border-primary hover:bg-primary/10"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-midnight-foreground/20 hover:border-primary hover:bg-primary/10"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-midnight-foreground/20 hover:border-primary hover:bg-primary/10"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-midnight-foreground/10 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl font-bold mb-3">Stay Updated</h4>
            <p className="text-midnight-foreground/70 mb-4">
              Get the latest news and exclusive offers from ATLAAS GO
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-midnight-foreground/10 border-midnight-foreground/20"
              />
              <Button className="bg-primary hover:bg-primary-glow">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-midnight-foreground/10 pt-8 text-center">
          <p className="text-midnight-foreground/50 text-sm mb-2">
            © 2025 ATLAAS GO. All rights reserved.
          </p>
          <p className="text-primary-glow font-semibold text-lg italic">
            "ATLAAS GO — Strength. Speed. Morocco."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

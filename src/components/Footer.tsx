import { Mail, Phone, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import AtlaasGoLogo from "./AtlaasGoLogo";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-midnight text-midnight-foreground relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <AtlaasGoLogo className="w-56 h-auto" />
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
                <button onClick={() => navigate("/about")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/partner-restaurant")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Become a Partner
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/rider-auth")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Become a Rider
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/careers")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary-glow">Support</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => navigate("/help")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/safety")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Safety
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/privacy")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/privacy")} className="text-midnight-foreground/70 hover:text-primary-glow transition-colors">
                  Cookie Policy
                </button>
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
              <li className="text-midnight-foreground/70">
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

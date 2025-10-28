import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Twitter, FileText, Shield, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-card to-card/95 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-primary-glow animate-pulse" />
              <h3 className="text-3xl font-bold">
                ATLAAS <span className="text-primary-glow">GO</span>
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 italic font-medium">
              "From the Atlas to Your Door"
            </p>
            <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6">
              Morocco's first fair-commission delivery platform. Built by Moroccans, for Moroccans.
              Supporting local businesses with industry-lowest 10% commission.
            </p>
            
            {/* University Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Backed by Moroccan innovation — built at Al Akhawayn University
              </span>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/about")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  About ATLAAS GO
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/careers")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/partner-restaurant")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Partner with Us
                </button>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Press & Media Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              Legal & Security
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/terms")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  RLS Policies
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/safety")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Safety & Trust
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/help")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <Mail className="w-5 h-5 text-primary group-hover:text-primary-glow transition-colors mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a 
                    href="mailto:adminatlaas@atlaasgo.com" 
                    className="hover:text-primary-glow transition-colors font-semibold"
                  >
                    adminatlaas@atlaasgo.com
                  </a>
                  <span className="text-xs">General Inquiries</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Ifrane, Morocco</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              <Button
                size="icon"
                variant="outline"
                className="border-primary/30 bg-primary/5 hover:bg-primary hover:border-primary text-foreground hover:text-white transition-all hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-primary/30 bg-primary/5 hover:bg-primary hover:border-primary text-foreground hover:text-white transition-all hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-primary/30 bg-primary/5 hover:bg-primary hover:border-primary text-foreground hover:text-white transition-all hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-3 text-primary-glow">Stay Updated</h4>
            <p className="text-muted-foreground mb-6 text-lg">
              Get the latest news and exclusive offers from ATLAAS GO
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-background border-input placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary-glow text-white font-semibold shadow-glow hover:scale-105 transition-all">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">ATLAAS GO</span>
            </div>
            
            <p className="text-center">
              Built in Morocco 🇲🇦, For Morocco
            </p>
            
            <p>© 2025 All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

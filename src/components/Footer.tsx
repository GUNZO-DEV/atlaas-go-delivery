import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8 text-primary-glow animate-pulse" />
              <h3 className="text-3xl font-bold">
                ATLAAS <span className="text-primary-glow">GO</span>
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 italic font-medium">
              "{t('hero.tagline')}"
            </p>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">
              {t('hero.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/about")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.about')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.howItWorks')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/partner-restaurant")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('partner.restaurant')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/rider-auth")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('hero.becomeRider')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/careers")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.careers')}
                </button>
              </li>
              <li className="mt-6 pt-4 border-t border-primary/20">
                <p className="text-muted-foreground/80 text-sm italic">
                  {t('footer.developed')}
                </p>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              {t('footer.support')}
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/help")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.helpCenter')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/safety")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.safety')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/terms")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-muted-foreground hover:text-primary-glow transition-all hover:translate-x-1 inline-block"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-glow border-b border-primary/20 pb-2">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground group">
                <Mail className="w-5 h-5 text-primary group-hover:text-primary-glow transition-colors" />
                <a 
                  href="mailto:hello@atlaasgo.ma" 
                  className="hover:text-primary-glow transition-colors"
                >
                  hello@atlaasgo.ma
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <Phone className="w-5 h-5 text-primary group-hover:text-primary-glow transition-colors" />
                <a 
                  href="tel:+212523456789" 
                  className="hover:text-primary-glow transition-colors"
                >
                  +212 5 23 45 67 89
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Casablanca, Morocco</span>
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
                <Twitter className="w-5 h-5" />
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
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            © 2025 ATLAAS GO. All rights reserved.
          </p>
          <p className="text-primary-glow font-bold text-xl italic mb-4 animate-pulse">
            "ATLAAS GO — Strength. Speed. Morocco."
          </p>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <span>🇲🇦</span>
            {t('footer.built')}
            <span>🇲🇦</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

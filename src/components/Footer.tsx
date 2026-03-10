import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const linkClass = "text-muted-foreground hover:text-foreground transition-colors text-sm";

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">
                ATLAAS <span className="text-primary">GO</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Morocco's food delivery platform. Fast delivery, fair commissions, supporting local restaurants.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <Button key={i} size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('footer.about'), to: "/about" },
                { label: t('partner.restaurant'), to: "/partner-restaurant" },
                { label: t('hero.becomeRider'), to: "/rider-auth" },
                { label: t('footer.careers'), to: "/careers" },
              ].map(link => (
                <li key={link.to}>
                  <button onClick={() => navigate(link.to)} className={linkClass}>{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t('footer.support')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('footer.helpCenter'), to: "/help" },
                { label: t('footer.safety'), to: "/safety" },
                { label: t('footer.terms'), to: "/terms" },
                { label: t('footer.privacy'), to: "/privacy" },
              ].map(link => (
                <li key={link.to}>
                  <button onClick={() => navigate(link.to)} className={linkClass}>{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-3">Get exclusive offers and news.</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="h-9 text-sm"
              />
              <Button size="sm" className="h-9 px-4 font-semibold">
                Join
              </Button>
            </div>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <a href="mailto:hello@atlaasgo.ma" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="w-3.5 h-3.5" /> hello@atlaasgo.ma
              </a>
              <a href="tel:+212523456789" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="w-3.5 h-3.5" /> +212 5 23 45 67 89
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            © 2025 ATLAAS GO. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            🇲🇦 {t('footer.built')} 🇲🇦
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="fixed top-4 right-4 z-50 backdrop-blur-md bg-card/80 hover:bg-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg"
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="font-semibold">{language === 'en' ? 'FR' : 'EN'}</span>
    </Button>
  );
};

export default LanguageToggle;

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
      variant="ghost"
      size="sm"
      className="text-white hover:bg-white/20 border-0 transition-all duration-300"
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="font-semibold">{language === 'en' ? 'FR' : 'EN'}</span>
    </Button>
  );
};

export default LanguageToggle;

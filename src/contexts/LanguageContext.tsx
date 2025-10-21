import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export const translations: Translations = {
  // Hero
  'hero.tagline': { en: 'From the mountains to your door.', fr: 'Des montagnes à votre porte.' },
  'hero.headline': { en: 'Fast. Fair. 100% Moroccan.', fr: 'Rapide. Équitable. 100% Marocain.' },
  'hero.description': { en: "Morocco's first delivery platform built with our merchants and riders in mind. Only 10% commission. Real-time tracking. Pure Moroccan hospitality.", fr: "La première plateforme de livraison du Maroc conçue pour nos commerçants et livreurs. Seulement 10% de commission. Suivi en temps réel. Hospitalité marocaine authentique." },
  'hero.orderNow': { en: 'Order Now', fr: 'Commander' },
  'hero.becomeRider': { en: 'Become a Rider', fr: 'Devenir Livreur' },
  'hero.commission': { en: 'Commission Only', fr: 'Commission Seulement' },
  'hero.support': { en: 'Live Support', fr: 'Support 24/7' },
  'hero.moroccan': { en: 'Moroccan', fr: 'Marocain' },
  
  // Quick Order
  'order.title': { en: 'Order Now from Atlas Tajine House', fr: 'Commander au Atlas Tajine House' },
  'order.subtitle': { en: 'Authentic Moroccan cuisine delivered to your door', fr: 'Cuisine marocaine authentique livrée à votre porte' },
  'order.browse': { en: 'Browse All Restaurants', fr: 'Parcourir les Restaurants' },
  'order.viewMenu': { en: 'View Menu & Order', fr: 'Voir Menu & Commander' },
  
  // Partners
  'partner.title': { en: 'Partner With Us', fr: 'Devenez Partenaire' },
  'partner.subtitle': { en: 'Join ATLAAS GO as a restaurant or rider', fr: 'Rejoignez ATLAAS GO en tant que restaurant ou livreur' },
  'partner.restaurant': { en: 'Join as Restaurant', fr: 'Rejoindre comme Restaurant' },
  'partner.restaurantDesc': { en: 'Partner with us and reach thousands of customers', fr: 'Devenez partenaire et touchez des milliers de clients' },
  'partner.rider': { en: 'Rider Login', fr: 'Connexion Livreur' },
  'partner.riderDesc': { en: 'Start delivering and earn money', fr: 'Commencez à livrer et gagnez de l\'argent' },
  'partner.applyNow': { en: 'Apply Now', fr: 'Postuler' },
  'partner.portal': { en: 'Rider Portal', fr: 'Portail Livreur' },
  
  // Merchant Section
  'merchant.title': { en: 'Fair to Every Merchant', fr: 'Équitable pour Chaque Commerçant' },
  'merchant.subtitle': { en: "We believe Moroccan businesses deserve better. That's why we only take 10% commission.", fr: "Nous croyons que les entreprises marocaines méritent mieux. C'est pourquoi nous ne prenons que 10% de commission." },
  'merchant.stats1': { en: 'Local Restaurants Joined', fr: 'Restaurants Locaux Rejoints' },
  'merchant.stats2': { en: 'Average Profit Increase', fr: 'Augmentation Moyenne des Profits' },
  'merchant.stats3': { en: 'Trusted by Cafés & Patisseries', fr: 'Approuvé par Cafés & Pâtisseries' },
  
  // Footer
  'footer.quickLinks': { en: 'Quick Links', fr: 'Liens Rapides' },
  'footer.support': { en: 'Support', fr: 'Support' },
  'footer.contact': { en: 'Contact', fr: 'Contact' },
  'footer.about': { en: 'About Us', fr: 'À Propos' },
  'footer.howItWorks': { en: 'How It Works', fr: 'Comment Ça Marche' },
  'footer.careers': { en: 'Careers', fr: 'Carrières' },
  'footer.helpCenter': { en: 'Help Center', fr: 'Centre d\'Aide' },
  'footer.safety': { en: 'Safety', fr: 'Sécurité' },
  'footer.terms': { en: 'Terms of Service', fr: 'Conditions d\'Utilisation' },
  'footer.privacy': { en: 'Privacy Policy', fr: 'Politique de Confidentialité' },
  'footer.built': { en: 'Built proudly in Morocco 🇲🇦 by young innovators', fr: 'Fièrement construit au Maroc 🇲🇦 par de jeunes innovateurs' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

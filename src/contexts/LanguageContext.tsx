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
  'order.browseTitle': { en: 'Browse All Restaurants', fr: 'Parcourir Tous les Restaurants' },
  'order.browseDesc': { en: 'Search, filter, and discover Moroccan restaurants', fr: 'Recherchez, filtrez et découvrez les restaurants marocains' },
  'order.atlasTitle': { en: 'Atlas Tajine House', fr: 'Atlas Tajine House' },
  'order.atlasDesc': { en: 'Traditional tajines, couscous, and authentic Moroccan dishes', fr: 'Tajines traditionnels, couscous et plats marocains authentiques' },
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
  'merchant.commission': { en: 'Only 10% Commission', fr: 'Seulement 10% de Commission' },
  'merchant.commissionDesc': { en: 'Other platforms take 20-30%. We keep it fair so small businesses can thrive. Your success is our success.', fr: 'D\'autres plateformes prennent 20-30%. Nous restons équitables pour que les petites entreprises prospèrent. Votre succès est notre succès.' },
  'merchant.dashboard': { en: 'Smart Dashboard', fr: 'Tableau de Bord Intelligent' },
  'merchant.dashboardDesc': { en: 'Track orders, earnings, and customer reviews in real-time. Simple analytics built for Moroccan merchants.', fr: 'Suivez les commandes, les revenus et les avis clients en temps réel. Analyses simples pour les commerçants marocains.' },
  'merchant.payouts': { en: 'Weekly Payouts', fr: 'Paiements Hebdomadaires' },
  'merchant.payoutsDesc': { en: 'Get paid every week, on time, every time. No hidden fees. No surprises. Just honest business.', fr: 'Payé chaque semaine, à temps, à chaque fois. Pas de frais cachés. Pas de surprises. Juste des affaires honnêtes.' },
  'merchant.grow': { en: 'Grow Your Business', fr: 'Développez Votre Entreprise' },
  'merchant.growDesc': { en: 'Reach more customers across Morocco. Free marketing support. We help you succeed.', fr: 'Touchez plus de clients à travers le Maroc. Support marketing gratuit. Nous vous aidons à réussir.' },
  'merchant.joinButton': { en: 'Join as Partner Restaurant', fr: 'Rejoindre comme Restaurant Partenaire' },
  'merchant.traditional': { en: 'Traditional Quality', fr: 'Qualité Traditionnelle' },
  'merchant.soukSuccess': { en: 'From Souk to Success', fr: 'Du Souk au Succès' },
  
  // Customer Section
  'customer.title': { en: 'From Souk to Sofa', fr: 'Du Souk au Canapé' },
  'customer.subtitle': { en: 'Everything Morocco has to offer, delivered to your doorstep with care and speed.', fr: 'Tout ce que le Maroc a à offrir, livré à votre porte avec soin et rapidité.' },
  'customer.food': { en: 'Food & Dining', fr: 'Nourriture & Restaurant' },
  'customer.foodDesc': { en: 'From traditional tagines to modern cafés. Taste Morocco, delivered hot and fresh.', fr: 'Des tajines traditionnels aux cafés modernes. Goûtez au Maroc, livré chaud et frais.' },
  'customer.groceries': { en: 'Groceries', fr: 'Épicerie' },
  'customer.groceriesDesc': { en: 'Fresh produce, pantry essentials, and everything you need for your Moroccan kitchen.', fr: 'Produits frais, essentiels de garde-manger et tout ce dont vous avez besoin pour votre cuisine marocaine.' },
  'customer.shops': { en: 'Local Shops', fr: 'Boutiques Locales' },
  'customer.shopsDesc': { en: 'Support local businesses. From handicrafts to household items, shop Moroccan.', fr: 'Soutenez les entreprises locales. De l\'artisanat aux articles ménagers, achetez marocain.' },
  'customer.health': { en: 'Health & More', fr: 'Santé & Plus' },
  'customer.healthDesc': { en: 'Medicines, wellness products, and health essentials delivered with care.', fr: 'Médicaments, produits de bien-être et essentiels de santé livrés avec soin.' },
  'customer.localRest': { en: 'Local restaurants', fr: 'Restaurants locaux' },
  'customer.fastFood': { en: 'Fast food chains', fr: 'Chaînes de restauration rapide' },
  'customer.souks': { en: 'Traditional souks', fr: 'Souks traditionnels' },
  'customer.freshVeg': { en: 'Fresh vegetables', fr: 'Légumes frais' },
  'customer.meat': { en: 'Meat & seafood', fr: 'Viande & fruits de mer' },
  'customer.spices': { en: 'Spices & herbs', fr: 'Épices & herbes' },
  'customer.crafts': { en: 'Artisan crafts', fr: 'Artisanat' },
  'customer.electronics': { en: 'Electronics', fr: 'Électronique' },
  'customer.fashion': { en: 'Fashion & beauty', fr: 'Mode & beauté' },
  'customer.pharmacies': { en: 'Pharmacies', fr: 'Pharmacies' },
  'customer.healthProducts': { en: 'Health products', fr: 'Produits de santé' },
  'customer.personalCare': { en: 'Personal care', fr: 'Soins personnels' },
  'customer.oneApp': { en: 'Everything Morocco, One App', fr: 'Tout le Maroc, Une Application' },
  'customer.downloadCTA': { en: 'Download ATLAAS GO and experience Moroccan delivery done right.', fr: 'Téléchargez ATLAAS GO et vivez la livraison marocaine comme il se doit.' },
  
  // Driver Section
  'driver.title': { en: 'Drive with Dignity', fr: 'Conduire avec Dignité' },
  'driver.subtitle': { en: "Join Morocco's fairest delivery platform. Earn more, work smarter, be valued.", fr: 'Rejoignez la plateforme de livraison la plus équitable du Maroc. Gagnez plus, travaillez intelligemment, soyez valorisé.' },
  'driver.payments': { en: 'Weekly Payments', fr: 'Paiements Hebdomadaires' },
  'driver.paymentsDesc': { en: 'Get paid every week directly to your account. No delays, no hassles. Transparent bonuses for excellent service.', fr: 'Payé chaque semaine directement sur votre compte. Pas de retards, pas de tracas. Bonus transparents pour un excellent service.' },
  'driver.respect': { en: 'Respect & Support', fr: 'Respect & Soutien' },
  'driver.respectDesc': { en: "24/7 rider support team. Insurance coverage. We treat our riders like family. Because that's who you are.", fr: 'Équipe de support 24/7. Couverture d\'assurance. Nous traitons nos livreurs comme une famille. Parce que c\'est ce que vous êtes.' },
  'driver.flexible': { en: 'Flexible Hours', fr: 'Horaires Flexibles' },
  'driver.flexibleDesc': { en: 'Work when you want. Morning, afternoon, evening — you choose. Your schedule, your way.', fr: 'Travaillez quand vous voulez. Matin, après-midi, soir — vous choisissez. Votre emploi du temps, à votre façon.' },
  'driver.safety': { en: 'Safety First', fr: 'Sécurité d\'Abord' },
  'driver.safetyDesc': { en: 'Helmet provided. Safety training. Emergency support. Your safety is our priority, always.', fr: 'Casque fourni. Formation à la sécurité. Support d\'urgence. Votre sécurité est notre priorité, toujours.' },
  'driver.bonuses': { en: 'Earn Bonuses', fr: 'Gagnez des Bonus' },
  'driver.bonusesDesc': { en: 'Performance bonuses. Customer tips go 100% to you. The better you do, the more you earn.', fr: 'Bonus de performance. Les pourboires vont 100% à vous. Plus vous faites bien, plus vous gagnez.' },
  'driver.joinButton': { en: 'Become a Rider Today', fr: 'Devenez Livreur Aujourd\'hui' },
  'driver.avgEarnings': { en: 'Average Weekly Earnings', fr: 'Gains Hebdomadaires Moyens' },
  'driver.happyRiders': { en: 'Happy Riders', fr: 'Livreurs Heureux' },
  'driver.ridersCount': { en: '1,200+ Riders', fr: '1 200+ Livreurs' },
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

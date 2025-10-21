import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    name: "Amina",
    location: "Fez",
    rating: 5,
    text: "The first app that feels truly Moroccan. Fast delivery and the riders are always respectful. I love supporting local restaurants through ATLAAS GO!",
    role: "Customer"
  },
  {
    name: "Youssef",
    location: "Casablanca",
    rating: 5,
    text: "I earn more and feel respected. The weekly payouts are always on time, and the support team actually listens to us riders. Best decision I made!",
    role: "Rider"
  },
  {
    name: "Fatima",
    location: "Marrakech",
    rating: 5,
    text: "Finally, a platform that doesn't take all our profits. The 10% commission means we can actually grow our small restaurant. Shukran ATLAAS GO!",
    role: "Restaurant Owner"
  }
];

const TestimonialsSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover-lift transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg text-foreground mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-lg text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full border-2 border-primary/20">
            <Star className="w-5 h-5 fill-primary" />
            <span className="font-semibold">Rated 4.8/5 by over 10,000 Moroccans</span>
            <Star className="w-5 h-5 fill-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

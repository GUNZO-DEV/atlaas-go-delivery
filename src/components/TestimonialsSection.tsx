import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    name: "Amina",
    location: "Fez",
    rating: 5,
    text: "The first app that feels truly Moroccan. Fast delivery and the riders are always respectful.",
    role: "Customer",
    avatar: "A",
  },
  {
    name: "Youssef",
    location: "Casablanca",
    rating: 5,
    text: "I earn more and feel respected. Weekly payouts are always on time. Best decision I made!",
    role: "Rider",
    avatar: "Y",
  },
  {
    name: "Fatima",
    location: "Marrakech",
    rating: 5,
    text: "10% commission means we can actually grow our small restaurant. Shukran ATLAAS GO!",
    role: "Restaurant Owner",
    avatar: "F",
  }
];

const TestimonialsSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 md:py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border hover:border-primary/20 hover:shadow-md transition-all duration-200 bg-card"
            >
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-sm text-foreground mb-5 leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-5 py-2.5 rounded-full border border-primary/15 text-sm font-medium">
            <Star className="w-4 h-4 fill-primary" />
            <span>Rated 4.8/5 by over 10,000 users</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

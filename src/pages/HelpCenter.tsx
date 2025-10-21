import { Search, MessageCircle, Phone, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SupportTicketDialog from "@/components/SupportTicketDialog";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Help Center</h1>
          <p className="text-muted-foreground text-center mb-12">Find answers to common questions</p>

          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for help..." 
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chat with our support team</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+212 5 23 45 67 89</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">hello@atlaasgo.ma</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <SupportTicketDialog />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I track my order?</AccordionTrigger>
                  <AccordionContent>
                    Once your order is confirmed, you'll receive a tracking link. You can also track your order in real-time from your dashboard with live rider location updates.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>What are the delivery fees?</AccordionTrigger>
                  <AccordionContent>
                    Delivery fees vary based on distance and demand. You'll see the exact fee before placing your order. We strive to keep fees fair and transparent.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I become a rider?</AccordionTrigger>
                  <AccordionContent>
                    Visit our Rider Portal to apply. You'll need a valid driver's license, vehicle registration, and insurance. Our team will guide you through the onboarding process.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
                  <AccordionContent>
                    You can cancel your order before the restaurant confirms it. Once confirmed, cancellation policies apply. Contact support for assistance with cancellations.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I contact customer support?</AccordionTrigger>
                  <AccordionContent>
                    You can reach us via live chat, phone (+212 5 23 45 67 89), or email (hello@atlaasgo.ma). We're here to help 24/7.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;

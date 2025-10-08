import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/common/Section';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Section title="Contact Us" center>
        <Card className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-8 space-y-8">
            <p className="text-lg text-muted-foreground dark:text-gray-300 text-center">
              We're here to help! Reach out to us with any questions, feedback, or partnership opportunities.
            </p>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-foreground">support@impacthub.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-foreground">+94 91 222 2226</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-foreground">17/F New Kandy Road, Yakkala</span>
              </div>
            </div>
            <form className="mt-4 space-y-4">
              <input type="text" placeholder="Your Name" className="w-full bg-muted border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" required />
              <input type="email" placeholder="Your Email" className="w-full bg-muted border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" required />
              <textarea placeholder="Your Message" className="w-full bg-muted border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" rows={4} required />
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2 rounded-md hover:from-indigo-700 hover:to-blue-700 transition-colors">Send Message</button>
            </form>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
};

export default Contact;

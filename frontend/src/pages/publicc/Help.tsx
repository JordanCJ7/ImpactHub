import React from 'react';
import { HelpCircle, Info, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/common/Section';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Section title="Help Center" center>
        <Card className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground dark:text-gray-300 text-center">
              Find answers to common questions, troubleshooting tips, and guidance for using ImpactHub.
            </p>
            <div className="space-y-6 mt-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center"><Info className="mr-2 h-5 w-5" /> Getting Started</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Browse campaigns and select causes you care about.</li>
                  <li>Create an account to track your donations and impact.</li>
                  <li>Donate securely using Stripe or PayPal.</li>
                  <li>Receive updates and impact reports from charities.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center"><Info className="mr-2 h-5 w-5" /> Frequently Asked Questions</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Is my payment secure?</strong> Yes, all payments are processed via secure gateways (Stripe/PayPal).</li>
                  <li><strong>How do I contact support?</strong> Use the <a href="/contact" className="text-primary hover:underline">Contact page</a> or email support@impacthub.org.</li>
                  <li><strong>Can I donate anonymously?</strong> Yes, you can choose to hide your name when donating.</li>
                  <li><strong>How do I track my donations?</strong> Log in and visit your dashboard for donation history and impact reports.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center"><Mail className="mr-2 h-5 w-5" /> Need More Help?</h2>
                <p className="text-muted-foreground">If you can't find what you're looking for, reach out to our support team at <a href="mailto:support@impacthub.org" className="text-primary hover:underline">support@impacthub.org</a>.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
};

export default Help;

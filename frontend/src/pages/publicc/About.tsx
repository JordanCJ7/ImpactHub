import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/common/Section';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Section title="About ImpactHub" center>
        <Card className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-8 space-y-8">
            <p className="text-lg text-muted-foreground dark:text-gray-300 text-center">
              ImpactHub is a charity donation platform built to empower donors with transparency, trust, and real-world impact. Our mission is to connect hearts and change lives by making charitable giving simple, secure, and meaningful.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Our Vision</h2>
                <p className="text-muted-foreground dark:text-gray-300">To create a world where every act of generosity leads to measurable change and every donor feels the impact of their contribution.</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Our Values</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Transparency & Trust</li>
                  <li>Community Empowerment</li>
                  <li>Real-World Impact</li>
                  <li>Security & Privacy</li>
                  <li>Continuous Improvement</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Meet the Team</h2>
              <p className="text-muted-foreground mb-4">A passionate group of developers, designers, and changemakers dedicated to making a difference.</p>
              <ul className="flex flex-wrap justify-center gap-6 text-foreground/90">
                <li>Janitha Gamage – Product Owner</li>
                <li>Dewmini Navodya – Scrum Master</li>
                <li>Dulmi Kaushalya – Full-Stack Developer</li>
                <li>Yoshini Lakna – Full-Stack Developer</li>
              </ul>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Contact Us</h2>
              <p className="text-muted-foreground">Have questions or want to partner with us? <a href="/contact" className="text-primary hover:underline">Reach out here</a>.</p>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
};

export default About;

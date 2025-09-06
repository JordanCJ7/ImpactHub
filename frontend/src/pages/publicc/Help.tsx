import React from 'react';
import { HelpCircle, Info, Mail } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center space-y-4">
          <HelpCircle className="h-12 w-12 text-indigo-600" />
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Help Center</h1>
        </div>
        <p className="text-lg text-gray-700 text-center">
          Find answers to common questions, troubleshooting tips, and guidance for using ImpactHub.
        </p>
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2 flex items-center"><Info className="mr-2 h-5 w-5" /> Getting Started</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Browse campaigns and select causes you care about.</li>
              <li>Create an account to track your donations and impact.</li>
              <li>Donate securely using Stripe or PayPal.</li>
              <li>Receive updates and impact reports from charities.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2 flex items-center"><Info className="mr-2 h-5 w-5" /> Frequently Asked Questions</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Is my payment secure?</strong> Yes, all payments are processed via secure gateways (Stripe/PayPal).</li>
              <li><strong>How do I contact support?</strong> Use the <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a> or email support@impacthub.org.</li>
              <li><strong>Can I donate anonymously?</strong> Yes, you can choose to hide your name when donating.</li>
              <li><strong>How do I track my donations?</strong> Log in and visit your dashboard for donation history and impact reports.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2 flex items-center"><Mail className="mr-2 h-5 w-5" /> Need More Help?</h2>
            <p className="text-gray-600">If you can't find what you're looking for, reach out to our support team at <a href="mailto:support@impacthub.org" className="text-indigo-600 hover:underline">support@impacthub.org</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

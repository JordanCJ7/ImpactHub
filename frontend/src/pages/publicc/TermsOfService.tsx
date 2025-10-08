import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Terms of Service</h1>
        <p className="text-gray-700 text-center text-lg mb-6">Last updated: September 6, 2025</p>
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using ImpactHub, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">2. Use of Platform</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be at least 18 years old or have parental consent to use ImpactHub.</li>
              <li>All information provided must be accurate and up-to-date.</li>
              <li>Donations are non-refundable except in cases of proven fraud or error.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">3. User Conduct</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>No unlawful, harmful, or abusive behavior is permitted.</li>
              <li>Respect the privacy and rights of other users and charities.</li>
              <li>Do not attempt to disrupt or misuse the platform.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">4. Privacy</h2>
            <p>Your data is protected according to our <a href="/policies" className="text-indigo-600 hover:underline">Privacy Policy</a>. We do not share personal information without consent except as required by law.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">5. Limitation of Liability</h2>
            <p>ImpactHub is not liable for any indirect, incidental, or consequential damages arising from use of the platform. All donations are at your own risk.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">6. Changes to Terms</h2>
            <p>We may update these Terms of Service at any time. Continued use of ImpactHub after changes means you accept the new terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">7. Contact</h2>
            <p>If you have questions about these terms, please contact us at <a href="mailto:support@impacthub.org" className="text-indigo-600 hover:underline">support@impacthub.org</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

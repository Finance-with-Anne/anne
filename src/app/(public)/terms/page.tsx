export const metadata = { title: "Terms of Service | Finance with Anne" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Terms of Service</h1>
      <p className="mt-4 text-sm text-gray-400">Last updated: 24 June 2026</p>

      <div className="mt-10 space-y-8 text-sm text-gray-600 dark:text-white/60 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using <strong>financewithanne.com</strong>, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. These terms apply to all visitors, users, and anyone who purchases our services.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. Services</h2>
          <p>Finance with Anne offers the following services:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Online courses:</strong> self-paced financial education content</li>
            <li><strong>1-on-1 coaching sessions:</strong> booked and paid for in advance via our booking system</li>
            <li><strong>Digital products:</strong> ebooks, templates, and other downloadable resources</li>
            <li><strong>Community access:</strong> participation in the Money Talks community</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. Payments</h2>
          <p>All payments are processed securely through Flutterwave. Prices are displayed in your local currency (NGN, USD, or GBP) where applicable. By completing a purchase, you authorise Finance with Anne to charge the stated amount.</p>
          <p className="mt-2">Payments are non-refundable except as outlined in Section 4 below.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Refund Policy</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Coaching sessions:</strong> cancellations made at least 24 hours before a session are eligible for a full refund or reschedule. Cancellations within 24 hours are non-refundable.</li>
            <li><strong>Digital products:</strong> due to the nature of digital content, all sales are final. If you experience a technical issue preventing access, contact us within 7 days of purchase.</li>
            <li><strong>Online courses:</strong> refunds may be requested within 7 days of purchase if less than 20% of the course has been accessed.</li>
          </ul>
          <p className="mt-2">To request a refund, email <a href="mailto:hello@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">hello@financewithanne.com</a> with your order details.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. Intellectual Property</h2>
          <p>All content on this platform, including courses, blog posts, videos, templates, and ebooks, is the intellectual property of Finance with Anne. You may not reproduce, distribute, or resell any content without prior written permission.</p>
          <p className="mt-2">Access to purchased content is for personal, non-commercial use only.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must not share your account with others or allow others to access content on your behalf. We reserve the right to suspend accounts found to be in violation of these terms.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. Disclaimer</h2>
          <p>The content provided on Finance with Anne is for educational and informational purposes only. It does not constitute regulated financial advice. We are not liable for any financial decisions you make based on our content. Always consult a qualified financial advisor for personalised advice.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Finance with Anne shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the relevant service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">9. Changes to Terms</h2>
          <p>We reserve the right to update these terms at any time. We will notify you of material changes via email or a notice on the website. Continued use of our services after changes constitutes your acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">10. Governing Law</h2>
          <p>These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts, unless otherwise required by applicable consumer protection law in your country.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">11. Contact</h2>
          <p>For any questions about these terms, contact us at <a href="mailto:hello@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">hello@financewithanne.com</a>.</p>
        </section>

      </div>
    </div>
  );
}

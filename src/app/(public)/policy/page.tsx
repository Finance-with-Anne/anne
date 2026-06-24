export const metadata = { title: "Privacy Policy — Finance with Anne" };

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-4 text-sm text-gray-400">Last updated: 24 June 2026</p>

      <div className="mt-10 space-y-8 text-sm text-gray-600 dark:text-white/60 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. Who We Are</h2>
          <p>Finance with Anne is a personal finance education platform operated by Nkechukwu Anne Enwere. We provide financial coaching, online courses, digital products, and booking services at <strong>financewithanne.com</strong>. References to "we", "us", or "our" in this policy refer to Finance with Anne.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. Information We Collect</h2>
          <p>We collect the following information when you use our services:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> your name and email address when you sign up</li>
            <li><strong>Booking information:</strong> your name, email, phone number, and any answers you provide when booking a session</li>
            <li><strong>Payment information:</strong> transaction references and amounts processed through Flutterwave. We do not store your card details — these are handled directly by Flutterwave</li>
            <li><strong>Usage data:</strong> pages visited, course progress, and interaction with our content</li>
            <li><strong>Communications:</strong> messages you send us via email or the contact form</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. How We Use Your Information</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To deliver services you have purchased (courses, sessions, digital products)</li>
            <li>To send booking confirmations, Google Meet links, and receipts</li>
            <li>To send you educational content and updates you have opted into</li>
            <li>To manage your account and course access</li>
            <li>To improve our platform and offerings</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Third-Party Services</h2>
          <p>We use the following trusted third parties to operate our platform:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Flutterwave</strong> — payment processing</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Google Calendar</strong> — Google Meet link generation for sessions</li>
            <li><strong>Cloudflare R2</strong> — file storage for digital products and course materials</li>
            <li><strong>Vercel</strong> — website hosting</li>
          </ul>
          <p className="mt-2">Each of these services has its own privacy policy governing how they handle your data.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. If you close your account, we will delete your personal data within 30 days unless required by law to retain it longer. Transaction records may be retained for up to 7 years for tax and legal purposes.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent to marketing emails at any time by clicking "unsubscribe"</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:hello@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">hello@financewithanne.com</a>.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. Cookies</h2>
          <p>We use essential cookies to keep you logged in and remember your preferences. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect your ability to use certain features of the site.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">8. Security</h2>
          <p>We take reasonable steps to protect your information, including encrypted connections (HTTPS), secure database storage, and limited access to personal data. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">9. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">10. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:hello@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">hello@financewithanne.com</a>.</p>
        </section>

      </div>
    </div>
  );
}

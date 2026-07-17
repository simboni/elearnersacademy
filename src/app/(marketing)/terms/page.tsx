import Link from "next/link";

export const metadata = { title: "Terms of Service — eLearners Academy" };

export default function TermsPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50 dark:border-navy-800 dark:bg-navy-900/40">
        <div className="container-page py-14">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-2 font-display text-3xl font-black text-navy-900 dark:text-white sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-navy-500 dark:text-slate-400">Last updated: 17 July 2026</p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="prose-content mx-auto max-w-3xl">
          <p>
            Welcome to eLearners Academy. These Terms of Service (&quot;Terms&quot;) govern your
            access to and use of the eLearners Academy website, courses, live sessions, and related
            services (collectively, the &quot;Platform&quot;). By creating an account or using the
            Platform, you agree to be bound by these Terms.
          </p>

          <h2>1. Who we are</h2>
          <p>
            eLearners Academy is an online learning platform based in Kenya, providing education in
            trading, crypto, personal finance, and related topics. References to
            &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; mean eLearners Academy.
          </p>

          <h2>2. Eligibility &amp; accounts</h2>
          <p>
            You must be at least 18 years old, or the age of majority in your jurisdiction, to
            create an account. You are responsible for maintaining the confidentiality of your login
            credentials and for all activity that occurs under your account. Please notify us
            immediately of any unauthorised use.
          </p>

          <h2>3. Courses &amp; access</h2>
          <p>
            When you enroll in a course, we grant you a personal, non-exclusive, non-transferable
            licence to access that course for your own educational use. You may not share, resell,
            record, or redistribute course content without our written permission.
          </p>

          <h2>4. Payments &amp; refunds</h2>
          <p>
            Prices are displayed in Kenyan Shillings (Ksh) unless stated otherwise. Payments may be
            made via M-Pesa, card, or bank transfer. Subscription plans renew automatically until
            cancelled. Where a refund policy applies to a specific course or plan, it will be stated
            at the point of purchase.
          </p>

          <h2>5. Educational purpose &amp; risk disclaimer</h2>
          <p>
            All content on the Platform is provided for educational purposes only and does not
            constitute financial, investment, or trading advice. Trading and investing carry
            significant risk, including the loss of capital. Past performance is not indicative of
            future results. You are solely responsible for your own trading and financial decisions,
            and you should seek independent professional advice where appropriate.
          </p>

          <h2>6. Acceptable use</h2>
          <p>
            You agree not to misuse the Platform. This includes not attempting to gain unauthorised
            access, not uploading harmful or unlawful content, not harassing other members, and not
            using the Platform in any way that infringes the rights of others or violates applicable
            law.
          </p>

          <h2>7. Instructor content</h2>
          <p>
            Instructors retain ownership of the content they create and grant us a licence to host
            and deliver it to learners. Instructors are responsible for ensuring their content is
            accurate, lawful, and does not infringe third-party rights.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            The Platform, including its branding, design, and software, is owned by eLearners
            Academy and protected by intellectual property laws. You may not copy, modify, or create
            derivative works without our permission.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your access if you breach these Terms or use the Platform in
            a way that could cause harm to us or other users. You may close your account at any time.
          </p>

          <h2>10. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, eLearners Academy shall not be liable for any
            indirect, incidental, or consequential losses arising from your use of the Platform,
            including any trading or financial losses.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Kenya, and any disputes shall be
            subject to the exclusive jurisdiction of the Kenyan courts.
          </p>

          <h2>12. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes, and
            your continued use of the Platform after changes take effect constitutes acceptance.
          </p>

          <h2>13. Contact us</h2>
          <p>
            Questions about these Terms? Reach us at hello@elearnersacademy.co.ke or on{" "}
            +254 706 289 514, or via our{" "}
            <Link href="/contact" className="text-sky-dark underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}

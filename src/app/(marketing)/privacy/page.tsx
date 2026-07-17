import Link from "next/link";

export const metadata = { title: "Privacy Policy — eLearners Academy" };

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50 dark:border-navy-800 dark:bg-navy-900/40">
        <div className="container-page py-14">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-2 font-display text-3xl font-black text-navy-900 dark:text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-navy-500 dark:text-slate-400">Last updated: 17 July 2026</p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="prose-content mx-auto max-w-3xl">
          <p>
            eLearners Academy (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy
            and is committed to protecting your personal data. This Privacy Policy explains what
            information we collect, how we use it, and the rights you have. It applies to all users
            of the eLearners Academy platform.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li>
              <strong>Account information</strong> — your name, email address, and password when you
              register.
            </li>
            <li>
              <strong>Profile information</strong> — optional details such as your headline, bio,
              country, and profile photo.
            </li>
            <li>
              <strong>Learning activity</strong> — courses you enroll in, lesson progress, quiz
              results, certificates, and live-session registrations.
            </li>
            <li>
              <strong>Payment information</strong> — processed securely by our payment partners; we
              do not store full card details.
            </li>
            <li>
              <strong>Technical data</strong> — device, browser, and usage information collected to
              keep the Platform secure and reliable.
            </li>
          </ul>

          <h2>2. How we use your information</h2>
          <ul>
            <li>To provide and personalise your learning experience.</li>
            <li>To process enrollments, payments, and issue certificates.</li>
            <li>To power features such as the AI tutor, progress tracking, and live sessions.</li>
            <li>To send important account, course, and live-session notifications.</li>
            <li>To improve our courses, platform, and support.</li>
          </ul>

          <h2>3. Legal basis</h2>
          <p>
            We process your data on the basis of performing our contract with you, your consent
            (which you may withdraw), our legitimate interests in operating and improving the
            Platform, and compliance with applicable Kenyan law, including the Data Protection Act,
            2019.
          </p>

          <h2>4. Sharing your information</h2>
          <p>
            We do not sell your personal data. We share it only with trusted service providers who
            help us operate the Platform (such as payment processors and hosting providers), and only
            as needed to provide our services or where required by law.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember your preferences,
            and understand how the Platform is used. You can control cookies through your browser
            settings.
          </p>

          <h2>6. Data retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to
            provide our services, comply with legal obligations, resolve disputes, and enforce our
            agreements.
          </p>

          <h2>7. Security</h2>
          <p>
            We use appropriate technical and organisational measures to protect your data. However,
            no method of transmission or storage is completely secure, and we cannot guarantee
            absolute security.
          </p>

          <h2>8. Your rights</h2>
          <p>
            Subject to applicable law, you have the right to access, correct, delete, or export your
            personal data, and to object to or restrict certain processing. To exercise these
            rights, please contact us using the details below.
          </p>

          <h2>9. Children</h2>
          <p>
            The Platform is not directed at children under 18, and we do not knowingly collect
            personal data from them.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version on
            this page and revise the &quot;Last updated&quot; date above.
          </p>

          <h2>11. Contact us</h2>
          <p>
            For any privacy questions or requests, contact us at hello@elearnersacademy.co.ke or{" "}
            +254 706 289 514, or via our{" "}
            <Link href="/contact" className="text-sky-dark underline">
              contact page
            </Link>
            . eLearners Academy is based in Nairobi and Bungoma, Kenya.
          </p>
        </div>
      </section>
    </>
  );
}

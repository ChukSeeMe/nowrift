import React from 'react';
import { Metadata } from 'next';
import LegalLayout from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | NowRift',
  description: 'Learn about the cookies, session tokens, and tracking technologies utilized by NowRift and CRAM Services to optimize our AI news feeds.',
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="How NowRift uses cookies, caching indices, and browser storage structures to optimize rendering performance."
      lastUpdated="June 17, 2026"
    >
      <div>
        <h2 className="text-display-l text-off-white mb-4 border-b border-border pb-2">1. Introduction to Cookies</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          CRAM Services (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) uses cookies and similar tracking technologies (such as local storage, web beacons, and session identifiers) when you visit our AI tech news platform, <strong className="text-off-white">NowRift</strong> (located at <code className="text-data text-rift-red bg-surface px-1.5 py-0.5 rounded font-medium">nowrift.com</code>).
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          This Cookie Policy explains what these technologies are, why we use them, and your rights to control their use.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">2. What are Cookies and Local Storage?</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Cookies are small text files stored in your web browser directory or device storage when you visit a website. They allow the platform to identify your device, verify your session status, and save your user preferences over time.
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          <strong className="text-off-white">Local Storage:</strong> In addition to cookies, we use browser-level HTML5 Local Storage to cache configuration scripts, layout preferences (such as filtering channels), and database elements locally to improve page loading speeds.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">3. How We Use Cookies</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We use cookies across several functional categories:
        </p>

        <h3 className="text-display-m text-off-white mt-6 mb-2">A. Essential and System Security Cookies</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These cookies are strictly necessary to provide the core services available through our Site. This includes verifying editor/administrator logins, handling session tokens via JSON Web Tokens (JWT), and tracking API rate-limiting metrics to prevent Denial of Service (DoS) attacks. Disabling these cookies will break admin portal features.
        </p>

        <h3 className="text-display-m text-off-white mt-6 mb-2">B. Personalization and Preference Cookies</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These cookies are used to enhance the performance and functionality of our Site but are non-essential. For example, they allow us to remember:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>Your preferred news channel filter (e.g. defaulting your feed to Cybersecurity or Developers).</li>
          <li>Your search history queries within the Tools Directory directory.</li>
          <li>Default ticker speed configurations or theme settings.</li>
        </ul>

        <h3 className="text-display-m text-off-white mt-6 mb-2">C. Analytical and Subscription Cookies</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These cookies help us analyze how our Site is being used, which posts attract the most reader attention, and if our newsletter signup forms are operating efficiently. They are placed in coordination with our email management sub-processors (Beehiiv/Resend).
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">4. Specific Cookies in Use</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          The table below lists the primary cookies and storage tokens utilized on NowRift:
        </p>

        <div className="overflow-x-auto my-6 border border-border rounded-xl">
          <table className="w-full text-left border-collapse text-body-m">
            <thead>
              <tr className="bg-surface border-b border-border text-off-white font-bold">
                <th className="p-3">Cookie Name</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Type</th>
                <th className="p-3">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted">
              <tr>
                <td className="p-3 font-semibold text-off-white">__session</td>
                <td className="p-3">NowRift (First-party)</td>
                <td className="p-3">Authenticates admin &amp; editor session tokens</td>
                <td className="p-3">HTTP Secure Only</td>
                <td className="p-3">Session</td>
              </tr>
              <tr className="bg-surface/20">
                <td className="p-3 font-semibold text-off-white">nowrift-channel</td>
                <td className="p-3">NowRift (First-party)</td>
                <td className="p-3">Saves preferred tech news feed selection</td>
                <td className="p-3">Browser Local Storage</td>
                <td className="p-3">30 Days</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-off-white">nowrift-cookie-consent</td>
                <td className="p-3">NowRift (First-party)</td>
                <td className="p-3">Records cookie preference choices</td>
                <td className="p-3">HTTP Cookie</td>
                <td className="p-3">1 Year</td>
              </tr>
              <tr className="bg-surface/20">
                <td className="p-3 font-semibold text-off-white">beehiiv_session</td>
                <td className="p-3">Beehiiv (Third-party)</td>
                <td className="p-3">Validates newsletter signup attribution and sources</td>
                <td className="p-3">HTTP Secure Cookie</td>
                <td className="p-3">1 Year</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-off-white">_ga / _gid</td>
                <td className="p-3">Google Analytics</td>
                <td className="p-3">Aggregates anonymous user session patterns</td>
                <td className="p-3">HTTP Cookie</td>
                <td className="p-3">2 Years / 24 Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">5. How Can You Control Cookies?</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          You have the right to decide whether to accept or reject cookies. Most web browsers allow you to modify cookie preferences within their configuration menus.
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>
            <strong className="text-off-white">Browser Controls:</strong> You can set your browser to accept all cookies, notify you when a cookie is issued, or refuse cookies at any time. Consult your browser&apos;s Help menu for instructions.
          </li>
          <li>
            <strong className="text-off-white">Opting Out:</strong> If you decline essential cookies, you may still access our news feeds, but you will not be able to log into the editor portal or access CMS controls.
          </li>
          <li>
            <strong className="text-off-white">Do Not Track (DNT):</strong> Some web browsers transmit DNT signals. Because there is currently no universal consensus standard, our systems do not alter performance metrics in response to DNT triggers.
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">6. Updates to this Cookie Policy</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We may update this Cookie Policy from time to time to reflect changes in our operational tracking practices, sub-processors, or legal requirements. Please re-visit this page periodically to remain informed about our cookie utilization.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">7. Contact Information</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          If you have questions or feedback about our use of cookies or tracking technologies, please contact us at:
        </p>
        <div className="p-4 rounded-xl bg-surface/30 border border-border/80 text-body-m text-muted flex flex-col gap-1 select-all">
          <strong className="text-off-white font-bold">CRAM Services Legal Division</strong>
          <span>Attn: NowRift Cookie Compliance Team</span>
          <span>Email: legal@nowrift.com</span>
        </div>
      </div>
    </LegalLayout>
  );
}

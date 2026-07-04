import React from 'react';
import { Metadata } from 'next';
import LegalLayout from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | NowRift',
  description: 'Learn how NowRift and CRAM Services collect, protect, and process user data, subscriber metrics, and AI compliance audit parameters.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we manage user data, AI-synthesized credentials, and compliance tracking metrics across the NowRift engine."
      lastUpdated="June 17, 2026"
    >
      <div>
        <h2 className="text-display-l text-off-white mb-4 border-b border-border pb-2">1. Overview and Scope</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          NowRift (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by <strong className="text-off-white">CRAM Services</strong>, is dedicated to protecting your privacy. This Privacy Policy details how we collect, process, utilize, and protect your personal information when you access our AI-synthesized daily tech and AI news platform, search tech professional directories, apply for funding via our Grants Hub, or register for our newsletter alerts.
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          By utilizing the website located at <code className="text-data text-rift-red bg-surface px-1.5 py-0.5 rounded font-medium">nowrift.com</code> (the &quot;Service&quot;), you consent to the data collection and usage practices described in this policy. If you do not agree with any terms in this Privacy Policy, please discontinue access to the Service.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">2. Information We Collect</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We collect several categories of information depending on how you interact with our platform:
        </p>

        <h3 className="text-display-m text-off-white mt-6 mb-2">A. Information You Voluntarily Provide</h3>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>
            <strong className="text-off-white">Newsletter Subscriptions:</strong> When you subscribe to our tech alerts or deep dive notifications, we collect your email address. This is processed and stored in collaboration with our distribution sub-processors (<strong className="text-off-white">Beehiiv</strong> and <strong className="text-off-white">Resend</strong>).
          </li>
          <li>
            <strong className="text-off-white">Administrator Credentials:</strong> If you are an authorized editor or administrator logging into the backend CMS, we collect your username, email address, password hashes, and multi-factor authentication setup parameters (stored securely via bcryptjs and jose JWT tokens).
          </li>
          <li>
            <strong className="text-off-white">Support Communications:</strong> If you contact us directly for legal, editorial, or partnership inquiries, we keep a record of that correspondence, including your email and name.
          </li>
        </ul>

        <h3 className="text-display-m text-off-white mt-6 mb-2">B. Automatically Collected Technical Information</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          When you browse the platform, our servers and network log standard request headers automatically, including:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>Device details, operating systems, and browser user-agent tokens.</li>
          <li>Network identifiers, such as IP addresses (which may suggest general geographical location).</li>
          <li>Navigation logs, including channels selected (e.g., Data Science, AI Models, Cybersecurity), scroll behavior, visual scroller speeds, and exact content links clicked.</li>
        </ul>

        <h3 className="text-display-m text-off-white mt-6 mb-2">C. AI Synthesis and Indexing Metadata</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Our automated news crawler indexes public technology feeds, developer repositories, and academic publications. During this synthesis:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>We extract public authorship metadata (such as primary author names, publication sources, and original URLs).</li>
          <li>We perform compliance analysis resulting in an <strong className="text-off-white">AI Compliance Score</strong> and source similarity audits. This data is displayed publicly to ensure media transparency and original author attribution.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">3. How We Use Your Information</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          CRAM Services processes the data we gather on NowRift for the following commercial and operational purposes:
        </p>
        <ol className="list-decimal pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>
            <strong className="text-off-white">Service Delivery:</strong> To generate and render our vertical-based feeds, searchable developer tools lists, and matching grants directories.
          </li>
          <li>
            <strong className="text-off-white">Communications:</strong> To send you daily intelligence reports, platform alerts, and administrative notifications via email.
          </li>
          <li>
            <strong className="text-off-white">Security &amp; Abuse Prevention:</strong> To authenticate admin portal logins, prevent scraping abuse, verify session tokens, and block malicious attacks on our systems.
          </li>
          <li>
            <strong className="text-off-white">Analytics and Optimization:</strong> To monitor system resources, load balancing, page loading speeds, and optimize dynamic scroller velocities based on actual user activity.
          </li>
          <li>
            <strong className="text-off-white">Compliance Logs:</strong> To maintain verifiable records of original articles parsed for AI synthesis, validating similarity metrics for licensing and fair use reporting.
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">4. Sub-processors and Sharing Partners</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We do not sell, rent, or trade your personal information. To maintain system operations, we disclose necessary data to verified sub-processors who adhere to strict data security standards:
        </p>

        <div className="overflow-x-auto my-6 border border-border rounded-xl">
          <table className="w-full text-left border-collapse text-body-m">
            <thead>
              <tr className="bg-surface border-b border-border text-off-white font-bold">
                <th className="p-3">Partner / Service</th>
                <th className="p-3">Data Categories Shared</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted">
              <tr>
                <td className="p-3 font-semibold text-off-white">Beehiiv Inc.</td>
                <td className="p-3">Email, subscription timestamps</td>
                <td className="p-3">Newsletter delivery, segment analytics</td>
              </tr>
              <tr className="bg-surface/20">
                <td className="p-3 font-semibold text-off-white">Resend Inc.</td>
                <td className="p-3">Email, recipient logs</td>
                <td className="p-3">Transactional alerts &amp; validation tokens</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-off-white">Upstash Inc.</td>
                <td className="p-3">IP hashes, rate limit counters</td>
                <td className="p-3">Redis-based edge caching and security controls</td>
              </tr>
              <tr className="bg-surface/20">
                <td className="p-3 font-semibold text-off-white">Prisma / PostgreSQL</td>
                <td className="p-3">Admin records, session tokens, crawled headers</td>
                <td className="p-3">Core relational storage of news platform data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">5. Data Retention and Safeguards</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We store your information for as long as is necessary to fulfill the specific operational purposes outlined in Section 3. For example:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>Newsletter subscriber details are retained until you opt out of our email lists using the &quot;unsubscribe&quot; link.</li>
          <li>System logs and security rate-limiting caches are deleted automatically within 30 days.</li>
          <li>AI-extracted attribution metadata remains inside our database as long as the corresponding synthesized article is published on the site.</li>
        </ul>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We maintain administrative, technical, and physical safeguards designed to protect personal information against accidental, unlawful, or unauthorized destruction, loss, alteration, access, disclosure, or use.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">6. Global Rights (GDPR / CCPA / CCPA Opt-Out)</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Depending on your jurisdiction, you may have specific data protection rights, including:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>
            <strong className="text-off-white">Right to Access and Portability:</strong> You can request a digital copy of all personal information we hold about you.
          </li>
          <li>
            <strong className="text-off-white">Right to Rectification and Erasure (&quot;Right to be Forgotten&quot;):</strong> You can request that we update incorrect details or delete your records from our databases.
          </li>
          <li>
            <strong className="text-off-white">Attribution Updates for AI Summaries:</strong> If you are an original content author and notice incorrect attribution or audit details on our synthesized posts, you may contact our legal team for an immediate review and correction.
          </li>
          <li>
            <strong className="text-off-white">Right to Opt Out:</strong> You can choose to opt-out of newsletter list inclusion at any time.
          </li>
        </ul>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          To exercise any of these rights, please email us directly at <code className="text-data text-rift-red bg-surface px-1.5 py-0.5 rounded font-medium">legal@nowrift.com</code>. We will verify your identity before processing the request, matching standard legal timelines.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">7. Updates to this Policy</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          We reserve the right to modify this Privacy Policy at any time to reflect software updates, changes in governing law, or the introduction of new service providers. The current version will be posted directly to our footer with a modified &quot;Last Updated&quot; timestamp at the top of the document.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">8. Contact Information</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          If you have any questions, feedback, or legal inquiries regarding our privacy procedures, please contact us at:
        </p>
        <div className="p-4 rounded-xl bg-surface/30 border border-border/80 text-body-m text-muted flex flex-col gap-1 select-all">
          <strong className="text-off-white">CRAM Services Legal Division</strong>
          <span>Attn: NowRift Compliance Team</span>
          <span>Email: legal@nowrift.com</span>
        </div>
      </div>
    </LegalLayout>
  );
}

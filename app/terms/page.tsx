import React from 'react';
import { Metadata } from 'next';
import LegalLayout from '@/components/layout/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | NowRift',
  description: 'Understand the terms, guidelines, intellectual property rules, and warranty disclaimers governing the use of the NowRift platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The contractual terms and legal boundaries governing your relationship with NowRift and CRAM Services."
      lastUpdated="June 17, 2026"
    >
      <div>
        <h2 className="text-display-l text-off-white mb-4 border-b border-border pb-2">1. Agreement to Terms</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and <strong className="text-off-white">CRAM Services</strong>, concerning your access to and use of the <strong className="text-off-white">NowRift</strong> website located at <code className="text-data text-rift-red bg-surface px-1.5 py-0.5 rounded font-medium">nowrift.com</code>, as well as any other media form, media channel, mobile application, database, or API associated, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          By accessing the Site, you represent that you have read, understood, and agreed to be bound by all of these Terms. If you do not agree with all of these Terms, you are prohibited from using the Site and must discontinue use immediately.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">2. Intellectual Property Rights</h2>
        
        <h3 className="text-display-m text-off-white mt-6 mb-2">A. Platform Materials</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Unless otherwise indicated, the Site and its source code, databases, backend CMS, layout designs, CSS styling, UI components, custom scroller scripts, database architectures, graphics, and branding are our proprietary property and are protected by copyright, trademark, and trade secret laws.
        </p>

        <h3 className="text-display-m text-off-white mt-6 mb-2">B. Synthesized Summaries and Content Indexes</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          NowRift compiles, analyzes, and summarizes technical reports, developers&apos; newsletters, and industry events using automated synthesis engines.
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>
            <strong className="text-off-white">Fair Use &amp; Attribution:</strong> Our summaries are designed for commentary, news reporting, and educational purposes. We display original author attributions, source URLs, and compliance audits to reference external material.
          </li>
          <li>
            <strong className="text-off-white">Copyright of Summaries:</strong> The specific synthesized summaries, commentary, and compliance records synthesized by CRAM Services engines are copyrighted properties of NowRift. You may not scrape, reproduce, or republish these summaries in bulk without our express written permission.
          </li>
          <li>
            <strong className="text-off-white">Original Content:</strong> The copyright of any summarized external article, logo, or image indexed by our system belongs strictly to its respective publisher, author, or licensing entity.
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">3. User Representations and Account Security</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          When accessing the Site, you warrant that you will comply with all local, state, national, and international laws.
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          For administrator and editor accounts:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>You are responsible for safeguarding your login credentials and multi-factor authentication codes.</li>
          <li>You must immediately notify us if you suspect any unauthorized access, token leakage, or credential theft.</li>
          <li>We reserve the right to remove, reclaim, or change username tags or editor accounts that we determine to be inappropriate, inactive, or insecure.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">4. Disclaimers and Exclusions of Warranty</h2>
        
        <h3 className="text-display-m text-off-white mt-6 mb-2">A. AI Synthesis Disclaimer</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Our articles and news feeds are compiled using automated systems and AI language models. While we calculate similarity scores and audit sources to maintain quality control, CRAM Services does not warrant the completeness, absolute accuracy, reliability, or timeliness of the synthesized news. AI summaries should be used as secondary resources, and you should verify critical technical claims directly with the cited original sources.
        </p>

        <h3 className="text-display-m text-off-white mt-6 mb-2">B. Grants Hub and Financial Information</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          NowRift lists technology funding opportunities, open grants, and corporate sponsorships inside our Grants Hub.
        </p>
        <div className="p-4 bg-surface/40 border border-border/80 rounded-xl mb-4 text-body-l text-muted font-light leading-relaxed">
          <strong className="text-off-white font-semibold">CRITICAL NOTICE:</strong> CRAM Services is not a financial institution, grantor, or legal adviser. We do not distribute listed grants (unless explicitly stated) and are not associated with external grantors. We make no warranty that grants listed are active, valid, or suitable for your organization. You apply for any listed grant at your own discretion and sole risk.
        </div>

        <h3 className="text-display-m text-off-white mt-6 mb-2">C. Tech Tools Directory</h3>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          Our Tools tab highlights recent software tools, APIs, models, and agents. Listings do not constitute endorsements. We make no warranty regarding software functionality, security, licensing terms, or pricing accuracy.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">5. Prohibited Activities</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activities include, but are not limited to:
        </p>
        <ul className="list-disc pl-6 text-body-l text-muted leading-relaxed mb-4 space-y-2">
          <li>Systematic retrieval of data or content from the Site to create or compile, directly or indirectly, a database, directory, or software crawler without written permission from us.</li>
          <li>Circumventing, disabling, or otherwise interfering with security-related features of the Site, including authentication mechanisms, rate-limiting caches, or cookie structures.</li>
          <li>Tricking, defrauding, or misleading us and other users, especially in any attempt to learn sensitive account credentials.</li>
          <li>Using the Site or its underlying data to train competing AI language models or intelligence aggregators without licensing agreements.</li>
          <li>Flooding the search controllers or newsletter API endpoints with automated requests designed to exhaust network bandwidth or database instances.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">6. Limitation of Liability</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          IN NO EVENT WILL CRAM SERVICES, OUR DIRECTORS, EMPLOYEES, AGENTS, OR THIRD-PARTY PARTNERS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, DATA LOSS, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US FOR SERVICES DURING THE SIX (6) MONTH PERIOD PRIOR TO THE EVENT GIVING RISE TO LIABILITY.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">7. Dispute Resolution and Governing Law</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These Terms and your use of the Site are governed by and construed in accordance with the laws of the <strong className="text-off-white">State of Delaware</strong>, without regard to its conflict of law principles. Any legal action or proceeding arising out of or related to these Terms shall be brought exclusively in the state or federal courts located in Delaware, and you consent to personal jurisdiction therein.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">8. Term and Termination</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          These Terms shall remain in full force and effect while you use the Site. We reserve the right, in our sole discretion and without notice or liability, to deny access to and use of the Site (including blocking specific IP addresses or sessions) to any person for any reason, including without limitation for breach of any representation, warranty, or covenant contained in these Terms.
        </p>
      </div>

      <div>
        <h2 className="text-display-l text-off-white mt-8 mb-4 border-b border-border pb-2">9. Contact Information</h2>
        <p className="text-body-l text-muted leading-relaxed mb-4">
          To resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
        </p>
        <div className="p-4 rounded-xl bg-surface/30 border border-border/80 text-body-m text-muted flex flex-col gap-1 select-all">
          <strong className="text-off-white font-bold">CRAM Services Legal Division</strong>
          <span>Attn: NowRift Compliance Officer</span>
          <span>Email: legal@nowrift.com</span>
        </div>
      </div>
    </LegalLayout>
  );
}

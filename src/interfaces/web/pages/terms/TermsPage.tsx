import {
  FileText,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Scale,
  Sparkles,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Mail,
} from "lucide-react";
import Link from "next/link";

/**
 * TermsPage - Server Component
 *
 * Public page with PIVOT AI's Terms of Service.
 * Covers acceptance, service description, user accounts, acceptable use,
 * intellectual property, AI disclaimer, liability, and termination.
 *
 * @layer Interface (Web)
 */
export default function TermsPage(): React.ReactElement {
  const lastUpdated = "February 17, 2026";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6]">
      {/* Section 1 — Hero */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
            Legal
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Terms of <span className="text-[#1E5F74]">Service</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            These terms govern your use of PIVOT AI. Please read them carefully
            before using the platform.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Section 2 — Acceptance of Terms */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Acceptance
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Acceptance of Terms
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            By accessing or using PIVOT AI (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, you must not use the Service.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "🔞",
                title: "Age Requirement",
                description:
                  "You must be at least 18 years old to create an account and use PIVOT AI. By using the Service, you represent that you meet this requirement.",
              },
              {
                icon: "✅",
                title: "Binding Agreement",
                description:
                  "Your continued use of the Service after any modification to these Terms constitutes your acceptance of the updated terms. We encourage you to review this page periodically.",
              },
              {
                icon: "👤",
                title: "Individual Use",
                description:
                  "These Terms apply to you as an individual. You may not transfer, assign, or sublicense your account or rights under these Terms to any third party.",
              },
              {
                icon: "📋",
                title: "Related Policies",
                description:
                  "These Terms incorporate our Privacy Policy by reference. Your use of the Service is also governed by our Privacy Policy, which describes how we collect and use your data.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E5F74]/10">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Description of Service */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              The Service
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            What PIVOT AI provides
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            PIVOT AI is an AI-powered career learning platform that generates
            personalized learning roadmaps based on your profile, goals, and
            experience. The Service is provided on an &quot;as is&quot; and
            &quot;as available&quot; basis.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                item: "Personalized roadmap generation",
                detail:
                  "PIVOT AI uses Google Gemini AI to generate tailored learning paths based on the information you provide in your profile.",
              },
              {
                item: "Progress tracking",
                detail:
                  "The platform stores your milestones, completions, and activity so you can track your development over time.",
              },
              {
                item: "Educational content curation",
                detail:
                  "The Service may surface learning resources, projects, and career guidance. These are provided for informational purposes only.",
              },
              {
                item: "Service availability",
                detail:
                  "We strive for high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time without notice.",
              },
            ].map((item) => (
              <li
                key={item.item}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#1E5F74]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.item}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 4 — User Accounts */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              User Accounts
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Your account responsibilities
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            You are responsible for maintaining the security of your account and
            for all activities that occur under your account.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                right: "Accurate information",
                detail:
                  "You agree to provide accurate, current, and complete information when creating your account and to keep your profile information up to date.",
              },
              {
                right: "Account security",
                detail:
                  "You are responsible for safeguarding your account credentials. Notify us immediately at marcolopezf00@gmail.com if you suspect any unauthorized access to your account.",
              },
              {
                right: "One account per person",
                detail:
                  "You may not create multiple accounts for the same individual. Creating accounts to circumvent restrictions or bans is prohibited.",
              },
              {
                right: "Non-transferable",
                detail:
                  "Your account is personal to you and may not be shared with or transferred to any other person.",
              },
            ].map((item) => (
              <div
                key={item.right}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.right}
                </h4>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Acceptable Use */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Acceptable Use
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            How you may use the Service
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            PIVOT AI is intended for personal, non-commercial use to support
            your career learning and development. The following activities are
            strictly prohibited.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "🚫",
                title: "No abuse or misuse",
                description:
                  "You may not attempt to interfere with, disrupt, or compromise the integrity of the Service, its servers, or networks.",
              },
              {
                icon: "🤖",
                title: "No automated scraping",
                description:
                  "You may not use bots, scrapers, or automated tools to access or collect data from PIVOT AI without our prior written consent.",
              },
              {
                icon: "⚖️",
                title: "No unlawful use",
                description:
                  "You may not use the Service for any purpose that violates applicable laws or regulations, or to infringe the rights of any third party.",
              },
              {
                icon: "🔓",
                title: "No unauthorized access",
                description:
                  "You may not attempt to gain unauthorized access to any portion of the Service, other user accounts, or our underlying infrastructure.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E5F74]/10">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              ⚠️ Roadmap fair use policy.
            </strong>{" "}
            Generating an excessive number of roadmaps in a short period of
            time, or using the roadmap generation feature in a way that
            constitutes abuse of the AI resources provided, may result in
            temporary suspension or permanent termination of your account
            without prior notice.
          </p>
        </div>
      </section>

      {/* Section 6 — Intellectual Property */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Intellectual Property
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Ownership of content
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            This section explains what PIVOT AI owns, what you own, and who owns
            the AI-generated content created for you.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="font-semibold text-slate-900">
                PIVOT AI Platform
              </h4>
              <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                Our Intellectual Property
              </span>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                The PIVOT AI name, logo, platform design, source code, and all
                associated software are the exclusive property of PIVOT AI and
                its creator. Nothing in these Terms grants you any right to use
                our trademarks, trade names, or branding.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="font-semibold text-slate-900">
                AI-Generated Roadmaps
              </h4>
              <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                Your Content
              </span>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                The roadmaps, milestones, and learning content generated
                specifically for your profile are yours for personal use. By
                using the Service, you grant PIVOT AI a non-exclusive,
                royalty-free license to store and display this content within
                the platform on your behalf.
              </p>
            </div>
          </div>

          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <strong className="text-slate-800">
              Your profile data belongs to you.
            </strong>{" "}
            The information you provide — your background, goals, and experience
            — is yours. You may request its deletion at any time through our{" "}
            <Link href="/contact" className="text-[#1E5F74] hover:underline">
              contact form
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Section 7 — AI Disclaimer */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              AI Disclaimer
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Understanding AI-generated content
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            PIVOT AI uses Google Gemini AI to generate learning roadmaps and
            career guidance. You should understand the limitations of this
            technology before relying on its output.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                item: "Not professional advice",
                detail:
                  "The content generated by PIVOT AI is for informational and educational purposes only. It does not constitute professional career counseling, legal, financial, or employment advice. Always consult qualified professionals for important career decisions.",
              },
              {
                item: "AI can make mistakes",
                detail:
                  "AI-generated content may be inaccurate, outdated, incomplete, or unsuitable for your specific situation. We do not guarantee the accuracy, relevance, or quality of any AI-generated roadmap or recommendation.",
              },
              {
                item: "Technology limitations",
                detail:
                  "AI models have inherent limitations including knowledge cutoffs, potential biases, and the inability to account for your full personal context. The roadmaps are a starting point, not a definitive career plan.",
              },
              {
                item: "No endorsement of third-party resources",
                detail:
                  "References to external courses, tools, or companies in AI-generated content do not constitute endorsement by PIVOT AI. You are responsible for evaluating any third-party resources before using or purchasing them.",
              },
            ].map((item) => (
              <li
                key={item.item}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#1E5F74]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.item}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 8 — Limitation of Liability & Termination */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 sm:grid-cols-2">
            {/* Limitation of Liability */}
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  Liability
                </h2>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                Limitation of Liability
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                To the maximum extent permitted by law, PIVOT AI and its creator
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising out of or related to
                your use of the Service.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                The Service is provided &quot;as is&quot; without warranties of
                any kind, either express or implied, including but not limited
                to warranties of merchantability, fitness for a particular
                purpose, or non-infringement.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Our total liability to you for any claim arising from these
                Terms or your use of the Service shall not exceed the amount you
                paid us in the twelve months preceding the claim, or USD $10,
                whichever is greater.
              </p>
            </div>

            {/* Termination */}
            <div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  Termination
                </h2>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                Account termination
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                You may close your account at any time by contacting us through
                our{" "}
                <Link
                  href="/contact"
                  className="text-[#1E5F74] hover:underline"
                >
                  contact form
                </Link>
                . Upon closure, your data will be deleted within 30 days.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We reserve the right to suspend or terminate your account, with
                or without notice, if we determine that you have violated these
                Terms, engaged in fraudulent activity, or if continued access
                poses a risk to other users or the platform.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Upon termination, your right to use the Service ceases
                immediately. Sections of these Terms that by their nature should
                survive termination will remain in effect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 — Changes & Contact */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Changes to Terms */}
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  Updates
                </h2>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                Changes to these Terms
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We may update these Terms of Service as the platform evolves.
                When we make significant changes, we will update the &quot;Last
                updated&quot; date at the top of this page.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Continued use of PIVOT AI after changes are posted constitutes
                your acceptance of the revised Terms. If you do not agree to the
                updated Terms, you must stop using the Service.
              </p>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  Contact
                </h2>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                Questions about these Terms
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                If you have questions about these Terms of Service or need to
                report a violation, please reach out to us through our contact
                form. We will do our best to respond promptly.
              </p>
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D2D50] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#152340]"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

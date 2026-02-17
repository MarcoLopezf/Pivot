import { Shield, Eye, Server, Lock, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * PrivacyPage - Server Component
 *
 * Public page with PIVOT AI's Privacy Policy.
 * Covers data collection, usage, third-party services, and user rights.
 *
 * @layer Interface (Web)
 */
export default function PrivacyPage(): React.ReactElement {
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
            Privacy <span className="text-[#1E5F74]">Policy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            We built PIVOT AI with privacy in mind. Here&apos;s exactly what we
            collect, why we collect it, and how we protect it.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Section 2 — What We Collect */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Data Collection
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            What information we collect
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            We collect only what&apos;s necessary to provide you with a
            personalized learning experience. We do not sell your data, and we
            never will.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Account Information",
                description:
                  "Your email address is collected and managed by Supabase Auth when you create an account or sign in. We do not store your password — Supabase handles authentication securely.",
                icon: "📧",
              },
              {
                title: "Profile Data",
                description:
                  "Your name, current experience level, and professional background you provide during onboarding. This data is used exclusively to generate your personalized learning roadmap.",
                icon: "👤",
              },
              {
                title: "Learning Activity",
                description:
                  "Your roadmaps, milestones, and progress within the platform. This helps us show you your own progress and improve our AI recommendations over time.",
                icon: "📚",
              },
              {
                title: "Usage Data",
                description:
                  "Basic interaction data such as pages visited and features used, collected to improve the platform. No advertising profiles are built from this data.",
                icon: "📊",
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

      {/* Section 3 — How We Use It */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Data Usage
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            How we use your information
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Your data is used for one purpose: to make PIVOT AI work better for
            you. We do not use your personal information for advertising,
            profiling, or any purpose unrelated to the service.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                purpose: "Generate personalized roadmaps",
                detail:
                  "Your profile and background are sent to our AI engine to create a learning path tailored to your goals.",
              },
              {
                purpose: "Track your learning progress",
                detail:
                  "Your activity within the platform is stored so you can pick up where you left off and measure your growth.",
              },
              {
                purpose: "Improve the platform",
                detail:
                  "Aggregated and anonymized usage data helps us identify what's working and what needs improvement.",
              },
              {
                purpose: "Communicate with you",
                detail:
                  "If you reach out via our contact form, we use your email to respond. We do not send marketing emails without your explicit consent.",
              },
            ].map((item) => (
              <li
                key={item.purpose}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#1E5F74]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.purpose}
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

      {/* Section 4 — Third Parties */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Third-Party Services
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Who we share your data with
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            We work with a small number of trusted infrastructure providers to
            run PIVOT AI. We only share the minimum data necessary for each
            service to function.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="font-semibold text-slate-900">Supabase</h4>
              <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                Authentication & Database
              </span>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Supabase manages user authentication and stores your account and
                profile data in a PostgreSQL database. Supabase is SOC 2
                compliant and processes data in accordance with GDPR. Data is
                stored in secure, encrypted infrastructure.
              </p>
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-[#1E5F74] hover:underline"
              >
                Supabase Privacy Policy →
              </a>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="font-semibold text-slate-900">Google Gemini AI</h4>
              <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                AI Processing
              </span>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Your profile data (background, goals, experience level) is sent
                to Google&apos;s Gemini AI model to generate your personalized
                roadmap. Google processes this data as a data processor under
                our instructions and does not use it to train their models by
                default.
              </p>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-[#1E5F74] hover:underline"
              >
                Google Privacy Policy →
              </a>
            </div>
          </div>

          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <strong className="text-slate-800">
              We do not sell your data.
            </strong>{" "}
            We do not share your personal information with advertisers, data
            brokers, or any third party beyond the services listed above.
          </p>
        </div>
      </section>

      {/* Section 5 — Security */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Security
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            How we protect your data
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Security is a core part of our infrastructure, not an afterthought.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🔐",
                title: "Encrypted in Transit",
                description:
                  "All data between your browser and our servers is encrypted using HTTPS/TLS.",
              },
              {
                icon: "🗄️",
                title: "Encrypted at Rest",
                description:
                  "Your data stored in Supabase is encrypted at rest using industry-standard AES-256.",
              },
              {
                icon: "🔑",
                title: "Secure Authentication",
                description:
                  "We never store passwords. Authentication is delegated to Supabase Auth with secure token management.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E5F74]/10">
                  <span className="text-xl">{item.icon}</span>
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

      {/* Section 6 — Your Rights */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1E5F74]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
              Your Rights
            </h2>
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Control over your data
          </h3>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Regardless of where you are located, you have rights over your
            personal data. We are committed to honoring them.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                right: "Access your data",
                detail:
                  "You can view all your profile and learning data directly within the PIVOT AI platform at any time.",
              },
              {
                right: "Correct your data",
                detail:
                  "You can update your profile information from your account settings at any time.",
              },
              {
                right: "Delete your data",
                detail:
                  "You can request deletion of your account and all associated data by contacting us through the contact form. We will process your request within 30 days.",
              },
              {
                right: "Opt out of communications",
                detail:
                  "We don't send marketing emails during the MVP phase. If this changes, we will always include an unsubscribe option.",
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

      {/* Section 7 — Updates & Contact */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Policy Updates */}
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#1E5F74]" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#1E5F74]">
                  Policy Updates
                </h2>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                Changes to this policy
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We may update this Privacy Policy as the platform evolves. When
                we make significant changes, we will update the &quot;Last
                updated&quot; date at the top of this page.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We encourage you to review this page periodically. Continued use
                of PIVOT AI after changes constitutes your acceptance of the
                updated policy.
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
                Privacy questions
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                If you have questions about this Privacy Policy, want to
                exercise your data rights, or want to report a privacy concern,
                please reach out to us through our contact form.
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

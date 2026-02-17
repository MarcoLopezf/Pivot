import Link from "next/link";
import { Mail, MapPin, Github, Linkedin } from "lucide-react";
import { ContactForm } from "@interfaces/web/components/contact/ContactForm";

/**
 * ContactPage - Server Component
 *
 * Two-column layout with contact information and a contact form.
 * Public page, no authentication required.
 *
 * @layer Interface (Web)
 */
export default function ContactPage(): React.ReactElement {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
                Contact Us
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                We are here to help your{" "}
                <span className="text-[#1D2D50]">career transition</span>.
              </h1>
              <p className="text-lg text-slate-600">
                Have a question, feedback, or want to report a bug? We&apos;d
                love to hear from you. Fill out the form and we&apos;ll get back
                to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:marcolopezf00@gmail.com"
                className="flex items-center gap-3 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm">marcolopezf00@gmail.com</span>
              </a>

              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm">Tucuman, Argentina</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/MarcoLopezf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/marcolopezfarias"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

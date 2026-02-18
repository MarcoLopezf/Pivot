import Link from "next/link";
import { Github, Linkedin, Mail, MapPin, Code2 } from "lucide-react";

/**
 * CreatorCard - Server Component
 *
 * Static card displaying the creator's profile with bio,
 * tech stack, and social links. No interactivity needed.
 *
 * @layer Interface (Web)
 */
export function CreatorCard(): React.ReactElement {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1D2D50] text-lg font-bold text-white">
          ML
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Marco Lopez Farias
          </h3>
          <p className="text-sm text-slate-500">Full-Stack Developer</p>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-4 space-y-2">
        <p className="text-sm leading-relaxed text-slate-600">
          Software developer passionate about building tools that make learning
          more accessible. PIVOT AI is my Final Master&apos;s Project (TFM),
          born from the frustration of navigating career transitions without
          clear guidance.
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          I believe that personalized, AI-driven learning paths can replace the
          chaos of information overload with clarity and direction.
        </p>
      </div>

      {/* Location */}
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="h-4 w-4" />
        <span>Tucuman, Argentina</span>
      </div>

      {/* Tech Stack */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Code2 className="h-4 w-4" />
          <span>Tech Stack</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "TypeScript",
            "React",
            "Next.js",
            "Node.js",
            "PostgreSQL",
            "Prisma",
            "Tailwind CSS",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="https://github.com/MarcoLopezf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <Github className="h-4 w-4" />
        </Link>
        <Link
          href="https://linkedin.com/in/marcolopezfarias"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <Linkedin className="h-4 w-4" />
        </Link>
        <Link
          href="mailto:marcolopezf00@gmail.com"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <Mail className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

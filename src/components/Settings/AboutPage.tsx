import { ExternalLink, Code, Mail, Github, Linkedin, Globe } from "lucide-react";
import SettingsLayout from "./SettingsLayout";

export default function AboutPage() {
  const REPO_URL = "https://github.com/AryanAnand-ux/Loom2.git";
  const GITHUB = "https://github.com/AryanAnand-ux";
  const LINKEDIN = "https://www.linkedin.com/in/aryananand-ux";
  const EMAIL = "aryan.anand1806@gmail.com";
  const PORTFOLIO = "https://portfolio-one-phi-97.vercel.app/";

  return (
    <SettingsLayout title="About & Contact" subtitle="Source, social links, and contact">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <Code size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Developer</p>
            <h3 className="text-lg font-serif italic text-gray-900">About & Contact</h3>
          </div>
        </div>

        <div className="space-y-4">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Code size={18} />
              <div>
                <p className="text-sm font-medium">Source Code</p>
                <p className="text-xs text-gray-500">View the project repository</p>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          <a href={GITHUB} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Github size={18} />
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-gray-500">Open my GitHub profile</p>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          <a href={LINKEDIN} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Linkedin size={18} />
              <div>
                <p className="text-sm font-medium">LinkedIn</p>
                <p className="text-xs text-gray-500">Connect on LinkedIn</p>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          <a href={PORTFOLIO} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Globe size={18} />
              <div>
                <p className="text-sm font-medium">Portfolio</p>
                <p className="text-xs text-gray-500">Visit my personal website</p>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          <a href={EMAIL} className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-gray-500">Send me a message</p>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </SettingsLayout>
  );
}

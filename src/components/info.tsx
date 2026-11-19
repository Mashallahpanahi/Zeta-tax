import { useEffect } from "react";
import {
  FaCode,
  FaDesktop,
  FaLaptopCode,
  FaPhoneAlt,
  FaRegCalendarAlt,
  FaServer,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { TbDatabaseHeart } from "react-icons/tb";

type InfoProps = {
  open: boolean;
  onClose: () => void;
};

const techStack = ["React", "Tailwind CSS", "NestJS", "PostgreSQL", "Swagger"];

const team = [
  {
    name: "Mashallah Panahi",
    phone: "+9377146428",
    role: "Worked more on the backend",
  },
  {
    name: "Hamida Rahimi",
    phone: "+93764149343",
    role: "Worked more on the frontend",
  },
  {
    name: "Negin Muhammadi",
    phone: "+93789659630",
    role: "Worked more on the frontend",
  },
  {
    name: "Fraidon Ahmadian",
    phone: "+93766870348",
    role: "Gave the requirements & the whole system idea",
  },
];

const Info = ({ open, onClose }: InfoProps) => {
  // close with ESC + lock background scroll
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-info-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-tl-3xl rounded-bl-3xl bg-white shadow-2xl 
           [&::-webkit-scrollbar]:w-1.5 
           [&::-webkit-scrollbar-track]:bg-transparent 
           [&::-webkit-scrollbar-thumb]:bg-blue-firstRate
           hover:[&::-webkit-scrollbar-thumb]:bg-blue-firstRate"
      >
        {/* ---------- Header ---------- */}
        <div className="sticky top-0 flex items-start gap-3 rounded-tl-xl bg-blue-firstRate px-6 py-5 text-white">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            <TbDatabaseHeart />
          </div>

          <div className="flex-1">
            <h2
              id="system-info-title"
              className="text-xl font-bold tracking-wider"
            >
              Zeta Tax
            </h2>
            <p className="text-xs text-indigo-100">System information</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="space-y-5 px-6 py-5 text-sm text-slate-600">
          {/* About */}
          <p className="leading-6">
            <span className="font-semibold text-slate-800">Zeta Tax</span> is
            for calculation office work — employee salary management and
            calculation of the tax on salary, office income and office rent. It
            also manages and shows the income we received and the remainder.
          </p>

          {/* Quick facts */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <FaRegCalendarAlt className="text-blue-firstRate" />
              <span>
                Started working:{" "}
                <strong className="text-slate-800">Sep 2026</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <FaUsers className="text-blue-firstRate" />
              <span>
                Team: <strong className="text-slate-800">4 people</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2">
              <FaDesktop className="text-blue-firstRate" />
              <span>
                Web-based <strong className="text-slate-800">and</strong>{" "}
                desktop application
              </span>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <FaCode /> Technology used
            </div>

            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-blue-firstRate/20 bg-blue-firstRate/10 px-3 py-1 text-xs font-medium text-blue-firstRate"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <FaLaptopCode className="text-blue-firstRate" />
                React + Tailwind CSS — Frontend
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <FaServer className="text-blue-firstRate" />
                NestJS + PostgreSQL — Backend
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Swagger is used for API calling and testing.
            </p>
          </div>

          {/* Team */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <FaUsers /> Participations
            </div>

            <ul className="space-y-2">
              {team.map((member) => (
                <li
                  key={member.phone}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-blue-firstRate/30 hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-firstRate/10 text-sm font-bold text-blue-firstRate">
                    {member.name.charAt(0)}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">
                      {member.name}
                    </p>
                    <p className="text-xs leading-5 text-slate-500">
                      {member.role}
                    </p>
                    <a
                      href={`tel:${member.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-firstRate hover:underline"
                    >
                      <FaPhoneAlt className="text-[10px]" />
                      {member.phone}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-blue-firstRate py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Info;

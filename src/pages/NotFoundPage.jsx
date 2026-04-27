import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

const REDIRECT_SECONDS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * 18;

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, idx) => ({
        id: idx,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.round(Math.random() * 4),
        delay: `${(Math.random() * 3).toFixed(2)}s`,
        duration: `${(4 + Math.random() * 5).toFixed(2)}s`,
      })),
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const strokeOffset = (countdown / REDIRECT_SECONDS) * RING_CIRCUMFERENCE;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="notfound-particle absolute rounded-full bg-indigo-200/60"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <header className="relative z-10 border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center">
          <BrandLogo className="h-9 w-9" />
          <span className="ml-2 text-sm font-semibold tracking-wide text-slate-200">
            Serverless
          </span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl text-center">
          <h1 className="notfound-glitch mx-auto bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-[150px] font-extrabold leading-none text-transparent md:text-[180px]">
            404
          </h1>

          <div className="notfound-astronaut-wrapper mx-auto mt-2 w-fit">
            <svg
              viewBox="0 0 220 160"
              className="h-44 w-56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="110" cy="140" rx="60" ry="12" fill="#1E293B" />
              <rect x="78" y="52" width="64" height="72" rx="22" fill="#334155" />
              <circle cx="110" cy="48" r="24" fill="#64748B" />
              <circle cx="110" cy="48" r="16" fill="#0F172A" stroke="#A5B4FC" />
              <rect x="92" y="80" width="36" height="22" rx="8" fill="#1E293B" />
              <circle cx="100" cy="90" r="3" fill="#22C55E" />
              <circle cx="110" cy="90" r="3" fill="#38BDF8" />
              <circle cx="120" cy="90" r="3" fill="#F59E0B" />
              <rect x="60" y="80" width="18" height="10" rx="5" fill="#64748B" />
              <rect x="142" y="80" width="18" height="10" rx="5" fill="#64748B" />
              <circle cx="42" cy="42" r="8" fill="#818CF8" opacity="0.8" />
              <circle cx="176" cy="26" r="6" fill="#C4B5FD" opacity="0.8" />
              <circle cx="170" cy="118" r="7" fill="#A5B4FC" opacity="0.8" />
            </svg>
          </div>

          <h2 className="mt-5 text-3xl font-bold">Oops! Page Not Found</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="notfound-btn-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold transition hover:scale-105 hover:shadow-[0_0_30px_-10px_rgba(129,140,248,0.9)]"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="notfound-btn-2 rounded-xl border border-indigo-300/40 px-5 py-2.5 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/20"
            >
              Go Back
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-300">
            <div className="relative h-11 w-11">
              <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="rgba(148, 163, 184, 0.35)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#818CF8"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {countdown}
              </span>
            </div>
            <p>Redirecting to Dashboard in {countdown}s...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

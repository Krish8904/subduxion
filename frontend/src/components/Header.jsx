import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const controlHeader = () => {
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
    setScrolled(window.scrollY > 20);
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  const navLinks = [
    { path: "services", label: "Services" },
    { path: "company", label: "Company" },
    { path: "career", label: "Career" },
    { path: "usecases", label: "Use Cases" },
    { path: "adminlogin", label: "Admin Login" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hdr-logo-text {
          font-family: 'Fraunces', serif;
          font-size: 2.75rem;
          font-weight: 400;
          letter-spacing: -0.03em;
          color: #1a1a1a;
          line-height: 1;
        }
        .hdr-logo-text em { font-style: italic; color: #4a7c59; }

        .hdr-nav-link.active {
          color: #f5f3ef !important;
          background: #4a7c59 !important;
          font-weight: 500;
        }

        @keyframes hdr-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,124,89,0.2); }
          50%       { box-shadow: 0 0 0 5px rgba(74,124,89,0.1); }
        }
        .hdr-location-dot { animation: hdr-pulse 2.5s infinite; }
      `}</style>

      <header
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={[
          "fixed top-0 left-0 w-full z-50 transition-transform duration-400 ease-in-out",
          !showHeader ? "-translate-y-[110%]" : "translate-y-0",
        ].join(" ")}
      >

        {/* ── Announcement bar ── */}
        <div
          className={[
            "bg-[#1a1a1a] text-[rgba(245,243,239,0.7)] text-center flex items-center justify-center gap-4",
            "text-[0.75rem] font-normal tracking-[0.06em]",
            "transition-all duration-300 ease-in-out overflow-hidden",
            scrolled ? "max-h-0 opacity-0 py-0 px-12" : "max-h-20 opacity-100 py-2 px-12",
          ].join(" ")}
        >
          <span className="w-1.25 h-1.25 rounded-full bg-[#4a7c59] shrink-0" />
          <span>Applied AI solutions for modern businesses —</span>
          <a
            href="/services"
            className="text-[#f5f3ef] font-medium no-underline border-b border-[rgba(245,243,239,0.3)] hover:border-[#f5f3ef] transition-colors duration-200"
          >
            Explore our services →
          </a>
        </div>

        {/* ── Main nav ── */}
        <div
          className={[
            "bg-[#f5f3ef] border-b border-[#d4d0c8] transition-all duration-300",
            scrolled
              ? "bg-[rgba(245,243,239,0.95)] backdrop-blur-lg shadow-[0_2px_24px_rgba(26,26,26,0.08)]"
              : "",
          ].join(" ")}
        >
          <div
            className="max-w-7xl mx-auto px-12 h-20 grid items-center gap-6"
            style={{ gridTemplateColumns: "1fr auto 1fr" }}
          >

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-11 h-11 rounded-[10px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="8" height="8" rx="2" fill="#4a7c59" />
                  <rect x="10" y="1" width="8" height="8" rx="2" fill="rgba(245,243,239,0.4)" />
                  <rect x="1" y="10" width="8" height="8" rx="2" fill="rgba(245,243,239,0.4)" />
                  <rect x="10" y="10" width="8" height="8" rx="2" fill="rgba(245,243,239,0.15)" />
                </svg>
              </div>
              <span className="hdr-logo-text">Sub<em>Duxion</em></span>
            </Link>

            {/* Center nav pill */}
            <nav>
              <ul className="flex items-center list-none m-0 bg-white border border-[#d4d0c8] rounded-full px-1.5 py-1.25 gap-0.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <NavLink
                      to={`/${link.path}`}
                      className={({ isActive }) =>
                        [
                          "hdr-nav-link",
                          "inline-block px-4 py-1.75 rounded-full text-[0.85rem] font-normal no-underline whitespace-nowrap transition-all duration-200",
                          isActive
                            ? "active text-[#f5f3ef] bg-[#4a7c59] font-medium"
                            : "text-[#777] hover:text-[#1a1a1a] hover:bg-[#f5f3ef]",
                        ].join(" ")
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-3">
              <span className="flex items-center gap-1.5 text-[0.78rem] text-[#aaa] font-normal tracking-[0.02em]">
                <span
                  className="hdr-location-dot w-1.5 h-1.5 rounded-full bg-[#4a7c59] shrink-0"
                  style={{ boxShadow: "0 0 0 3px rgba(74,124,89,0.2)" }}
                />
                Available now   
              </span>
              <span className="w-px h-5 bg-[#d4d0c8]" />
              <NavLink
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-[#f5f3ef] px-5.5 py-2.5 rounded-full text-[0.85rem] font-medium no-underline border-none cursor-pointer tracking-[0.01em] shrink-0 transition-all duration-250 ease-in-out shadow-[0_2px_8px_rgba(26,26,26,0.15)] hover:bg-[#4a7c59] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(74,124,89,0.35)]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Get in Touch
                <span className="w-4.5 h-4.5 rounded-full bg-[rgba(245,243,239,0.15)] flex items-center justify-center text-[0.7rem] shrink-0">
                  ↗
                </span>
              </NavLink>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
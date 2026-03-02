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

        .hdr-root {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 50;
          font-family: 'DM Sans', sans-serif;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .hdr-root.hdr-hidden { transform: translateY(-110%); }

        /* top announcement bar */
        .hdr-bar {
          background: #1a1a1a; color: rgba(245,243,239,0.7);
          text-align: center; padding: 8px 48px;
          font-size: 0.75rem; font-weight: 400; letter-spacing: 0.06em;
          display: flex; align-items: center; justify-content: center; gap: 16px;
          transition: opacity 0.3s ease, max-height 0.3s ease;
        }
        .hdr-bar.hidden-bar { max-height: 0; opacity: 0; overflow: hidden; padding: 0; }
        .hdr-bar-dot { width: 5px; height: 5px; border-radius: 50%; background: #4a7c59; flex-shrink: 0; }
        .hdr-bar-link {
          color: #f5f3ef; font-weight: 500; text-decoration: none;
          border-bottom: 1px solid rgba(245,243,239,0.3);
          transition: border-color 0.2s;
        }
        .hdr-bar-link:hover { border-color: #f5f3ef; }

        /* main nav strip */
        .hdr-main {
          background: #f5f3ef;
          border-bottom: 1px solid #d4d0c8;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .hdr-root.hdr-scrolled .hdr-main {
          background: rgba(245,243,239,0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 2px 24px rgba(26,26,26,0.08);
        }

        .hdr-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 48px; height: 80px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 24px;
        }

        /* logo */
        .hdr-logo-wrap { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .hdr-logo-mark {
          width: 38px; height: 38px; border-radius: 10px;
          background: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hdr-logo-mark svg { display: block; }
        .hdr-logo-text {
          font-family: 'Fraunces', serif;
          font-size: 1.95rem; font-weight: 400;
          letter-spacing: -0.03em; color: #1a1a1a; line-height: 1;
        }
        .hdr-logo-text em { font-style: italic; color: #4a7c59; }

        /* center nav */
        .hdr-nav {
          display: flex; align-items: center;
          list-style: none; margin: 0; padding: 0;
          background: white;
          border: 1px solid #d4d0c8;
          border-radius: 100px;
          padding: 5px 6px;
          gap: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .hdr-nav-link {
          display: inline-block;
          padding: 7px 16px; border-radius: 100px;
          font-size: 0.85rem; font-weight: 400;
          color: #777; text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
        }
        .hdr-nav-link:hover { color: #1a1a1a; background: #f5f3ef; }
        .hdr-nav-link.active {
          color: #1a1a1a; background: #4a7c59; color: #f5f3ef;
          font-weight: 500;
        }

        /* right side actions */
        .hdr-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }

        .hdr-location {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; color: #aaa; font-weight: 400; letter-spacing: 0.02em;
        }
        .hdr-location-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4a7c59;
          box-shadow: 0 0 0 3px rgba(74,124,89,0.2);
          flex-shrink: 0;
          animation: hdr-pulse 2.5s infinite;
        }
        @keyframes hdr-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,124,89,0.2); }
          50% { box-shadow: 0 0 0 5px rgba(74,124,89,0.1); }
        }

        .hdr-divider { width: 1px; height: 20px; background: #d4d0c8; }

        .hdr-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1a1a1a; color: #f5f3ef;
          padding: 10px 22px; border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500;
          text-decoration: none; border: none; cursor: pointer;
          letter-spacing: 0.01em; flex-shrink: 0;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(26,26,26,0.15);
        }
        .hdr-cta:hover { background: #4a7c59; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74,124,89,0.35); }
        .hdr-cta-arrow {
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(245,243,239,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .hdr-inner { padding: 0 24px; grid-template-columns: auto 1fr auto; }
          .hdr-nav { display: none; }
        }
        @media (max-width: 640px) {
          .hdr-bar { display: none; }
          .hdr-location { display: none; }
          .hdr-divider { display: none; }
        }
      `}</style>

      <header className={`hdr-root ${!showHeader ? "hdr-hidden" : ""} ${scrolled ? "hdr-scrolled" : ""}`}>

        {/* Announcement bar */}
        <div className={`hdr-bar ${scrolled ? "hidden-bar" : ""}`}>
          <span className="hdr-bar-dot" />
          <span>Applied AI solutions for modern businesses —</span>
          <a href="/services" className="hdr-bar-link">Explore our services →</a>
        </div>

        {/* Main nav */}
        <div className="hdr-main">
          <div className="hdr-inner">

            {/* Logo */}
            <Link to="/" className="hdr-logo-wrap">
              <div className="hdr-logo-mark">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="7" height="7" rx="2" fill="#4a7c59"/>
                  <rect x="10" y="1" width="7" height="7" rx="2" fill="rgba(245,243,239,0.4)"/>
                  <rect x="1" y="10" width="7" height="7" rx="2" fill="rgba(245,243,239,0.4)"/>
                  <rect x="10" y="10" width="7" height="7" rx="2" fill="rgba(245,243,239,0.15)"/>
                </svg>
              </div>
              <span className="hdr-logo-text">Sub<em>Duxion</em></span>
            </Link>

            {/* Center nav pill */}
            <nav>
              <ul className="hdr-nav">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <NavLink
                      to={`/${link.path}`}
                      className={({ isActive }) => `hdr-nav-link${isActive ? " active" : ""}`}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right actions */}
            <div className="hdr-actions">
              <span className="hdr-location">
                <span className="hdr-location-dot" />
                Available now
              </span>
              <span className="hdr-divider" />
              <NavLink to="/contact" className="hdr-cta">
                Get in Touch
                <span className="hdr-cta-arrow">↗</span>
              </NavLink>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
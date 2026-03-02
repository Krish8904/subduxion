import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load services page:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-20 text-center text-[#888]">Loading services...</div>;
  if (!page?.sections) return <div className="mt-20 text-center">No content found.</div>;

  const getPos = (key, s) => {
    if (s.position !== undefined && s.position !== null && s.position !== "") return Number(s.position);
    if (key === "hero") return 1;
    if (key === "services") return 2;
    if (key === "cta") return 99;
    return 10;
  };

  return (
    <div className="w-full mt-20 bg-[#f5f3ef] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {Object.keys(page.sections)
        .sort((a, b) => getPos(a, page.sections[a]) - getPos(b, page.sections[b]))
        .map((key) => {
          const section = page.sections[key];

          // ── HERO ──
          if (key === "hero") {
            return (
              <section key={key} className="max-w-[1280px] mx-auto px-12 pt-20 pb-0">
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-12">
                  <h1
                    className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    {section.mainText}
                  </h1>
                  <div className="flex flex-col items-end gap-6 pb-1.5">
                    <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-[280px] m-0">
                      {section.secondaryText}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#aaa] tracking-[0.1em] uppercase font-medium">Since 2015</span>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] px-6 py-3.5 rounded-full text-sm font-medium no-underline transition-all duration-200 tracking-[0.02em]"
                      >
                        {section.buttonText}
                        <span className="w-5 h-5 rounded-full bg-[#f5f3ef] text-[#1a1a1a] flex items-center justify-center text-[0.7rem]">↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // ── SERVICES LIST ──
          if (key === "services") {
            const services = section.items || [];
            return (
              <section key={key} className="max-w-[1280px] mx-auto px-12 pt-4 pb-10">
                <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                  <h2
                    className="text-[clamp(1.8rem,3vw,2.8rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    Our Services <em className="not-italic italic text-[#4a7c59]">&amp;</em> Works
                  </h2>
                  <span className="text-[0.8rem] text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                    {String(services.length).padStart(2, "0")} Services
                  </span>
                </div>
                <ul className="list-none m-0 p-0">
                  {services.map((item, i) => (
                    <li
                      key={i}
                      className="grid items-center gap-7 px-4 py-5 border-b border-[#d4d0c8] rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#eceae4] hover:pl-6 first:border-t first:border-[#d4d0c8] group"
                      style={{ gridTemplateColumns: "60px 1fr 1fr auto auto" }}
                      onMouseEnter={() => setHoveredService(i)}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span
                        className="text-[0.8rem] text-[#c0bbb0] font-light text-right transition-colors duration-200 group-hover:text-[#4a7c59]"
                        style={{ fontFamily: "'poppins', serif" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="text-[clamp(1.1rem,2vw,1.5rem)] font-normal text-[#1a1a1a] tracking-[-0.015em] transition-colors duration-200 group-hover:text-[#4a7c59] whitespace-nowrap"
                        style={{ fontFamily: "'poppins', serif" }}
                      >
                        {item.title}
                      </span>
                      <span className="text-[0.875rem] text-[#999] leading-[1.65] font-light max-w-[340px]">
                        {item.desc}
                      </span>
                      <img
                        src={
                          item.image
                            ? `${import.meta.env.VITE_API_URL}${item.image.startsWith("/") ? "" : "/uploads/"}${item.image}`
                            : "/placeholder.png"
                        }
                        alt={item.title}
                        className="w-[100px] h-[68px] rounded-lg object-cover bg-[#ddd] shrink-0 opacity-0 scale-95 translate-y-1 transition-all duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                      />
                      <Link
                        to="/contact"
                        aria-label={`Go to ${item.title}`}
                        className="w-11 h-11 rounded-full border border-[#c8c4bc] bg-transparent text-[#999] flex items-center justify-center text-base shrink-0 no-underline transition-all duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] -rotate-45 scale-90 group-hover:bg-[#4a7c59] group-hover:text-[#f5f3ef] group-hover:border-[#4a7c59] group-hover:rotate-0 group-hover:scale-100"
                      >
                        →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          // ── CTA ──
          if (key === "cta") {
            return (
              <div
                key={key}
                className="max-w-[1280px] mx-auto px-12 pt-6 pb-20 grid gap-6 items-stretch"
                style={{ gridTemplateColumns: "auto 1fr" }}
              >
                <button
                  onClick={() => navigate("/services/servicesform")}
                  className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200"
                >
                  Book a Service ↗
                </button>
                <div className="bg-[#1a1a1a] rounded-2xl px-12 py-10 flex items-center justify-between gap-8 relative overflow-hidden">
                  <div
                    className="absolute top-[-40px] right-[-40px] w-44 h-44 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(74,124,89,0.35) 0%, transparent 70%)" }}
                  />
                  <div className="relative z-10">
                    <h2
                      className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[#f5f3ef] tracking-[-0.02em] leading-[1.2] m-0 mb-2"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {section.title}
                    </h2>
                    <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                      {section.text}
                    </p>
                  </div>
                  <Link
                    to={section.link || "/contact"}
                    className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                    {section.buttonText}
                  </Link>
                </div>
              </div>
            );
          }

          // ── CUSTOM ──
          return (
            <section
              key={key}
              className="max-w-[1280px] mx-auto px-12 py-16"
              style={{ textAlign: section.alignment || "left" }}
            >
              <h2
                className="text-[2.5rem] font-light text-[#1a1a1a] m-0 mb-5 tracking-[-0.02em]"
                style={{ fontFamily: "'poppins', serif" }}
              >
                {section.mainText}
              </h2>
              <p className="text-base text-[#888] leading-[1.75] font-light whitespace-pre-wrap">
                {section.secondaryText}
              </p>
            </section>
          );
        })}
    </div>
  );
};

export default Services;
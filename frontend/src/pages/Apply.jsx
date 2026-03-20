import React, { useState, useRef } from "react";

const Apply = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setResume(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) setResume(e.target.files[0]);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("middleName", middleName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("coverLetter", coverLetter);
    if (resume) formData.append("resume", resume);
    try {
      const res = await fetch("https://subduxion.onrender.com/api/career/apply", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", data.message || "Application submitted successfully!");
        setFirstName(""); setMiddleName(""); setLastName("");
        setEmail(""); setPhone(""); setCoverLetter(""); setResume(null);
      } else {
        showNotification("error", data.error || "Failed to submit application");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white disabled:opacity-50";

  return (
    <>
      {/* Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 max-w-md flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl animate-[slideIn_0.3s_ease-out] ${notification.type === "success" ? "bg-[#4a7c59] text-white" : "bg-red-500 text-white"}`}>
          <div className="shrink-0">
            {notification.type === "success"
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{notification.type === "success" ? "Success!" : "Error"}</p>
            <p className="text-sm mt-0.5 opacity-70">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="shrink-0 opacity-60 hover:opacity-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="w-full mt-20 bg-[#f5f3ef]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-12 pt-20 pb-0">
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-12">
            <h1
              className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
              style={{ fontFamily: "'poppins', serif" }}
            >
              Join Our <em className="not-italic  text-[#4a7c59]">Team</em>
            </h1>
            <div className="flex flex-col items-end gap-4 pb-1.5">
              <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-70 m-0">
                We're excited to learn more about you. Fill out the form and submit your resume to apply for a role at SubDuxion.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
                <span className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase">Now Hiring</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="max-w-7xl mx-auto px-12 pb-0">
          <div className="grid grid-cols-[1fr_1fr] gap-16 items-start">

            {/* LEFT — form */}
            <form onSubmit={handleSubmit} className="bg-white border border-[#d4d0c8] rounded-2xl p-10 space-y-6">
              <div>
                <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-2">Application Form</p>
                <h2
                  className="text-2xl font-light tracking-[-0.02em] text-[#1a1a1a] m-0"
                  style={{ fontFamily: "'poppins', serif" }}
                >
                  Tell us about <em className="not-italic  text-[#4a7c59]">yourself</em>
                </h2>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} required disabled={isSubmitting} placeholder="First" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Middle Name</label>
                  <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={inputCls} disabled={isSubmitting} placeholder="Middle" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Last Name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} required disabled={isSubmitting} placeholder="Last" />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Email *</label>
                  <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Phone Number *</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} required disabled={isSubmitting} />
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Cover Letter</label>
                <textarea
                  value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5}
                  placeholder="Write your cover letter here..."
                  disabled={isSubmitting}
                  className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white resize-none disabled:opacity-50"
                />
              </div>

              {/* Resume drop zone */}
              <div>
                <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Resume / CV</label>
                <div
                  onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  onClick={() => !isSubmitting && inputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? "border-[#4a7c59] bg-[#dceede]/30" : "border-[#d4d0c8] bg-[#f5f3ef] hover:border-[#4a7c59]/50 hover:bg-[#eceae4]"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {resume ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#dceede] flex items-center justify-center text-[#4a7c59] text-sm">📜</div>
                      <span className="text-sm font-medium text-[#1a1a1a]">{resume.name}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#eceae4] border border-[#d4d0c8] flex items-center justify-center mx-auto mb-3 text-[#aaa]">↑</div>
                      <p className="text-sm text-[#aaa] font-light">Drag & drop your resume here<br />or <span className="text-[#4a7c59] font-medium">click to upload</span></p>
                      <p className="text-xs text-[#ccc] mt-1">PDF, DOC, DOCX accepted</p>
                    </div>
                  )}
                  <input type="file" ref={inputRef} className="hidden" onChange={handleChange} accept=".pdf,.doc,.docx" disabled={isSubmitting} />
                </div>
              </div>
              {/* Submit */}
              <button
                type="submit" disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-3 text-[#f5f3ef] text-sm font-medium py-4 rounded-full transition-all duration-200 ${isSubmitting ? "bg-[#ccc] cursor-not-allowed" : "bg-[#1a1a1a] hover:bg-[#4a7c59] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>Submit Application <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">↗</span></>
                )}
              </button>
            </form>

            {/* RIGHT — info */}
            <div className="pt-2">
              <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-4">Why SubDuxion?</p>
              <p
                className="text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-[1.45] tracking-[-0.02em] text-[#1a1a1a] mb-10"
                style={{ fontFamily: "'poppins', serif" }}
              >
                Build things that <em className="not-italic  text-[#4a7c59]">matter.</em>
              </p>

              {/* Steps */}
              <ul className="list-none m-0 p-0 mb-10">
                {[
                  { n: "01", label: "Fill in your details", desc: "Basic info to help us understand who you are and what you bring." },
                  { n: "02", label: "Upload your resume", desc: "Attach your CV or resume in PDF, DOC, or DOCX format." },
                  { n: "03", label: "Write a cover letter", desc: "Tell us why you want to join and what excites you about the role." },
                  { n: "04", label: "We'll be in touch", desc: "Our team reviews every application and responds promptly." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4 py-4 border-b border-[#d4d0c8] first:border-t first:border-[#d4d0c8]">
                    <span className="text-xs text-[#bbb] font-light pt-0.5 shrink-0" style={{ fontFamily: "'poppins', serif" }}>{step.n}</span>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a] mb-1">{step.label}</p>
                      <p className="text-xs text-[#999] font-light leading-[1.6]">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* note card */}
              <div className="flex items-center gap-3 bg-white border border-[#d4d0c8] rounded-2xl px-5 py-4">
                <div className="w-8 h-8 rounded-xl bg-[#dceede] flex items-center justify-center text-[#4a7c59] shrink-0 text-sm">✦</div>
                <p className="text-sm text-[#555] font-light leading-relaxed">
                  All applications are reviewed by a real person — no automated filtering.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── CTA STRIP ── */}
        <div className="max-w-7xl mx-auto px-12 pt-16 pb-20 grid gap-6 items-stretch" style={{ gridTemplateColumns: "auto 1fr" }}>
          <a
            href="/career"
            className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 no-underline"
          >
            ← View Open Roles
          </a>
          <div className="bg-[#1a1a1a] rounded-2xl px-12 py-10 flex items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,124,89,0.35) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[#f5f3ef] tracking-[-0.02em] leading-[1.2] m-0 mb-2" style={{ fontFamily: "'poppins', serif" }}>
                Questions before <em className="not-italic  text-[#7ab98a]">applying?</em>
              </h2>
              <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                Reach out to our team and we'll be happy to answer anything about the role or culture.
              </p>
            </div>
            <a href="/contact" className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
              Contact Us
            </a>
          </div>
        </div>

      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
};

export default Apply;

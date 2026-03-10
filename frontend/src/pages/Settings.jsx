import React, { useState } from "react";
import {
  User, Lock, Bell, Clock, Briefcase, Download, Trash2,
  Save, Eye, EyeOff, Check, AlertTriangle, ChevronRight,
} from "lucide-react";

export default function Settings() {

  // ── Account ─────────────────────────────────────────────
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@subduxion.com" });
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaved, setPwSaved] = useState(false);

  // ── Notifications ────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    newBooking: true,
    newApplication: true,
    newContact: false,
    newCompany: true,
  });

  // ── Booking ──────────────────────────────────────────────
  const [booking, setBooking] = useState({
    workStart: "09:00",
    workEnd: "18:00",
    buffer: "15",
    confirmMsg: "Thanks for booking! We'll see you at the scheduled time.",
  });
  const [bookingSaved, setBookingSaved] = useState(false);

  // ── Careers ──────────────────────────────────────────────
  const [defaultStatus, setDefaultStatus] = useState("Screening");
  const statusOptions = ["Screening", "1st Round", "2nd Round", "Final Round"];

  // ── Helpers ──────────────────────────────────────────────
  const flash = (setter) => { setter(true); setTimeout(() => setter(false), 2000); };

  // ── Sub-components ───────────────────────────────────────

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${on ? "bg-blue-500" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  const SectionCard = ({ icon: Icon, title, description, gradient, children }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up hover:shadow-xl transition-all duration-300">
      {/* header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      {/* body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const Input = ({ value, onChange, type = "text", placeholder, right }) => (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );

  const SaveBtn = ({ onClick, saved, label = "Save Changes", gradient = "from-blue-500 to-blue-600" }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
        saved
          ? "bg-green-50 text-green-600 border border-green-200 shadow-none"
          : `bg-linear-to-br ${gradient} text-white hover:shadow-md hover:-translate-y-0.5`
      }`}
    >
      {saved ? <Check size={14} /> : <Save size={14} />}
      {saved ? "Saved!" : label}
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page Header ──────────────────────────────────── */}
      <div>
        <h2 className="text-4xl font-bold  mb-2 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-slate-500 text-sm">
          Manage your account, notifications, and platform preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Profile ──────────────────────────────────────── */}
        <SectionCard icon={User} title="Profile" description="Your admin display name and login email" gradient="from-blue-500 to-blue-600">
          <div className="space-y-4">
            <Field label="Display Name">
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Admin"
              />
            </Field>
            <Field label="Email Address">
              <Input
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </Field>
            <div className="pt-1">
              <SaveBtn onClick={() => flash(setProfileSaved)} saved={profileSaved} gradient="from-blue-500 to-blue-600" />
            </div>
          </div>
        </SectionCard>

        {/* ── Change Password ──────────────────────────────── */}
        <SectionCard icon={Lock} title="Change Password" description="Update your admin login credentials" gradient="from-purple-500 to-purple-600">
          <div className="space-y-4">
            {[
              { key: "current", label: "Current Password" },
              { key: "next",    label: "New Password" },
              { key: "confirm", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <Input
                  type={showPw[key] ? "text" : "password"}
                  value={passwords[key]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  right={
                    <button
                      onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </Field>
            ))}
            <div className="pt-1">
              <SaveBtn onClick={() => flash(setPwSaved)} saved={pwSaved} label="Update Password" gradient="from-purple-500 to-purple-600" />
            </div>
          </div>
        </SectionCard>

        {/* ── Notifications ────────────────────────────────── */}
        <SectionCard icon={Bell} title="Notifications" description="Email alerts for platform activity" gradient="from-orange-500 to-orange-600">
          <div className="divide-y divide-slate-100">
            {[
              { key: "newBooking",     label: "New Call Booking",         sub: "Someone books a call via the website" },
              { key: "newApplication", label: "New Job Application",      sub: "A candidate applies for an open role" },
              { key: "newContact",     label: "New Contact Inquiry",      sub: "Someone submits the contact form" },
              { key: "newCompany",     label: "New Company Registration", sub: "A company completes registration" },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
                <Toggle on={notifs[key]} onToggle={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Booking Settings ─────────────────────────────── */}
        <SectionCard icon={Clock} title="Booking Settings" description="Call availability and confirmation messaging" gradient="from-green-500 to-green-600">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Available From">
                <Input
                  type="time"
                  value={booking.workStart}
                  onChange={(e) => setBooking((p) => ({ ...p, workStart: e.target.value }))}
                />
              </Field>
              <Field label="Available Until">
                <Input
                  type="time"
                  value={booking.workEnd}
                  onChange={(e) => setBooking((p) => ({ ...p, workEnd: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Buffer Between Calls">
              <select
                value={booking.buffer}
                onChange={(e) => setBooking((p) => ({ ...p, buffer: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {["0","5","10","15","20","30"].map((v) => (
                  <option key={v} value={v}>{v === "0" ? "No buffer" : `${v} minutes`}</option>
                ))}
              </select>
            </Field>
            <Field label="Confirmation Message">
              <textarea
                value={booking.confirmMsg}
                onChange={(e) => setBooking((p) => ({ ...p, confirmMsg: e.target.value }))}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </Field>
            <div className="pt-1">
              <SaveBtn onClick={() => flash(setBookingSaved)} saved={bookingSaved} gradient="from-green-500 to-green-600" />
            </div>
          </div>
        </SectionCard>

        {/* ── Career Defaults ───────────────────────────────── */}
        <SectionCard icon={Briefcase} title="Careers" description="Default status when a new application is received" gradient="from-pink-500 to-pink-600">
          <Field label="Default Application Status">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setDefaultStatus(s)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    defaultStatus === s
                      ? "bg-pink-50 border-pink-200 text-pink-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {s}
                  {defaultStatus === s && <Check size={13} className="text-pink-500" />}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* ── Danger Zone ───────────────────────────────────── */}
        <SectionCard icon={AlertTriangle} title="Danger Zone" description="Irreversible actions — proceed with care" gradient="from-red-500 to-red-600">
          <div className="space-y-2">
            {[
              {
                icon: Download,
                label: "Export All Data",
                sub: "Download all records as CSV",
                style: "hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-700",
              },
              {
                icon: Trash2,
                label: "Clear Bookings",
                sub: "Remove all call booking records",
                style: "hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600",
              },
              {
                icon: Trash2,
                label: "Clear Applications",
                sub: "Remove all job application records",
                style: "hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600",
              },
              {
                icon: Trash2,
                label: "Clear Contact Inquiries",
                sub: "Remove all contact form submissions",
                style: "hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600",
              },
            ].map(({ icon: Icon, label, sub, style }) => (
              <button
                key={label}
                className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200 group ${style}`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Icon size={15} className="shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-current transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
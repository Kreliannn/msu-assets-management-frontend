"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Shield,
  Boxes,
  Building2,
  QrCode,
  ArrowRight,
  Layers,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Lock,
  Server,
  FileCheck,
  ClipboardList,
  HardDrive,
  Activity,
} from "lucide-react";
import Link from "next/link";

// ─── Color Constants ─────────────────────────────────────────────────────────
const COLORS = {
  bg: "#FDFBF7",
  primary: "#642209",
  primaryHover: "#4A1806",
  secondary: "#DAB368",
  text: "#1A1A1A",
  muted: "#595959",
  card: "#FFFFFF",
  footer: "#121212",
  border: "#e2dccf",
};

// ─── Reusable Components ─────────────────────────────────────────────────────

function PrimaryButton({
  children,
  className = "",
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`group inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97] ${className}`}
      style={{ backgroundColor: COLORS.primary }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </button>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { label: "System Overview", href: "#overview" },
    { label: "Office Workflow", href: "#workflow" },
    { label: "Security Compliance", href: "#compliance" },
  ];

  return (
    <nav
      className="fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: "rgba(253, 251, 247, 0.9)",
        borderColor: COLORS.border,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/assets/office_logo.png"
              alt="MSU Main Property Office Logo"
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold" style={{ color: COLORS.text }}>
              MSU Main
            </span>
            <span
              className="text-[11px] font-medium tracking-wide"
              style={{ color: COLORS.muted }}
            >
              Property Office
            </span>
          </div>
        </div>

        {/* Center Links - Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-black/5"
              style={{ color: COLORS.text }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href={"/guest/loginPage"}>
              <PrimaryButton icon={<Lock className="h-4 w-4" />}>
                Staff Portal Login
              </PrimaryButton>
          </Link>
         
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          className="flex items-center justify-center rounded-lg p-2 md:hidden"
          style={{ color: COLORS.text }}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="border-t px-4 pb-4 pt-2 md:hidden"
          style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: COLORS.text }}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3">
             <Link href={"/guest/loginPage"}>
                <PrimaryButton icon={<Lock className="h-4 w-4" />}>
                  Staff Portal Login
                </PrimaryButton>
             </Link>
          
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="relative flex min-h-[85vh] items-center overflow-hidden pt-24"
      style={{ backgroundColor: COLORS.primary }}
    >
      {/* Background Image with Overlay */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/hero_sec_bg.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Multi-layer gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, rgba(18,18,18,0.85) 0%, rgba(100,34,9,0.75) 40%, rgba(100,34,9,0.6) 70%, rgba(18,18,18,0.8) 100%)
            `,
          }}
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative gold accent lines */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-64 w-1 opacity-30"
        style={{ backgroundColor: COLORS.secondary }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-1 w-32 opacity-40"
        style={{ backgroundColor: COLORS.secondary }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-sm"
            style={{
              borderColor: "rgba(218, 179, 104, 0.4)",
              color: COLORS.secondary,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <Shield className="h-3.5 w-3.5" />
            Authorized Personnel Only — Internal System Gateway
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Central Asset &{" "}
            <span style={{ color: COLORS.secondary }}>Property Control</span>{" "}
            System
          </h1>

          {/* Subheading */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Authorized administrative access for tracking, distributing, and
            auditing Mindanao State University campus property and departmental
            allocations.
          </p>

          {/* Single CTA */}
          <div className="mt-10">
            <Link href={"/guest/loginPage"}>
            
              
              <button
                className="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97]"
                style={{
                  backgroundColor: COLORS.primary,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.primary)
                }
              >
                <Lock className="h-5 w-5" />
                Secure Login
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* System Status Indicator */}
          <div className="mt-10 flex items-center gap-3 text-xs text-white/50">
            <span className="flex h-2 w-2 rounded-full bg-green-400" />
            <span>System Status: All Services Operational</span>
            <span className="mx-2">|</span>
            <span>v3.2.1</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── System Utility Showcase ─────────────────────────────────────────────────

function SystemShowcase() {
  const cards = [
    {
      icon: <HardDrive className="h-6 w-6" />,
      title: "Asset Accountability Core",
      description:
        "Centralized registry tracking every physical asset under MSU stewardship — from laptop clusters and desktop workstations to laboratory instruments, industrial tools, and campus furnishings across the entire main campus footprint.",
      highlights: [
        "Real-time asset status monitoring (In Service, Under Repair, Decommissioned)",
        "Automated depreciation schedules and maintenance lifecycle alerts",
        "Categorized inventory with bulk import/export capabilities",
        "Role-based access tiers for data security and audit compliance",
      ],
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "College & Department Distribution Network",
      description:
        "Precise logistics engine that governs how the Main Property Office routes equipment, approves inventory requisitions, and maintains chain-of-custody records for every asset transferred to individual colleges and administrative units.",
      highlights: [
        "Multi-tier approval workflows for inter-departmental transfers",
        "Per-college and per-department inventory snapshots",
        "Full transfer history with custodial audit trails",
        "Requisition management and allocation forecasting tools",
      ],
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "QR Code Auditing Mechanics",
      description:
        "Enterprise-grade QR tagging infrastructure enabling property officers to conduct rapid physical inventory audits using handheld scanners, verify asset custody on-site, and reconcile digital records against physical stock in real time.",
      highlights: [
        "Scan-to-verify asset identity and current custodian",
        "Batch audit sweeps with automatic exception reporting",
        "Offline-capable scanning with sync-on-reconnect",
        "Tamper-evident QR labels for high-value equipment",
      ],
    },
  ];

  return (
    <section id="workflow" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
            style={{ borderColor: COLORS.border, color: COLORS.secondary }}
          >
            <Layers className="h-3.5 w-3.5" />
            System Infrastructure
          </div>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: COLORS.text }}
          >
            Enterprise property management for the modern campus
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            The Main Property Office is equipped with a comprehensive digital
            infrastructure to ensure every university asset is tracked,
            accounted for, and properly stewarded.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
              }}
            >
              {/* Gold top accent */}
              <div
                className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
                style={{ backgroundColor: COLORS.secondary }}
              />
              <div className="flex flex-col p-6">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: COLORS.primary, color: "white" }}
                >
                  {card.icon}
                </div>
                <h3
                  className="mb-3 text-lg font-bold"
                  style={{ color: COLORS.text }}
                >
                  {card.title}
                </h3>
                <p
                  className="mb-5 text-sm leading-relaxed"
                  style={{ color: COLORS.muted }}
                >
                  {card.description}
                </p>
                <div className="mt-auto border-t pt-4" style={{ borderColor: COLORS.border }}>
                  <ul className="space-y-2.5">
                    {card.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: COLORS.secondary }}
                        />
                        <span style={{ color: COLORS.muted }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── System Overview Stats ───────────────────────────────────────────────────

function SystemOverview() {
  const stats = [
    { icon: <Server className="h-5 w-5" />, value: "14,250+", label: "Registered Assets" },
    { icon: <Building2 className="h-5 w-5" />, value: "12", label: "Colleges & Departments Served" },
    { icon: <ClipboardList className="h-5 w-5" />, value: "8,400+", label: "Active Custody Records" },
    { icon: <QrCode className="h-5 w-5" />, value: "6,200+", label: "QR-Tagged Items" },
  ];

  return (
    <section id="overview" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
              }}
            >
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-5 transition-all duration-500 group-hover:scale-[3]"
                style={{ backgroundColor: COLORS.primary }}
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: COLORS.primary, color: "white" }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: COLORS.text }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-sm" style={{ color: COLORS.muted }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Security Notice ─────────────────────────────────────────────────────────

function SecurityNotice() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="compliance" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-2xl border-2 p-6 sm:p-8"
          style={{
            borderColor: COLORS.secondary,
            backgroundColor: COLORS.card,
          }}
        >
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: COLORS.secondary }}
                >
                  <AlertTriangle
                    className="h-5 w-5"
                    style={{ color: COLORS.text }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: COLORS.text }}
                >
                  Administrative Security Notice & Access Compliance
                </h3>
              </div>

              {/* Notice Text */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded ? "max-h-96" : "max-h-24"
                }`}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.muted }}
                >
                  This system portal is restricted exclusively to authorized
                  personnel of the MSU Main Property Office, designated college
                  administrators, and accredited university auditors.
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed transition-opacity duration-300 ${
                    expanded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ color: COLORS.muted }}
                >
                  All access attempts are logged, monitored, and recorded for
                  security compliance under the MSU Data Governance Framework.
                  Unauthorized entry, attempted data extraction, or any
                  suspicious activity will be reported to the university&apos;s
                  Digital Security Office and may result in administrative
                  sanctions and/or legal action under applicable data protection
                  laws.
                </p>
              </div>

              {/* Read More Toggle */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-colors duration-200 hover:opacity-70"
                style={{ color: COLORS.primary }}
                aria-expanded={expanded}
                aria-label={expanded ? "Show less security information" : "Read full security notice"}
              >
                {expanded ? "Show less" : "Read full notice"}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Compliance Badges */}
            <div className="flex shrink-0 flex-wrap gap-3">
              <div
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{ borderColor: COLORS.border }}
              >
                <Lock className="h-4 w-4" style={{ color: COLORS.secondary }} />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text }}
                  >
                    SOC2 Compliant
                  </p>
                  <p className="text-[10px]" style={{ color: COLORS.muted }}>
                    Data encrypted at rest
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{ borderColor: COLORS.border }}
              >
                <FileCheck
                  className="h-4 w-4"
                  style={{ color: COLORS.secondary }}
                />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text }}
                  >
                    Audited Quarterly
                  </p>
                  <p className="text-[10px]" style={{ color: COLORS.muted }}>
                    Access logs reviewed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function FooterSection() {
  const [systemOnline, setSystemOnline] = useState(true);
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: COLORS.footer }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/assets/office_logo.png"
                  alt="MSU Main Property Office Logo"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-white">
                  MSU Main
                </span>
                <span className="text-[11px] font-medium tracking-wide text-gray-400">
                  Property Office
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              Mindanao State University — Main Campus Property Office. Central
              Asset &amp; Inventory Management System for authorized personnel
              and university administrators.
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              System Version 3.2.1 — Build #2026.07.12
            </p>
          </div>

          {/* Administrative Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Administration
            </h4>
            <ul className="space-y-2">
              {[
                "Staff Dashboard",
                "Asset Registry",
                "Department Allocations",
                "Audit Console",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Support & Resources
            </h4>
            <ul className="space-y-2">
              {[
                "Internal Documentation",
                "IT Help Desk",
                "Property Office Contact",
                "System Status Portal",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              System Health
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`flex h-2 w-2 rounded-full ${
                    systemOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-gray-400">
                  {systemOnline ? "All Systems Operational" : "Service Disruption"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-400">Database Cluster Online</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-400">QR Scanning Services Active</span>
              </div>

              {/* Interactive Status Check Toggle */}
              <button
                onClick={() => setSystemOnline(!systemOnline)}
                className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-200 hover:bg-white/5"
                style={{ borderColor: "#1e1e1e" }}
                aria-label={`System status is currently ${
                  systemOnline ? "online" : "offline"
                }. Click to simulate a status check.`}
              >
                <Activity
                  className={`h-4 w-4 ${
                    systemOnline ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {systemOnline
                    ? "Last health check: All pass"
                    : "Health check: Issues detected"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row">
          <p>
            &copy; {currentYear} Mindanao State University — Main Campus
            Property Office. All data and access are governed by the MSU Data
            Governance Framework.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition-colors hover:text-gray-300">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-gray-300">
              Terms of Use
            </a>
            <a href="#" className="transition-colors hover:text-gray-300">
              Security Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Scroll to Top ───────────────────────────────────────────────────────────

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", toggle);
    toggle();
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed right-6 bottom-6 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.95]"
      style={{ backgroundColor: COLORS.primary, color: "white" }}
    >
      <ChevronDown className="h-5 w-5 rotate-180" />
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ backgroundColor: COLORS.bg }}>
      <Navbar />
      <HeroSection />
      <br />
      <SystemOverview />
      <SystemShowcase />
      <SecurityNotice />
      <FooterSection />
      <ScrollToTop />
    </div>
  );
}

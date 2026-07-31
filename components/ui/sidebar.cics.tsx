"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, Home, Building, UserPlus2, LogOut, Menu, X, MenuIcon, Receipt, Recycle, Activity } from "lucide-react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useQueryClient } from "@tanstack/react-query"

const navigationItems = [
  { title: "Dashboard", url: "/pages/cics/home", icon: Home },
  { title: "school property", url: "/pages/cics/universityInventory", icon: UserPlus2 },
  { title: "cics property", url: "/pages/cics/cicsInventory", icon: Building },
   { title: "Borrow Asset", url: "/pages/cics/borrow", icon: Building },
]

const accountItems = [
  { title: "Logout", url: "/", icon: LogOut }
]

interface AppSidebarProps {
  className?: string
}

export function SidebarCics({ className }: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const queryClient = useQueryClient()

  const logoutHandler = async () => {
    queryClient.clear()
    localStorage.clear()
    sessionStorage.clear()
  }

  return (
    <>
      {/* ── Mobile Navbar ── */}
      <div className="lg:hidden bg-[#03045e] text-[#FFFFFF] p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-[#023e8a]/40">
        <div className="flex items-center gap-3">
          <div className="relative aspect-square size-8 overflow-hidden rounded-sm">
            <Image
              src="/assets/cics_logo.jpg"
              alt="CICS Logo"
              fill
              className="object-contain"
              sizes="80px"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-[#FFFFFF] font-light tracking-[0.1em] uppercase text-sm"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              CICS
            </span>
            <span className="text-[10px] text-[#FFFFFF]/60 tracking-[0.2em] uppercase">Custodian</span>
          </div>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 border border-[#023e8a]/50 bg-[#023e8a]/20 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:border-[#023e8a] transition-all duration-200"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[#03045e]/80 backdrop-blur-sm"
          onClick={closeMobileMenu}
        >
          <div
            className="fixed top-0 left-0 w-64 h-full bg-[#03045e] border-r border-[#023e8a]/40 shadow-[4px_0_40px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient blue glow */}
            <div className="pointer-events-none absolute top-0 left-0 w-full h-40 bg-[#023e8a] opacity-[0.15] blur-[60px]" />

            <div className="pt-20 px-4 relative">
              {/* Nav section */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#FFFFFF]/60 mb-3 flex items-center gap-2">
                  <span className="h-px w-4 bg-[#023e8a]" />
                  Section
                </p>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2.5 text-[#FFFFFF]/80 hover:text-[#FFFFFF] hover:bg-[#023e8a] border border-transparent hover:border-[#023e8a]/40 transition-all duration-200 group"
                    >
                      <item.icon size={16} className="text-[#FFFFFF]/50 group-hover:text-[#FFFFFF] transition-colors duration-200" />
                      <span className="text-sm tracking-[0.06em] font-light">{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Logout */}
              <div className="absolute bottom-6 left-4 right-4 border-t border-[#023e8a]/40 pt-4">
                {accountItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => {
                      closeMobileMenu()
                      logoutHandler()
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-[#FFFFFF]/80 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-all duration-200 group"
                  >
                    <item.icon size={16} className="group-hover:text-red-400 transition-colors duration-200" />
                    <span className="text-sm tracking-[0.06em] font-light">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <Sidebar className={`hidden lg:flex bg-[#03045e] border-r border-[#023e8a]/40 ${className}`}>

        {/* Header */}
        <SidebarHeader className="bg-[#03045e] border-b border-[#023e8a]/40 px-4 py-4 relative">
          {/* Ambient blue glow */}
          <div className="pointer-events-none absolute top-0 left-0 w-full h-20 bg-[#023e8a] opacity-[0.2] blur-[40px]" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-[#023e8a] rounded-none border border-transparent hover:border-[#023e8a]/40 transition-all duration-200">
                <a href="/">
                 <div className="aspect-square size-8 overflow-hidden rounded-sm flex items-center justify-center">
  <Image
    src="/assets/cics_logo.jpg"
    alt="CICS Logo"
    width={32}
    height={32}
    className="object-contain"
    priority
  />
</div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span
                      className="truncate text-[#FFFFFF] font-light tracking-[0.1em] uppercase text-sm"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      CICS
                    </span>
                    <span className="truncate text-[10px] text-[#FFFFFF]/60 tracking-[0.2em] uppercase">
                      Custodian
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="bg-[#03045e]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.28em] text-[#FFFFFF]/60 px-4 py-3 flex items-center gap-2">
              <span className="h-px w-4 bg-[#023e8a]" />
              Section
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="text-[#FFFFFF]/80 hover:text-[#FFFFFF] hover:bg-[#023e8a] rounded-none border border-transparent hover:border-[#023e8a]/40 mx-2 transition-all duration-200 group [&_svg]:text-[#FFFFFF]/50 group-hover:[&_svg]:text-[#FFFFFF] [&_svg]:transition-colors [&_svg]:duration-200"
                    >
                      <Link href={item.url} className="tracking-[0.04em] font-light text-sm">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-[#03045e] border-t border-[#023e8a]/40">
          <SidebarMenu>
            {accountItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  onClick={logoutHandler}
                  className="text-[#FFFFFF]/80 hover:text-red-400 hover:bg-red-950/30 rounded-none border border-transparent hover:border-red-900/30 mx-2 transition-all duration-200 group [&_svg]:transition-colors [&_svg]:duration-200 group-hover:[&_svg]:text-red-400"
                >
                  <Link href={item.url} className="tracking-[0.04em] font-light text-sm">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  )
}
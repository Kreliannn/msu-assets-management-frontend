"use client"

import type { ReactNode } from "react"

export function ReportPaper({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-white text-slate-900 rounded-sm p-6 sm:p-10 shadow-sm border border-slate-300 max-w-[860px] mx-auto">
      {/* Letterhead */}
      <div className="text-center pb-4 border-b-[3px] border-slate-800">
        <h2 className="text-xl font-bold tracking-wide">
          School Property Inventory System
        </h2>
        <p className="text-sm mt-0.5">Office of the Property Custodian</p>
      </div>

      {/* Title */}
      <div className="text-center mt-6 mb-6">
        <h3 className="text-lg font-bold uppercase tracking-widest underline decoration-2 underline-offset-8">
          {title}
        </h3>
      </div>

      {children}

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-10 text-center text-sm">
        <div>
          <p className="border-t border-slate-400 pt-1">Prepared by</p>
          <p className="text-xs text-slate-500 mt-1">
            Signature over Printed Name
          </p>
        </div>
        <div>
          <p className="border-t border-slate-400 pt-1">Noted by</p>
          <p className="text-xs text-slate-500 mt-1">
            Signature over Printed Name
          </p>
        </div>
      </div>
    </div>
  )
}

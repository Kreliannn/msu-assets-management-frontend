"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AssetListReportModal } from "./components/assetListReportModal"
import { CollegeInventoryReportModal } from "./components/collegeInventoryReportModal"
import { BorrowingReportModal } from "./components/borrowingReportModal"
import { DisposalReportModal } from "./components/disposalReportModal"
import { ConditionReportModal } from "./components/conditionReportModal"
import { AuditTrailReportModal } from "./components/auditTrailReportModal"
import { CustodianReportModal } from "./components/custodianReportModal"
import { TransferReportModal } from "./components/transferReportModal"
import {
  FileText,
  Building2,
  HandHelping,
  Trash2,
  Wrench,
  ScrollText,
  User,
  Send,
  type LucideIcon,
} from "lucide-react"
import type { ComponentType } from "react"

interface ReportConfig {
  id: string
  title: string
  description: string
  icon: LucideIcon
  Modal: ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void }>
}

const REPORTS: ReportConfig[] = [
  {
    id: "assetList",
    title: "Complete Asset List",
    description: "All registered property assets with their current details.",
    icon: FileText,
    Modal: AssetListReportModal,
  },
  {
    id: "collegeInventory",
    title: "College Inventory",
    description: "Inventory grouped by asset location / department.",
    icon: Building2,
    Modal: CollegeInventoryReportModal,
  },
  {
    id: "borrowing",
    title: "Borrowing Report",
    description: "All asset borrowing and return records.",
    icon: HandHelping,
    Modal: BorrowingReportModal,
  },
  {
    id: "disposal",
    title: "Disposal Report",
    description: "All asset disposal records with details.",
    icon: Trash2,
    Modal: DisposalReportModal,
  },
  {
    id: "condition",
    title: "Asset Condition Report",
    description: "Summary of assets grouped by condition.",
    icon: Wrench,
    Modal: ConditionReportModal,
  },
  {
    id: "audit",
    title: "Audit Trail",
    description: "System activity logs and transaction history.",
    icon: ScrollText,
    Modal: AuditTrailReportModal,
  },
  {
    id: "custodian",
    title: "Custodian Report",
    description: "Department custodians and deans from college records.",
    icon: User,
    Modal: CustodianReportModal,
  },
  {
    id: "transfer",
    title: "Transfer Report",
    description: "All asset transfer requests and their status.",
    icon: Send,
    Modal: TransferReportModal,
  },
]

export default function Page() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeReport = REPORTS.find((r) => r.id === activeId)

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and download system reports. Each report can be exported as a PDF.
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.id}
              className="rounded-lg border bg-card p-5 flex flex-col gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto"
                onClick={() => setActiveId(report.id)}
              >
                View Report
              </Button>
            </div>
          )
        })}
      </div>

      {/* Active Report Modal */}
      {activeReport && (
        <activeReport.Modal
          open={true}
          onOpenChange={(open) => {
            if (!open) setActiveId(null)
          }}
        />
      )}
    </div>
  )
}

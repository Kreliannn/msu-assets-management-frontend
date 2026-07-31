"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { MONTHS } from "./reportUtils"

interface MonthFilterProps {
  years: string[]
  year: string
  month: string
  onYearChange: (year: string) => void
  onMonthChange: (month: string) => void
}

export function MonthFilter({
  years,
  year,
  month,
  onYearChange,
  onMonthChange,
}: MonthFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Calendar className="h-4 w-4" />
        Month:
      </span>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[110px] h-9 bg-white border-slate-400">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[150px] h-9 bg-white border-slate-400">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

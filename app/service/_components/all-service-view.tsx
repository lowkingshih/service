'use client'

import { useEffect } from 'react'
import { Accordion } from '@/components/ui/accordion'
import MonthlyAccordionItem from './monthly-accordion-item'
import { GoogleSheetResponse, Row } from '@/app/type'
import { cn } from '@/lib/utils'
import useGoogleSheetUrl from '../_hooks/useGoogleSheetUrl'

export default function AllServiceView({
  serviceData,
  className,
}: {
  serviceData: GoogleSheetResponse['data']
  className?: string
}) {
  // Getting sheet url
  const { data: sheetUrl } = useGoogleSheetUrl()
  const thisYearUrl = sheetUrl?.thisYearUrl || ''
  const nextYearUrl = sheetUrl?.nextYearUrl || ''

  // Getting current year-month
  const today = new Date()
  const thisMonth = `${today.getFullYear()}-${today.getMonth() + 1}`

  useEffect(() => {
    const element = document.getElementById(thisMonth)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })

  if (!serviceData?.length) {
    return null
  }

  // current year (should be set to the smallest year in the service data)
  let thisYear: number = Infinity

  /** group data by year and month */
  const groupedData = serviceData.reduce<Record<string, Row[]>>((acc, row) => {
    const date = new Date(row.date)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const key = `${year}-${month}`
    acc[key] ??= []
    acc[key].push(row)

    if (year < thisYear) {
      thisYear = year
    }
    return acc
  }, {})

  return (
    <Accordion
      type="single"
      className={cn('w-full', className)}
      collapsible
      defaultValue={thisMonth}
    >
      {Object.entries(groupedData).map(([key, rows]) => (
        <MonthlyAccordionItem
          key={key}
          month={key}
          rows={rows}
          sheetUrl={key.split('-')[0] === thisYear.toString() ? thisYearUrl : nextYearUrl}
        />
      ))}
    </Accordion>
  )
}

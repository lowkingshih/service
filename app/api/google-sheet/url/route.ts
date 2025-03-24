import { NextResponse } from 'next/server'
import { getSheetUrl } from '../utility'
import { GoogleSheetUrlResponse } from '@/app/type'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const thisYearUrl = getSheetUrl('current')
    const nextYearUrl = getSheetUrl('next')
    return NextResponse.json(<GoogleSheetUrlResponse>{ data: { thisYearUrl, nextYearUrl } })
  } catch (error) {
    return NextResponse.json(
      <GoogleSheetUrlResponse>{
        error: { message: 'Error fetching sheet url' },
      },
      {
        status: 500,
      }
    )
  }
}

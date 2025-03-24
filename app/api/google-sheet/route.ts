import { NextResponse } from 'next/server'
import { GoogleSheetResponse, ApiResponse } from '@/app/type'
import { fetchGoogleSheetData } from './utility'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sheetData: GoogleSheetResponse = await fetchGoogleSheetData()
    return NextResponse.json(sheetData)
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error)
    const response: ApiResponse<GoogleSheetResponse> = {
      error: { message: error instanceof Error ? error.message : `${error}` },
    }
    return NextResponse.json(response, { status: 500 })
  }
}

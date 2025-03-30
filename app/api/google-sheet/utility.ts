import { isValid } from 'date-fns'
import { google } from 'googleapis'
import { COLUMN_MAPPING_REVERSE } from '@/app/const'
import { GoogleSheetResponse, GoogleSheetYear, Row } from '@/app/type'

interface GoogleSheetClientConfig {
  clientEmail?: string
  privateKey?: string
  driveEndpoint?: string
}

const SHEET_RANGE = '總表!A:V'
/**
 * Fetches data from a Google Sheet and processes it into a structured format.
 * @returns {Promise<GoogleSheetResponse>} A promise that resolves to the processed sheet data.
 */
export async function fetchGoogleSheetData(): Promise<GoogleSheetResponse> {
  const sheetClient = createGoogleSheetClient()
  const [currentYearResponse, nextYearResponse] = await Promise.all([
    sheetClient.spreadsheets.values.get({
      spreadsheetId: process.env.MAIN_SPREAD_SHEET_ID,
      range: SHEET_RANGE,
    }),
    process.env.NEXT_YEAR_SPREAD_SHEET_ID
      ? sheetClient.spreadsheets.values.get({
          spreadsheetId: process.env.NEXT_YEAR_SPREAD_SHEET_ID,
          range: SHEET_RANGE,
        })
      : void 0,
  ])
  Object.entries({ currentYearResponse, nextYearResponse }).forEach(([label, response]) => {
    // Skip if null or undefined (no next year ID)
    if (!response) return
    const { data: { values = [] } = {} } = response
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error(
        '未正確取得 Google Sheet 資料：' +
          JSON.stringify({
            [label]: response,
          })
      )
    }
  })
  // Destructure the values array, separating header row from data rows
  const [, headerRow, ...thisYearRestRows] = currentYearResponse.data.values as string[][]
  const [, , ...nextYearRestRows] = (nextYearResponse?.data.values ?? []) as string[][]
  // Get the rest of the rows from the next year's sheet
  const restRows = [...thisYearRestRows, ...nextYearRestRows]
  console.log('restRows', restRows)

  // Process the raw data
  const data = restRows
    // Convert string[][] to Record<SheetField, string>
    .map((row) => {
      const rowMap: Row = {} as Row
      headerRow.forEach((header, index) => {
        if (COLUMN_MAPPING_REVERSE[header]) {
          rowMap[COLUMN_MAPPING_REVERSE[header]] = row[index]
        }
      })
      return rowMap
    })
    // Filter out rows with invalid dates (e.g., #REF fields)
    .filter<Row>((row: Row): row is Row => isValid(new Date(row.date)))
    // Sort by date, with newer service dates first
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { data }
}

function createGoogleSheetClient({
  clientEmail = process.env.GOOGLE_CLIENT_EMAIL ?? '',
  privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
  driveEndpoint = process.env.GOOGLE_DRIVE_ENDPOINT ?? '',
}: GoogleSheetClientConfig = {}) {
  if (!clientEmail || !privateKey || !driveEndpoint) {
    throw new Error(
      '缺少必要的 Google Sheets API 環境變數：' +
        JSON.stringify({
          clientEmail: clientEmail ? '已設定' : '未設定',
          privateKey: privateKey ? '已設定' : '未設定',
          driveEndpoint: driveEndpoint ? '已設定' : '未設定',
        })
    )
  }
  const client = new google.auth.JWT(clientEmail, undefined, privateKey, [driveEndpoint])
  return google.sheets({ version: 'v4', auth: client })
}

export function getSheetUrl(year: GoogleSheetYear) {
  const sheetId =
    year === 'current' ? process.env.MAIN_SPREAD_SHEET_ID : process.env.NEXT_YEAR_SPREAD_SHEET_ID
  if (!sheetId) {
    // return empty string
    return ''
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}`
}

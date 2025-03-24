import { useQuery } from '@tanstack/react-query'
import { googleSheetApi } from '@/app/api/client'
import { QUERY_KEY } from '@/app/const'
import { GoogleSheetUrlResponse } from '@/app/type'

export default function useGoogleSheetUrl() {
  const query = useQuery<GoogleSheetUrlResponse['data']>({
    queryKey: [QUERY_KEY.GOOGLE_SHEET_URL],
    queryFn: googleSheetApi.getUrl,
    select: (data) => data,
    retry: 3,
    retryDelay: 1000,
  })

  return query
}

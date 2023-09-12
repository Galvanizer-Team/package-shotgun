import useSWR, { useSWRConfig } from "swr"
import { useRouter } from "next/router"

const fetcher = async (url) => {
  if (!url) return false
  const res = await fetch(url)
  return await res.json()
}

export default function useGet(store, urlSpecific, options = {}) {
  const router = useRouter()
  const { url, proxyUrl = "/api/proxy" } = options

  if (urlSpecific) {
    if (router.isReady) {
      store = store + router.asPath
    } else {
      store = null
    }
  }

  const endpoint = `${proxyUrl}?url=${encodeURIComponent(url)}&store=${store}`
  const { data, error } = useSWR(url && store ? store : "", () =>
    fetcher(endpoint)
  )
  const { cache } = useSWRConfig()

  if (!url) {
    const cachedData = cache.get(store)
    if (cachedData && Object.keys(cachedData).length > 0) {
      return {
        data: cachedData.data,
        error: cachedData.error,
      }
    }
    return {}
  }

  return {
    data,
    error,
  }
}

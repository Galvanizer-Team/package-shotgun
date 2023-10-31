import useSWR, { useSWRConfig } from "swr"
import { useRouter } from "next/router.js"
import { mutate } from "swr"
import { useEffect, useState } from "react"

const fetcher = async (url) => {
  if (!url) return false
  const res = await fetch(url)
  return await res.json()
}

export default function useGet(store, urlSpecific, options = {}) {
  const router = useRouter()
  const { url, proxyUrl = "/api/proxy", id = "" } = options

  if (urlSpecific) store = store + router.asPath
  if (id) store += "/" + id
  if (!router.isReady) store = null

  const endpoint = `${proxyUrl}?url=${encodeURIComponent(url)}&store=${store}`
  const { data, error } = useSWR(url && store ? store : "", () =>
    fetcher(endpoint)
  )
  const { cache } = useSWRConfig()

  const [shouldMutate, setShouldMutate] = useState(false)
  useEffect(() => {
    if (url) {
      if (shouldMutate) {
        mutate(
          (key) => typeof key === "string" && key.startsWith(store),
          data,
          true
        )
      } else {
        setShouldMutate(true)
      }
    }
  }, [url])

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

import useSWR from "swr"
import { useEffect } from "react"
import { create } from "zustand"
import { mutate } from "swr"
import formatDataObject from "./formatDataObject.mjs"

async function fetcher(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.statusCode = res.status
    throw error
  }
  return res.json()
}

export default function useGet(
  useStore,
  url = "unset",
  formatting,
  urlExtention = ""
) {
  const dataStore = useStore((state) => state.data)
  const setDataStore = useStore((state) => state.setData)
  const fetchUrl = useStore((state) => state.url)
  const setFetchUrl = useStore((state) => state.setUrl)
  const storeName = useStore((state) => state.name)

  const { data, error } = useSWR(
    url && url !== "unset" ? storeName : null,
    () => fetcher(url && url !== "unset" ? url + urlExtention : null)
  )

  const updateFetchUrl = (url) => {
    if (url === fetchUrl) return
    setFetchUrl(url)
  }

  useEffect(() => {
    if (url === "unset") return

    if (!url) {
      setDataStore({ loading: 1 })
      return
    }
    if (error) {
      updateFetchUrl(url)
      setDataStore({ error: error })
      return
    }
    if (!data) {
      updateFetchUrl(url)
      setDataStore({ loading: 2 })
      return
    }
    if (fetchUrl && url && fetchUrl !== url) {
      updateFetchUrl(url)
      mutate(storeName, null)
      setDataStore({ loading: 3 })
      return
    }

    updateFetchUrl(url)
    setDataStore(formatDataObject(data, formatting))
  }, [url, data, fetchUrl, error, setDataStore])

  if (!dataStore) {
    return { loading: 4 }
  }

  if (!url) return { loading: 5 }

  return dataStore
}

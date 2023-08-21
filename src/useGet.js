import useSWR from "swr"
import { useEffect } from "react"
import { create } from "zustand"

async function fetcher(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.statusCode = res.status
    throw error
  }
  return res.json()
}

function useStore() {
  create((set) => ({
    data: {},
    setData: (store, data) =>
      set((state) => ({ data: { ...state.data, [store]: data } })),
  }))
}

function formatDataObject(data, formatting) {
  if (!data) return {}
  if (!formatting) return data
  const formattedData = {}
  for (const key in formatting) {
    if (typeof formatting[key] === "function") {
      formattedData[key] = formatting?.[key](data?.[key], data)
    } else if (typeof formatting[key] === "object") {
      formattedData[key] = formatDataObject(formatting[key], data)
    }
  }
  return formattedData
}

export default function useGet(store, url, formatting) {
  const dataStore = useStore((state) => state?.data)
  const setDataStore = useStore((state) => state?.setData)
  const { data, error } = useSWR(url ? url : null, fetcher)

  useEffect(() => {
    if (!url) return
    if (error) return setDataStore(store, { error: error })
    if (!data) return setDataStore(store, { loading: 1 })
    setDataStore(store, formatDataObject(data, formatting))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, data, error, setDataStore, store])

  if (!dataStore?.[store]) {
    return { loading: 2 }
  }
  return dataStore[store]
}

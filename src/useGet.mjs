import useSWR from "swr"
import { useEffect } from "react"
import { create } from "zustand"
import { mutate } from "swr"

async function fetcher(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.statusCode = res.status
    throw error
  }
  return res.json()
}

const useStore = create((set) => ({
  data: {},
  setData: (store, data) =>
    set((state) => ({ data: { ...state.data, [store]: data } })),
}))

function formatDataObject(data, formatting) {
  if (!data) return {}
  if (!formatting) return data
  const formattedData = {}
  for (const key in formatting) {
    if (typeof formatting[key] === "function") {
      formattedData[key] = formatting?.[key](data?.[key], data)
    } else if (typeof formatting[key] === "object") {
      if (Array.isArray(data?.[key])) {
        formattedData[key] = data?.[key]?.map((item) =>
          formatDataObject(item, formatting[key]?.arrayFormat)
        )
        if (formatting[key]?.arrayProcess) {
          formattedData[key] = formatting[key]?.arrayProcess?.(
            formattedData[key],
            data
          )
        }
      } else {
        formattedData[key] = formatDataObject(data?.[key], formatting[key])
      }
    }
  }
  return formattedData
}

export default function useGet(store, url, formatting) {
  const dataStore = useStore((state) => state?.data)
  const setDataStore = useStore((state) => state?.setData)
  const { data, error } = useSWR(url && url !== "unset" ? store : null, () =>
    fetcher(url && url !== "unset" ? url : null)
  )

  useEffect(() => {
    if (url) console.log(url)
    if (dataStore?.[store]) console.log(dataStore?.[store])
    if (!url) return
    if (url === "unset") {
      setDataStore(store, { loading: 1, fetchUrl: url })
      return
    }

    if (error) return setDataStore(store, { error: error, fetchUrl: url })
    if (!data) return setDataStore(store, { loading: 1, fetchUrl: url })
    if (
      dataStore?.[store]?.fetchUrl &&
      url &&
      dataStore?.[store]?.fetchUrl !== url
    ) {
      setDataStore(store, { loading: 1, fetchUrl: url })
      return
    }
    const __data = formatDataObject(data, formatting)
    __data.fetchUrl = url
    setDataStore(store, __data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, data, error, setDataStore, store])

  if (!dataStore?.[store]) {
    return { loading: 2 }
  }
  return dataStore[store]
}

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

export default function useGet(useStore, url, formatting) {
  const { data: dataStore, setData: setDataStore, name: storeName } = useStore()

  const { data, error } = useSWR(url ? storeName : null, () =>
    fetcher(url ? url : null)
  )

  useEffect(() => {
    if (!url) return

    if (error) {
      setDataStore({ error: error, fetchUrl: url })
      return
    }
    if (!data) {
      setDataStore({ loading: 1, fetchUrl: url })
      return
    }
    if (dataStore?.fetchUrl && url && dataStore?.fetchUrl !== url) {
      setDataStore({ loading: 1, fetchUrl: url })
      return
    }

    const formattedData = formatDataObject(data, formatting)
    formattedData.fetchUrl = url
    setDataStore(formattedData)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, data, error, setDataStore])

  if (!dataStore) {
    return { loading: 3 }
  }

  return dataStore
}

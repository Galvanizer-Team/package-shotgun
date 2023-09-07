export default function formatDataObject(data, formatting) {
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

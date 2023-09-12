export default async function makeFetch(route, method = "GET", options) {
  let { queryArgs = {}, data = {}, headers, contentType = "formdata" } = options

  //read query args, structure as ?arg1=val1&arg2=val2...
  if (Object.keys(queryArgs).length > 0) {
    let query = "?"
    Object.keys(queryArgs).forEach((key) => {
      query += `${key}=${encodeURIComponent(queryArgs[key])}&`
    })
    route += query.slice(0, -1)
  }

  //map data json object to form data
  let body = null
  switch (contentType) {
    case "formdata":
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
      })
      body = formData
      break
    default:
      body = JSON.stringify(data)
      break
  }

  const options = {
    method: method,
    cache: "no-cache",
    body,
    headers,
  }
  if (method === "GET") delete options.body

  const res = fetch(route, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .catch((error) => {
      // Handle the error and get the error message
      const res = {
        Error: "Failed to fetch data",
        error_message: error.message,
        data: data,
        url: route,
      }
      return res
    })
  res.payload = data
  res.url = route
  return res
}

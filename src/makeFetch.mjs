export default async function makeFetch(route, method = "GET", options) {
  let { data = {}, headers, contentType = "formdata", debug = false } = options

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

  const fetchOptions = {
    method: method,
    cache: "no-cache",
    body,
    headers,
  }
  if (method === "GET") delete fetchOptions.body

  if (debug) {
    console.log("route", route)
    console.log("method", method)
    console.log("data", data)
    console.log("headers", headers)
    console.log("contentType", contentType)
    console.log("body", body)
    console.log("fetchOptions", fetchOptions)
  }

  const res = fetch(route, fetchOptions)
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

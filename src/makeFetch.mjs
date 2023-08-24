export default async function makeFetch(
  route,
  api_key = "",
  queryArgs = {},
  method = "GET",
  data = {}
) {
  const formData = new FormData()
  let key = ""

  //read query args, structure as ?arg1=val1&arg2=val2 etc and append to key
  if (Object.keys(queryArgs).length > 0) {
    let query = "?"
    Object.keys(queryArgs).forEach((key) => {
      query += `${key}=${encodeURIComponent(queryArgs[key])}&`
    })
    //remove last &
    query = query.slice(0, -1)
    key += query
  }

  route += key

  //map data json object to form data
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })

  const options =
    method != "GET"
      ? {
          method: method,
          cache: "no-cache",
          body: formData,
          headers: {
            "x-api-token": api_key,
          },
        }
      : {
          method: "GET",
          cache: "no-cache",
          headers: {
            "x-api-token": api_key,
          },
        }

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

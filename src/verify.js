export default function verify(...args) {
  let isValid = true
  let isError = false
  let isLoading = false

  for (const arg of args) {
    if (!arg || arg?.error) {
      isValid = false
      isError = true
      break
    }
    if (arg?.loading) {
      isValid = false
      isLoading = true
      break
    }
  }

  return { isValid, isError, isLoading }
}

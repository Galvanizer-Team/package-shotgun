export default function format(input, format, fallback) {
  if (!input) return fallback
  if (!format) return input

  switch (format) {
    case "PHONE":
      return input.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    case "CURRENCY":
      return input.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    case "DATE":
      return new Date(input).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "TIME":
      return new Date(input).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
    default:
      return input
  }
}

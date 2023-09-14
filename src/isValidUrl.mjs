import { URL } from "url"

export default function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

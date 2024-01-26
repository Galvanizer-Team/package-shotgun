declare module "@davidcrammer/shotgun" {
  type FormatType = "PHONE" | "CURRENCY" | "DATE" | "TIME"

  /**
   * Formats a string or number based on a format type
   * @param input
   * @param format
   * @param fallback
   */
  function format(
    input: string | number,
    format: FormatType,
    fallback: string | number
  ): string

  /**
   * Formats an object based on a formatting object
   * - The formatting object is an object with keys that match the keys of the data object
   * - The values are functions that take the value of the data object and return a formatted value
   * @param data
   * @param formatting
   */
  function formatDataObject(data: object, formatting: object): object

  function isValidUrl(url: string): boolean

  interface GetOptions {
    url?: string
    proxyUrl: string = "/api/proxy"
    id: string
    swrOptions: object
    ignoreSubdomain: boolean
    debug: boolean
  }

  /**
   * A lightweight (unnecessary) wrapper around the useSWR hook
   */
  function useGet(
    store: string,
    urlSpecific: boolean | null,
    options: GetOptions
  ): object

  type Method = "GET" | "POST" | "PUT" | "DELETE"

  interface TriggerOptions {
    store?: string
    updateData?: object
    onSuccess: () => null
    onError: () => null
    Button?: React.Component
    extendClick: () => null
    triggerOnClick?: boolean
    buttonAction?: () => null
    checkSuccess?: function
    buttonSavingText?: string
    proxy: true
    returnStore?: string
    triggerBody?: object
  }

  /**
   * A wrapper around useSWRMutation that does some interesting things
   */
  function useTrigger(
    endpoint: string,
    method: Method,
    options: TriggerOptions
  ): object

  interface FetchOptions {
    data?: object
    headers?: object
    contentType: string = "formdata"
    debug: boolean = false
  }

  /**
   * A wrapper around fetch that's super dumb and unnecessary. Don't use this. Use axios or just fetch.
   */
  function makeFetch(
    route: string,
    method: Method,
    options: FetchOptions
  ): object

  export { format, formatDataObject, isValidUrl, useGet, useTrigger, makeFetch }
}

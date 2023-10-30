import React from "react"
import useSWRMutation from "swr/mutation"
import { mutate } from "swr"
import { useState } from "react"
import { useRouter } from "next/router.js"

function defaultButtonAction(
  trigger,
  triggerOnClick,
  setIsLoading,
  extendClick = () => null,
  triggerBody
) {
  if (triggerOnClick) trigger(triggerBody)
  setIsLoading(true)
  extendClick()
}

export default function useTrigger(endpoint, method, options = {}) {
  const {
    store = "",
    updateData,
    onSuccess = () => null,
    onError = () => null,
    Button,
    extendClick = () => null,
    triggerOnClick = true,
    buttonAction = (
      trigger,
      triggerOnClick,
      setIsLoading,
      extendClick,
      triggerBody
    ) =>
      defaultButtonAction(
        trigger,
        triggerOnClick,
        setIsLoading,
        extendClick,
        triggerBody
      ),
    checkSuccess = (data) => data.success === "success",
    buttonSavingText,
    proxy = true,
    returnStore,
    triggerBody,
  } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  let _returnStore = returnStore ? "&store=" + returnStore : ""
  async function fetcher(url, { arg }) {
    if (proxy) url = "/api/proxy?url=" + encodeURIComponent(url) + _returnStore

    try {
      const req = await fetch(
        url,
        method != "GET"
          ? {
              method: method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(arg),
            }
          : {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
      )
      return req.json()
    } catch (error) {
      return { error }
    }
  }

  const onSuccessError = (data) => {
    setIsLoading(false)
    if (checkSuccess(data)) {
      onSuccess(data)
      if (store) {
        if (!updateData) {
          mutate(store)
          mutate(store + router.asPath)
        } else {
          mutate(store, updateData)
          mutate(store + router.asPath, updateData)
        }
      }
    } else {
      onError(data)
    }
  }

  const { trigger } = useSWRMutation(endpoint, fetcher, {
    onSuccess: (data) => onSuccessError(data),
    onError: (data) => onSuccessError(data),
  })

  if (Button) {
    const extendedProps = {
      isLoading: isLoading,
      onClick: () =>
        buttonAction(
          trigger,
          triggerOnClick,
          setIsLoading,
          extendClick,
          triggerBody
        ),
    }
    if (buttonSavingText !== null && isLoading) {
      extendedProps.children = buttonSavingText
    }
    function ButtonComponent(props) {
      return React.createElement(Button, { ...props, ...extendedProps })
    }
    const extendedTrigger = (data) => {
      trigger(data)
      setIsLoading(true)
    }
    return { trigger: extendedTrigger, Button: ButtonComponent }
  }
  return trigger
}

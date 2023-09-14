import React from "react"
import useSWRMutation from "swr/mutation"
import { mutate } from "swr"
import { useState } from "react"
import { useRouter } from "next/router.js"

function defaultButtonAction(trigger, setIsLoading, extendClick = () => null) {
  setIsLoading(true)
  trigger()
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
    buttonAction = (trigger, setIsLoading, extendClick) =>
      defaultButtonAction(trigger, setIsLoading, extendClick),
    checkSuccess = (data) => data.success === "success",
    buttonSavingText,
  } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function fetcher(url, { arg }) {
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
      onClick: () => buttonAction(trigger, setIsLoading, extendClick),
    }
    if (buttonSavingText !== null && isLoading) {
      extendedProps.children = buttonSavingText
    }
    function ButtonComponent(props) {
      return React.createElement(Button, { ...props, ...extendedProps })
    }
    return { trigger, Button: ButtonComponent }
  }
  return trigger
}

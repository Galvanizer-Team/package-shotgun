import { create } from "zustand"

export default function createGetStore(name) {
  return create((set) => ({
    name: name,
    url: "unset",
    data: { loading: 1 },
    setData: (data) => set({ data }),
    setUrl: (url) => set({ url }),
  }))
}

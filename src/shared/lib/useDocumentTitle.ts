import { useEffect, useRef } from 'react'

export const useDocumentTitle = () => {
  const defaultTitle = useRef(document.title)

  const updateTitle = (newTitle?: string) => {
    if (!newTitle) return
    document.title = `${newTitle} | ${defaultTitle.current}`
  }

  useEffect(() => {
    return () => {
      document.title = defaultTitle.current
    }
  }, [])

  return updateTitle
}

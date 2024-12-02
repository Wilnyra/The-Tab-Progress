export const getIsAuthed = () => {
  try {
    const authData = localStorage.getItem('supabase.auth.token')
    if (!authData) return false

    const parsedData = JSON.parse(authData)
    const { currentSession } = parsedData

    if (!currentSession || !currentSession.access_token) return false

    const expiresAt = currentSession.expires_at || currentSession.expiresAt
    const now = Math.floor(Date.now() / 1000)
    return expiresAt > now

  } catch (error) {
    return false
  }
}

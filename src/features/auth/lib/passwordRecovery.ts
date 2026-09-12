const PASSWORD_RECOVERY_KEY = 'PASSWORD_RECOVERY_PENDING'

export const markPasswordRecoveryPending = (): void => {
  try {
    sessionStorage.setItem(PASSWORD_RECOVERY_KEY, '1')
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to store password recovery flag', error)
    }
  }
}

export const consumePasswordRecoveryPending = (): boolean => {
  try {
    const isPending = sessionStorage.getItem(PASSWORD_RECOVERY_KEY) === '1'
    if (isPending) sessionStorage.removeItem(PASSWORD_RECOVERY_KEY)
    return isPending
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to read password recovery flag', error)
    }
    return false
  }
}

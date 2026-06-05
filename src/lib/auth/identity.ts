const USER_ID_KEY = 'cartinha_user_id'
const NICKNAME_KEY = 'cartinha_nickname'

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function getNickname(): string | null {
  return localStorage.getItem(NICKNAME_KEY)
}

export function setNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname.trim())
}

export function hasNickname(): boolean {
  const n = getNickname()
  return !!n && n.trim().length > 0
}

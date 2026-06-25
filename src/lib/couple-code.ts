export function generateCoupleCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function validateCoupleCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/i.test(code.trim())
}

export function normalizeCoupleCode(code: string): string {
  return code.trim().toUpperCase()
}

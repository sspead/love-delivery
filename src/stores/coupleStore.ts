import { create } from 'zustand'
import type { Profile, Couple } from '../lib/database.types'

interface CoupleState {
  profile: Profile | null
  couple: Couple | null
  partner: Profile | null
  loading: boolean
  setProfile: (profile: Profile | null) => void
  setCouple: (couple: Couple | null) => void
  setPartner: (partner: Profile | null) => void
  setLoading: (loading: boolean) => void
  isPaired: () => boolean
}

export const useCoupleStore = create<CoupleState>((set, get) => ({
  profile: null,
  couple: null,
  partner: null,
  loading: true,
  setProfile: (profile) => set({ profile }),
  setCouple: (couple) => set({ couple }),
  setPartner: (partner) => set({ partner }),
  setLoading: (loading) => set({ loading }),
  isPaired: () => {
    const { couple } = get()
    return !!(couple && couple.user1_id && couple.user2_id)
  },
}))

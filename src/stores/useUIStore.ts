import { create } from 'zustand'

interface UIStore {
  modalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const useUIStore = create<UIStore>((set) => ({
  modalOpen: false,
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}))

export default useUIStore

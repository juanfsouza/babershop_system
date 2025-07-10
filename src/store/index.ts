import { create } from 'zustand';

interface Service {
  id: number | null;
  name: string;
  price: number;
  duration: number;
  image: string | null;
  description: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const useStore = create<Store>((set) => ({
  services: [],
  setServices: (services) => set({ services }),
}));
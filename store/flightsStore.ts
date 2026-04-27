import { create } from 'zustand';
import type { Flight, FlightStatus, Terminal } from '@/types';

interface FiltersState {
  terminal: Terminal | 'All';
  airline: string;
  status: FlightStatus | 'All';
  destination: string;
}

interface FlightsStore {
  flights: Flight[];
  filters: FiltersState;
  setFlights: (flights: Flight[]) => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;
  addFlight: (flight: Flight) => void;
  removeFlight: (id: string) => void;
  resetFlights: (flights: Flight[]) => void;
}

export const useFlightsStore = create<FlightsStore>((set) => ({
  flights: [],
  filters: {
    terminal: 'All',
    airline: 'All',
    status: 'All',
    destination: '',
  },

  setFlights: (flights) => set({ flights }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  updateFlight: (id, updates) =>
    set((state) => ({
      flights: state.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  addFlight: (flight) => set((state) => ({ flights: [...state.flights, flight] })),

  removeFlight: (id) =>
    set((state) => ({ flights: state.flights.filter((f) => f.id !== id) })),

  resetFlights: (flights) => set({ flights }),
}));

export function selectFilteredFlights(state: FlightsStore): Flight[] {
  const { flights, filters } = state;
  return flights.filter((f) => {
    if (filters.terminal !== 'All' && f.terminal !== filters.terminal) return false;
    if (filters.airline !== 'All' && f.airline !== filters.airline) return false;
    if (filters.status !== 'All' && f.status !== filters.status) return false;
    if (filters.destination && !f.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    return true;
  });
}

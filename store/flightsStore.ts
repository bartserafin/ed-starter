import { create } from 'zustand';
import type { Flight, FlightStatus, Terminal } from '@/types';

type SortColumn = 'departureTime' | 'terminal' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

interface FiltersState {
  terminal: Terminal | 'All';
  airline: string;
  status: FlightStatus | 'All';
  destination: string;
}

interface FlightsStore {
  flights: Flight[];
  filters: FiltersState;
  sort: SortState;
  setFlights: (flights: Flight[]) => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  setSort: (column: SortColumn) => void;
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
  sort: { column: null, direction: 'asc' },

  setFlights: (flights) => set({ flights }),

  setSort: (column) =>
    set((state) => ({
      sort: {
        column,
        direction:
          state.sort.column === column && state.sort.direction === 'asc'
            ? 'desc'
            : 'asc',
      },
    })),

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

const STATUS_ORDER: Record<FlightStatus, number> = {
  Boarding: 0,
  'On Time': 1,
  Delayed: 2,
  Departed: 3,
  Cancelled: 4,
};

export function selectFilteredFlights(state: FlightsStore): Flight[] {
  const { flights, filters, sort } = state;
  const filtered = flights.filter((f) => {
    if (filters.terminal !== 'All' && f.terminal !== filters.terminal) return false;
    if (filters.airline !== 'All' && f.airline !== filters.airline) return false;
    if (filters.status !== 'All' && f.status !== filters.status) return false;
    if (filters.destination && !f.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    return true;
  });

  if (!sort.column) return filtered;

  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (sort.column === 'status') {
      return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
    }
    return a[sort.column!].localeCompare(b[sort.column!]) * dir;
  });
}

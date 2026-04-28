/**
 * Required setup (packages not yet installed):
 *
 *   npm install -D vitest @vitejs/plugin-react @testing-library/react \
 *                        @testing-library/user-event @testing-library/jest-dom jsdom
 *
 * Add to package.json scripts:
 *   "test": "vitest"
 *
 * Create vitest.config.ts — see vitest.config.ts.example in this directory.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FlightBoard } from '../FlightBoard';
import { useFlightsStore } from '@/store/flightsStore';
import type { Flight } from '@/types';

vi.mock('../LiveClock', () => ({ LiveClock: () => <span data-testid="live-clock">00:00</span> }));

vi.mock('../FlightRow', () => ({
  FlightRow: ({ flight }: { flight: Flight }) => (
    <div data-testid="flight-row" data-flight-id={flight.id}>
      <span data-testid="flight-number">{flight.flightNumber}</span>
      <span data-testid="flight-destination">{flight.destination}</span>
      <span data-testid="flight-time">{flight.departureTime}</span>
      <span data-testid="flight-status">{flight.status}</span>
      <span data-testid="flight-terminal">{flight.terminal}</span>
    </div>
  ),
}));

const mockFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'LO100',
    airline: 'LOT',
    destination: 'Warsaw',
    departureTime: '08:00',
    terminal: 'T1',
    gate: 'A1',
    status: 'On Time',
  },
  {
    id: '2',
    flightNumber: 'FR200',
    airline: 'Ryanair',
    destination: 'London',
    departureTime: '10:30',
    terminal: 'T2',
    gate: 'B3',
    status: 'Delayed',
    delayMinutes: 45,
  },
  {
    id: '3',
    flightNumber: 'W6300',
    airline: 'Wizz Air',
    destination: 'Paris',
    departureTime: '12:00',
    terminal: 'T1',
    gate: 'C2',
    status: 'Boarding',
  },
];

beforeEach(() => {
  useFlightsStore.setState({
    flights: [],
    filters: { terminal: 'All', airline: 'All', status: 'All', destination: '' },
    sort: { column: null, direction: 'asc' },
  });
});

describe('FlightBoard — flight list rendering', () => {
  it('renders a row for each flight in initialFlights', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    expect(screen.getAllByTestId('flight-row')).toHaveLength(3);
  });

  it('displays the correct flight count label', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    expect(screen.getByText('3 flights')).toBeInTheDocument();
  });

  it('uses singular "flight" when exactly one flight is visible', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Boarding' },
    });
    expect(screen.getByText('1 flight')).toBeInTheDocument();
  });

  it('renders correct flight data — number, destination, time, status', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    expect(screen.getByText('LO100')).toBeInTheDocument();
    expect(screen.getByText('Warsaw')).toBeInTheDocument();
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('On Time')).toBeInTheDocument();
  });

  it('renders RunwayBriefing header', () => {
    render(<FlightBoard initialFlights={[]} />);
    expect(screen.getByText('RunwayBriefing')).toBeInTheDocument();
  });
});

describe('FlightBoard — empty state', () => {
  it('shows empty-state message when no flights match the status filter', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Cancelled' },
    });
    expect(
      screen.getByText('No flights match the current filters.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('flight-row')).toBeNull();
    expect(screen.getByText('0 flights')).toBeInTheDocument();
  });

  it('shows empty-state message when initialFlights is empty', () => {
    render(<FlightBoard initialFlights={[]} />);
    expect(
      screen.getByText('No flights match the current filters.')
    ).toBeInTheDocument();
  });
});

describe('FlightBoard — filtering', () => {
  it('filters by status — shows only Delayed flights', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'Delayed' },
    });
    const rows = screen.getAllByTestId('flight-row');
    expect(rows).toHaveLength(1);
    expect(screen.getByText('FR200')).toBeInTheDocument();
    expect(screen.queryByText('LO100')).toBeNull();
    expect(screen.queryByText('W6300')).toBeNull();
  });

  it('filters by terminal — T1 shows two flights, T2 shows one', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    const terminalSelect = screen.getByDisplayValue('All Terminals');

    fireEvent.change(terminalSelect, { target: { value: 'T1' } });
    expect(screen.getAllByTestId('flight-row')).toHaveLength(2);
    expect(screen.getByText('LO100')).toBeInTheDocument();
    expect(screen.getByText('W6300')).toBeInTheDocument();
    expect(screen.queryByText('FR200')).toBeNull();

    fireEvent.change(terminalSelect, { target: { value: 'T2' } });
    expect(screen.getAllByTestId('flight-row')).toHaveLength(1);
    expect(screen.getByText('FR200')).toBeInTheDocument();
  });

  it('filters by airline', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByDisplayValue('All Airlines'), {
      target: { value: 'LOT' },
    });
    expect(screen.getAllByTestId('flight-row')).toHaveLength(1);
    expect(screen.getByText('LO100')).toBeInTheDocument();
  });

  it('filters by destination text (case-insensitive)', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByPlaceholderText('Destination...'), {
      target: { value: 'lon' },
    });
    expect(screen.getAllByTestId('flight-row')).toHaveLength(1);
    expect(screen.getByText('FR200')).toBeInTheDocument();
    expect(screen.queryByText('LO100')).toBeNull();
  });

  it('combines status and terminal filters', () => {
    render(<FlightBoard initialFlights={mockFlights} />);
    fireEvent.change(screen.getByDisplayValue('All Terminals'), {
      target: { value: 'T1' },
    });
    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'On Time' },
    });
    expect(screen.getAllByTestId('flight-row')).toHaveLength(1);
    expect(screen.getByText('LO100')).toBeInTheDocument();
  });
});

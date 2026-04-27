'use client';

import { useEffect } from 'react';
import { FlightRow } from './FlightRow';
import { LiveClock } from './LiveClock';
import { useShallow } from 'zustand/react/shallow';
import { useFlightsStore, selectFilteredFlights } from '@/store/flightsStore';
import type { Flight, FlightStatus, Terminal } from '@/types';
import { ALL_AIRLINES, ALL_STATUSES, ALL_TERMINALS } from '@/types';

interface FlightBoardProps {
  initialFlights: Flight[];
}

export function FlightBoard({ initialFlights }: FlightBoardProps) {
  const { filters, setFilter, setFlights } = useFlightsStore();
  const flights = useFlightsStore(useShallow(selectFilteredFlights));

  useEffect(() => {
    setFlights(initialFlights);
  }, [initialFlights, setFlights]);

  return (
    <div className="min-h-screen bg-board-bg">
      {/* Header */}
      <header className="bg-board-header border-b border-board-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-amber-400 uppercase">
            RunwayBriefing
          </h1>
          <p className="text-xs text-board-muted tracking-widest uppercase mt-0.5">
            Flight Information Display
          </p>
        </div>
        <LiveClock />
      </header>

      {/* Filters */}
      <div className="bg-board-header border-b border-board-border px-6 py-3 flex flex-wrap gap-4 items-center">
        <span className="text-xs text-board-muted uppercase tracking-widest">Filter:</span>

        <select
          value={filters.terminal}
          onChange={(e) => setFilter('terminal', e.target.value as Terminal | 'All')}
          className="bg-board-row border border-board-border text-board-text text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-600"
        >
          <option value="All">All Terminals</option>
          {ALL_TERMINALS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filters.airline}
          onChange={(e) => setFilter('airline', e.target.value)}
          className="bg-board-row border border-board-border text-board-text text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-600"
        >
          <option value="All">All Airlines</option>
          {ALL_AIRLINES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as FlightStatus | 'All')}
          className="bg-board-row border border-board-border text-board-text text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-600"
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={filters.destination}
          onChange={(e) => setFilter('destination', e.target.value)}
          placeholder="Destination..."
          className="bg-board-row border border-board-border text-board-text text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-600 w-36"
        />

        <span className="ml-auto text-xs text-board-muted">
          {flights.length} flight{flights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[120px_160px_1fr_80px_60px_60px_140px] gap-2 px-4 py-2 text-xs text-board-muted uppercase tracking-widest border-b border-board-border bg-board-header">
        <span>Flight</span>
        <span>Airline</span>
        <span>Destination</span>
        <span className="text-center">Time</span>
        <span className="text-center">Term.</span>
        <span className="text-center">Gate</span>
        <span>Status</span>
      </div>

      {/* Flights */}
      <div>
        {flights.length === 0 ? (
          <div className="px-6 py-16 text-center text-board-muted text-sm">
            No flights match the current filters.
          </div>
        ) : (
          flights.map((flight, i) => <FlightRow key={flight.id} flight={flight} index={i} />)
        )}
      </div>

      {/* Admin link */}
      <div className="fixed bottom-4 right-4">
        <a
          href="/admin"
          className="text-xs text-board-muted hover:text-amber-400 transition-colors border border-board-border px-3 py-1.5 rounded bg-board-header"
        >
          Admin Panel →
        </a>
      </div>
    </div>
  );
}

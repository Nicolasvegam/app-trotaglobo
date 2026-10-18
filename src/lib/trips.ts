import { parseISO } from "date-fns";
import tripsData from "@/data/trips.json";

export type TripCity = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  places: string[];
};

export type Trip = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image: string;
  tags: string[];
  cities: TripCity[];
};

const trips = (tripsData as Trip[])
  .slice()
  .sort((a, b) => b.start_date.localeCompare(a.start_date));

export function getTrips(): Trip[] {
  return trips;
}

export function getTrip(id: string): Trip | undefined {
  return trips.find((trip) => trip.id === id);
}

// Dates are stored as "YYYY-MM-DD"; parseISO reads them as local dates so
// they don't shift a day back in timezones west of UTC.
export function getTripDates(trip: Trip) {
  return { start: parseISO(trip.start_date), end: parseISO(trip.end_date) };
}

export function getTripDays(trip: Trip): number {
  const { start, end } = getTripDates(trip);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function isPastTrip(trip: Trip): boolean {
  return getTripDates(trip).end < new Date();
}

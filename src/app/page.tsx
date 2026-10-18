"use client";

import { useState, useMemo } from "react";
import { TripCard } from "@/components/trips/TripCard";
import { useRouter } from "next/navigation";
import { TripCountryFilter } from "@/components/trips/TripCountryFilter";
import { TripContinentFilter } from "@/components/trips/TripContinentFilter";
import { TripMap } from "@/components/trips/TripMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Map as MapIcon, CalendarDays, Trophy } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getCountryContinent } from "@/utils";
import { getTrips, getTripDays, isPastTrip } from "@/lib/trips";

const trips = getTrips();

export default function TripsPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (selectedCountry) {
        const hasCountry = trip.cities.some(
          (city) => city.country === selectedCountry
        );
        if (!hasCountry) return false;
      }

      if (selectedContinent) {
        const hasContinent = trip.cities.some((city) => {
          const continent = getCountryContinent(city.country);
          return continent === selectedContinent;
        });
        if (!hasContinent) return false;
      }

      return true;
    });
  }, [selectedCountry, selectedContinent]);

  // Calculate travel stats
  const travelStats = useMemo(() => {
    const pastTrips = trips.filter(isPastTrip);
    const countries = new Set(pastTrips.flatMap(trip => trip.cities.map(city => city.country)));
    const cities = new Set(pastTrips.flatMap(trip => trip.cities.map(city => city.name)));

    // Calculate longest trip
    const longestTrip = pastTrips.reduce((longest, trip) => {
      const days = getTripDays(trip);
      return days > longest ? days : longest;
    }, 0);

    // Calculate most visited country
    const countryCounts = pastTrips.flatMap(trip => trip.cities.map(city => city.country))
      .reduce((acc, country) => {
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const mostVisitedCountry = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalCountries: countries.size,
      totalCities: cities.size,
      longestTrip: `${longestTrip} days`,
      mostVisitedCountry
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto px-12 sm:px-6 lg:px-8 py-8 sm:py-6 lg:py-8">
        {/* Stats Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Travel Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{travelStats.totalCountries}/195</div>
                <p className="text-xs text-muted-foreground">countries explored</p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
                <MapIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{travelStats.totalCities}</div>
                <p className="text-xs text-muted-foreground">unique cities visited</p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Longest Trip</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{travelStats.longestTrip}</div>
                <p className="text-xs text-muted-foreground">longest single adventure</p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Visited</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{travelStats.mostVisitedCountry !== 'N/A' ? travelStats.mostVisitedCountry : '...'}</div>
                <p className="text-xs text-muted-foreground">{travelStats.mostVisitedCountry !== 'N/A' ? 'top country' : 'keep travelling!'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Section */}
          <div className="lg:w-[45%] lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6 flex justify-between items-center border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Travel Map</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Past and future adventures
                  </p>
                </div>
              </div>
              <div className="h-[400px] lg:h-[600px]">
                {filteredTrips.length > 0 && <TripMap
                  trips={filteredTrips}
                  onTripClick={(trip) => router.push(`/trips/${trip.id}`)}
                />}
              </div>
            </div>
          </div>

          {/* Right side - Cards and Filters */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col mb-8">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Trips</h1>

              <div className="mt-4 space-y-2">
                <TripContinentFilter
                  displayedTrips={filteredTrips}
                  selectedContinent={selectedContinent}
                  onContinentSelect={setSelectedContinent}
                />
                <TripCountryFilter
                  displayedTrips={filteredTrips}
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                />
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => router.push(`/trips/${trip.id}`)}
                />
              ))}

              {filteredTrips.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="bg-neutral-100 rounded-full p-5 mb-6">
                    <MapPin className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-medium text-neutral-800 mb-3">
                    No trips found
                  </h3>
                  <p className="text-neutral-500 max-w-md mb-8 text-lg">
                    Try a different country or continent.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

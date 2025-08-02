"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrips } from "@/lib/queries/get-trips";
import { TripCard } from "@/components/trips/TripCard";
import { TripCountryFilter } from "@/components/trips/TripCountryFilter";
import { TripContinentFilter } from "@/components/trips/TripContinentFilter";
import { TripMap } from "@/components/trips/TripMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Map as MapIcon, CalendarDays, Trophy } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getCountryContinent } from "@/utils";
import { ClerkUserAdapter } from "@/lib/adapter/clerk-user.adapter";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserProfileContentProps {
  user: ClerkUserAdapter;
}

export function UserProfileContent({ user }: UserProfileContentProps) {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ["trips", user.id],
    queryFn: async () => {
        const trips = await getTrips(null, user.id);
        return trips;
    },
  });

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    return trips.filter((trip) => {
      if (selectedCountry) {
        const hasCountry = trip.trip_cities.some(
          (city) => city.country === selectedCountry
        );
        if (!hasCountry) return false;
      }

      if (selectedContinent) {
        const hasContinent = trip.trip_cities.some((city) => {
          const continent = getCountryContinent(city.country);
          return continent === selectedContinent;
        });
        if (!hasContinent) return false;
      }

      return true;
    });
  }, [trips, selectedCountry, selectedContinent]);

  // Calculate travel stats
  const travelStats = useMemo(() => {
    if (!trips) return {
      totalCountries: 0,
      totalCities: 0,
      longestTrip: '0 days',
      mostVisitedCountry: 'N/A'
    };

    const pastTrips = trips.filter(trip => new Date(trip.end_date) < new Date());
    const countries = new Set(pastTrips.flatMap(trip => trip.trip_cities.map(city => city.country)));
    const cities = new Set(pastTrips.flatMap(trip => trip.trip_cities.map(city => city.name)));
    
    // Calculate longest trip
    const longestTrip = pastTrips.reduce((longest, trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days > longest ? days : longest;
    }, 0);

    // Calculate most visited country
    const countryCounts = pastTrips.flatMap(trip => trip.trip_cities.map(city => city.country))
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
  }, [trips]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-destructive">
            Error loading trips. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto px-12 sm:px-6 lg:px-8 py-8 sm:py-6 lg:py-8">
        {/* Stats Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Image 
              src={user.image || '/default-avatar.png'}
              alt={`${user.firstName}'s profile`}
              width={64}
              height={64}
              className="rounded-full object-cover aspect-square"
            />
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-neutral-600">Travel Stats</p>
            </div>
          </div>
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
                    Visualize past and future adventures
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-neutral-900">Trips</h1>
              </div>

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
                    No trips yet
                  </h3>
                  <p className="text-neutral-500 max-w-md mb-8 text-lg">
                    This user hasn&apos;t added any trips yet.
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
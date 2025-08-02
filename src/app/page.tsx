"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrips } from "@/lib/queries/get-trips";
import { TripCard } from "@/components/trips/TripCard";
import { AddTripModal } from "@/components/trips/AddTripModal";
import { useRouter } from "next/navigation";
import { TripCountryFilter } from "@/components/trips/TripCountryFilter";
import { TripContinentFilter } from "@/components/trips/TripContinentFilter";
import { TripMap } from "@/components/trips/TripMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin,  Globe, Map as MapIcon, CalendarDays, Trophy, User } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import { Footer } from "@/components/Footer";
import { getCountryContinent } from "@/utils";
import Link from "next/link";
import { createTrip } from "@/lib/commands/create-trip";
import { CreateTripDto } from "@/lib/dtos/create-trip.dto";

export default function TripsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const { session } = useSession();
  const queryClient = useQueryClient();
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
        if (!session) return [];
        const token = await session.getToken();
        if (!token) return [];
        const trips = await getTrips(token, session.user.id);
        return trips;
    },
    enabled: !!session
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-neutral-800">Your Travel Stats</h2>
            <div className="flex gap-2">
              {session && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    if (!session) return;
                    const token = await session.getToken();
                    if (!token) return;
                    try {
                      const mediterraneoGreciaTrip: CreateTripDto = {
                      title: "Gran Tour Mediterráneo y Grecia 2025",
                      description: "Viaje épico por Portugal, España, islas mediterráneas y culminando en Grecia con Creta - octubre 2025",
                      start_date: "2025-10-01T00:00:00Z",
                      end_date: "2025-10-31T00:00:00Z",
                      cover_image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3",
                      trip_cities: [
                        {
                          name: "Lisboa",
                          country: "Portugal",
                          lat: 38.7223,
                          lng: -9.1393,
                          trip_places: [
                            { name: "Torre de Belém" },
                            { name: "Barrio de Alfama" },
                            { name: "Monasterio de los Jerónimos" },
                            { name: "Tranvía 28" },
                            { name: "Mirador de Santa Lucía" }
                          ]
                        },
                        {
                          name: "Porto",
                          country: "Portugal",
                          lat: 41.1579,
                          lng: -8.6291,
                          trip_places: [
                            { name: "Librería Lello" },
                            { name: "Puente Dom Luis I" },
                            { name: "Bodegas de Vino de Oporto" },
                            { name: "Torre dos Clérigos" },
                            { name: "Estación de São Bento" }
                          ]
                        },
                        {
                          name: "Sevilla",
                          country: "España",
                          lat: 37.3891,
                          lng: -5.9845,
                          trip_places: [
                            { name: "Catedral y Giralda" },
                            { name: "Real Alcázar" },
                            { name: "Plaza de España" },
                            { name: "Barrio de Santa Cruz" },
                            { name: "Metropol Parasol" }
                          ]
                        },
                        {
                          name: "Málaga",
                          country: "España",
                          lat: 36.7213,
                          lng: -4.4214,
                          trip_places: [
                            { name: "Alcazaba" },
                            { name: "Teatro Romano" },
                            { name: "Museo Picasso" },
                            { name: "Playa de la Malagueta" },
                            { name: "Mercado de Atarazanas" }
                          ]
                        },
                        {
                          name: "Granada",
                          country: "España",
                          lat: 37.1773,
                          lng: -3.5986,
                          trip_places: [
                            { name: "Alhambra" },
                            { name: "Generalife" },
                            { name: "Barrio del Albaicín" },
                            { name: "Catedral de Granada" },
                            { name: "Mirador de San Nicolás" }
                          ]
                        },
                        {
                          name: "Valencia",
                          country: "España",
                          lat: 39.4699,
                          lng: -0.3763,
                          trip_places: [
                            { name: "Ciudad de las Artes y las Ciencias" },
                            { name: "Playa de la Malvarrosa" },
                            { name: "Mercado Central" },
                            { name: "Catedral de Valencia" },
                            { name: "Barrio del Carmen" }
                          ]
                        },
                        {
                          name: "Barcelona",
                          country: "España",
                          lat: 41.3851,
                          lng: 2.1734,
                          trip_places: [
                            { name: "Sagrada Familia" },
                            { name: "Park Güell" },
                            { name: "Las Ramblas" },
                            { name: "Barrio Gótico" },
                            { name: "Casa Batlló" }
                          ]
                        },
                        {
                          name: "Palma de Mallorca",
                          country: "España",
                          lat: 39.5696,
                          lng: 2.6502,
                          trip_places: [
                            { name: "Catedral de Palma" },
                            { name: "Castillo de Bellver" },
                            { name: "Cuevas del Drach" },
                            { name: "Playa de Es Trenc" },
                            { name: "Pueblo de Valldemossa" }
                          ]
                        },
                        {
                          name: "Túnez",
                          country: "Túnez",
                          lat: 36.8065,
                          lng: 10.1815,
                          trip_places: [
                            { name: "Medina de Túnez" },
                            { name: "Museo del Bardo" },
                            { name: "Ruinas de Cartago" },
                            { name: "Sidi Bou Said" },
                            { name: "Mezquita Zitouna" }
                          ]
                        },
                        {
                          name: "Palermo",
                          country: "Italia",
                          lat: 38.1157,
                          lng: 13.3615,
                          trip_places: [
                            { name: "Catedral de Palermo" },
                            { name: "Palacio de los Normandos" },
                            { name: "Teatro Massimo" },
                            { name: "Mercado de Ballarò" },
                            { name: "Catacumbas de los Capuchinos" }
                          ]
                        },
                        {
                          name: "La Valeta",
                          country: "Malta",
                          lat: 35.8989,
                          lng: 14.5146,
                          trip_places: [
                            { name: "Co-Catedral de San Juan" },
                            { name: "Palacio del Gran Maestre" },
                            { name: "Jardines Upper Barrakka" },
                            { name: "Fort St. Elmo" },
                            { name: "Las Tres Ciudades" }
                          ]
                        },
                        {
                          name: "Atenas",
                          country: "Grecia",
                          lat: 37.9838,
                          lng: 23.7275,
                          trip_places: [
                            { name: "Acrópolis y Partenón" },
                            { name: "Museo de la Acrópolis" },
                            { name: "Ágora Antigua" },
                            { name: "Barrio de Plaka" },
                            { name: "Monte Licabeto" }
                          ]
                        },
                        {
                          name: "Santorini",
                          country: "Grecia",
                          lat: 36.3932,
                          lng: 25.4615,
                          trip_places: [
                            { name: "Oia - Puesta de sol" },
                            { name: "Fira" },
                            { name: "Playa Roja" },
                            { name: "Akrotiri - Sitio arqueológico" },
                            { name: "Bodegas de vino volcánico" }
                          ]
                        },
                        {
                          name: "Mykonos",
                          country: "Grecia",
                          lat: 37.4467,
                          lng: 25.3289,
                          trip_places: [
                            { name: "Molinos de viento" },
                            { name: "Pequeña Venecia" },
                            { name: "Playa Paradise" },
                            { name: "Chora - Centro histórico" },
                            { name: "Isla de Delos" }
                          ]
                        },
                        {
                          name: "Heraklion",
                          country: "Grecia",
                          lat: 35.3387,
                          lng: 25.1442,
                          trip_places: [
                            { name: "Palacio de Knossos" },
                            { name: "Museo Arqueológico" },
                            { name: "Fortaleza de Koules" },
                            { name: "Mercado Central" },
                            { name: "Playa de Ammoudara" }
                          ]
                        },
                        {
                          name: "Chania",
                          country: "Grecia",
                          lat: 35.5139,
                          lng: 24.0180,
                          trip_places: [
                            { name: "Puerto Veneciano" },
                            { name: "Faro de Chania" },
                            { name: "Mercado Municipal" },
                            { name: "Playa de Balos" },
                            { name: "Garganta de Samaria" }
                          ]
                        }
                      ],
                      trip_tags: [
                        { name: "Mediterráneo" },
                        { name: "Portugal y España" },
                        { name: "Grecia" },
                        { name: "Creta" },
                        { name: "Octubre 2025" },
                        { name: "Cultura" },
                        { name: "Playas" },
                        { name: "Historia" }
                      ]
                    };
                    
                    await createTrip(token, mediterraneoGreciaTrip);
                    queryClient.invalidateQueries({ queryKey: ["trips"] });
                    alert("¡Gran Tour Mediterráneo y Grecia 2025 creado exitosamente!");
                  } catch (error) {
                    alert("Error al crear el viaje: " + (error as Error).message);
                  }
                }}
                >
                  <MapPin className="h-4 w-4" />
                  Crear Tour Mediterráneo + Grecia
                </Button>
              )}
              {session?.user?.id && (
                <Link href={`/users/${session.user.id}`}>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
              )}
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
                  <h2 className="text-xl font-semibold text-neutral-900">Your Travel Map</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Visualize your past and future adventures
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
                <h1 className="text-2xl font-semibold text-neutral-900">My Trips</h1>
                {session && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trip
                  </Button>
                )}
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
                    {session ? "No trips yet" : "Welcome to TrotaGlobo"}
                  </h3>
                  <p className="text-neutral-500 max-w-md mb-8 text-lg">
                    {session 
                      ? "Start adding your travel memories to build your personal travel map."
                      : "Sign in to start tracking your adventures and building your personal travel map."
                    }
                  </p>
                  {session && (
                    <Button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-6 py-2.5 text-base"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      <span>Add Trip</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {session && (
          <div className="fixed bottom-8 right-8 z-10">
            <Button 
              className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-200 bg-black text-white" 
              size="icon"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        )}
      </main>


      <AddTripModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <Footer />
    </div>
  );
} 
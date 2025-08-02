"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, MapPin, Globe, Map as MapIcon, CalendarDays, Trophy, Tag, Camera, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/lib/queries/get-trip";
import { useSession } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { deleteTrip } from "@/lib/commands/delete-trip";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const DynamicMap = dynamic(() => import("@/components/trips/TripMap").then(mod => mod.TripMap), { ssr: false });

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      if (!session) return null;
      const token = await session.getToken();
      if (!token) return null;
      return await getTrip(token, tripId);
    },
    enabled: !!session && !!tripId
  });

  const deleteTripMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("No session");
      const token = await session.getToken();
      if (!token) throw new Error("No token");
      return deleteTrip(token, tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      alert("Viaje eliminado exitosamente");
      router.push("/");
    },
    onError: (error: Error) => {
      alert(error.message || "Error al eliminar el viaje");
    },
  });

  const handleDeleteTrip = () => {
    if (trip && window.confirm(`¿Estás seguro de eliminar el viaje "${trip.title}"? Esta acción no se puede deshacer.`)) {
      deleteTripMutation.mutate();
    }
  };

  // Calculate trip-specific stats
  const tripStats = useMemo(() => {
    if (!trip) return {
      totalCountries: 0,
      totalCities: 0,
      totalDays: 0,
      totalPlaces: 0
    };

    const countries = new Set(trip.trip_cities.map(city => city.country));
    const cities = trip.trip_cities.length;
    const places = trip.trip_cities.reduce((total, city) => total + (city.trip_places?.length || 0), 0);
    
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      totalCountries: countries.size,
      totalCities: cities,
      totalDays: days,
      totalPlaces: places
    };
  }, [trip]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto px-12 sm:px-6 lg:px-8 py-8 sm:py-6 lg:py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 -ml-2 mb-4">
              <ChevronLeft className="h-4 w-4" />
              Back to all trips
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">{trip.title}</h1>
              <p className="text-neutral-500 mt-1">{trip.description}</p>
            </div>
            {session && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDeleteTrip}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar viaje
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{tripStats.totalCountries}</div>
                <p className="text-xs text-muted-foreground">
                  {tripStats.totalCountries === 1 ? 'country' : 'countries'} visited
                </p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Cities</CardTitle>
                <MapIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{tripStats.totalCities}</div>
                <p className="text-xs text-muted-foreground">
                  {tripStats.totalCities === 1 ? 'city' : 'cities'} explored
                </p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{tripStats.totalDays}</div>
                <p className="text-xs text-muted-foreground">
                  {tripStats.totalDays === 1 ? 'day' : 'days'} of adventure
                </p>
              </CardContent>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium">Places</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg font-bold">{tripStats.totalPlaces}</div>
                <p className="text-xs text-muted-foreground">landmarks visited</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Section - Sticky on desktop */}
          <div className="lg:w-[45%] lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Trip Route</h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="h-[400px] lg:h-[600px]">
                <DynamicMap 
                  trips={[trip]} 
                  onTripClick={() => {}} 
                />
              </div>
            </div>
          </div>

          {/* Right side - Trip Details */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Cover Image */}
            {trip.cover_image && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                <img 
                  src={trip.cover_image} 
                  alt={trip.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {trip.trip_tags && trip.trip_tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-neutral-600" />
                  <h2 className="text-xl font-semibold text-neutral-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.trip_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-neutral-600" />
                <h2 className="text-xl font-semibold text-neutral-900">Itinerary</h2>
              </div>
              
              <div className="space-y-6">
                {trip.trip_cities.map((city, index) => (
                  <div key={index} className="relative">
                    {/* Connection line */}
                    {index < trip.trip_cities.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-full bg-neutral-200" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <h3 className="font-semibold text-lg text-neutral-900">
                          {city.name}, {city.country}
                        </h3>
                        
                        {city.trip_places && city.trip_places.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {city.trip_places.map((place, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-1.5 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">{place.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
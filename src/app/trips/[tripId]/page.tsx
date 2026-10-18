import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft, MapPin, Globe, Map as MapIcon, CalendarDays, Tag, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { TripRouteMap } from "@/components/trips/TripRouteMap";
import { getTrip, getTrips, getTripDates, getTripDays } from "@/lib/trips";

type Props = {
  params: Promise<{ tripId: string }>;
};

export function generateStaticParams() {
  return getTrips().map((trip) => ({ tripId: trip.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = getTrip((await params).tripId);
  if (!trip) return {};

  return {
    title: trip.title,
    description: trip.description,
    openGraph: {
      title: trip.title,
      description: trip.description,
      images: [trip.cover_image],
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const trip = getTrip((await params).tripId);
  if (!trip) notFound();

  const { start, end } = getTripDates(trip);
  const tripStats = {
    totalCountries: new Set(trip.cities.map(city => city.country)).size,
    totalCities: trip.cities.length,
    totalDays: getTripDays(trip),
    totalPlaces: trip.cities.reduce((total, city) => total + city.places.length, 0),
  };

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

          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">{trip.title}</h1>
            <p className="text-neutral-500 mt-1">{trip.description}</p>
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
                  {format(start, "MMMM d, yyyy")} - {format(end, "MMMM d, yyyy")}
                </p>
              </div>
              <div className="h-[400px] lg:h-[600px]">
                <TripRouteMap trip={trip} />
              </div>
            </div>
          </div>

          {/* Right side - Trip Details */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Cover Image */}
            {trip.cover_image && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full h-64">
                  <Image
                    src={trip.cover_image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {trip.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-neutral-600" />
                  <h2 className="text-xl font-semibold text-neutral-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
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
                {trip.cities.map((city, index) => (
                  <div key={index} className="relative">
                    {/* Connection line */}
                    {index < trip.cities.length - 1 && (
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

                        {city.places.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {city.places.map((place, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-1.5 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">{place}</p>
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

"use client";

import dynamic from "next/dynamic";
import { Trip } from "@/lib/trips";

const DynamicMap = dynamic(() => import("@/components/trips/TripMap").then(mod => mod.TripMap), { ssr: false });

export function TripRouteMap({ trip }: { trip: Trip }) {
  return <DynamicMap trips={[trip]} onTripClick={() => {}} />;
}

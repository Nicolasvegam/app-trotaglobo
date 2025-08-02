import { TripAdapter } from "../adapter/trip.adapter";
import { createClientSupabaseClient } from "../auth/utils/create-client-supabase-client";

export async function getTrip(token: string | null, tripId: string): Promise<TripAdapter | null> {
  const supabase = createClientSupabaseClient(token);
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      trip_cities (
        *,
        trip_places (
          *
        )
      ),
      trip_tags (
        *
      )
    `)
    .eq("id", tripId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TripAdapter;
}
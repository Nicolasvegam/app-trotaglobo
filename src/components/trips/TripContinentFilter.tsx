import { Trip } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import { getCountryContinent } from "@/utils";

interface TripContinentFilterProps {
  displayedTrips: Trip[];
  selectedContinent: string | null;
  onContinentSelect: (continent: string | null) => void;
}

export function TripContinentFilter({ displayedTrips, selectedContinent, onContinentSelect }: TripContinentFilterProps) {
  // Get continents that have at least one displayed trip
  const uniqueContinents = Array.from(
    new Set(
      displayedTrips
        .filter(trip => trip.cities.length > 0)
        .flatMap(trip => 
          trip.cities.map(city => getCountryContinent(city.country))
        )
    )
  ).sort();

  // Only hide if there are no continents and no active selection
  if (uniqueContinents.length === 0 && !selectedContinent) return null;

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedContinent === null ? "default" : "outline"}
          className="gap-2 shrink-0"
          onClick={() => onContinentSelect(null)}
        >
          <span>All Continents</span>
        </Button>
        {uniqueContinents.map(continent => (
          <Button
            key={continent}
            variant={selectedContinent === continent ? "default" : "outline"}
            onClick={() => onContinentSelect(continent)}
            className="gap-2 shrink-0"
          >
            <span>{continent}</span>
          </Button>
        ))}
      </div>
    </div>
  );
} 
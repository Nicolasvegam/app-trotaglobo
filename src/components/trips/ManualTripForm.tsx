import { useState, useRef, useEffect } from "react";
import { useSession } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoadScript } from "@react-google-maps/api";
import { createTrip } from "@/lib/commands/create-trip";
import { CreateTripDto } from "@/lib/dtos/create-trip.dto";
import { CreateTripCityDto } from "@/lib/dtos/create-trip-city.dto";
import { CreateTripPlaceDto } from "@/lib/dtos/create-trip-place.dto";
import { CreateTripTagDto } from "@/lib/dtos/create-trip-tag.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, MapPin, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnsplashImageSearch } from "@/components/ui/unsplash-image-search";
import Image from "next/image";

interface ManualTripFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const libraries: ("places")[] = ["places"];

export function ManualTripForm({ onSuccess, onCancel }: ManualTripFormProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [coverImage, setCoverImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cities, setCities] = useState<(CreateTripCityDto & { trip_places: CreateTripPlaceDto[] })[]>([]);
  const [tags, setTags] = useState<CreateTripTagDto[]>([]);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedCityIndex, setSelectedCityIndex] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showUnsplashSearch, setShowUnsplashSearch] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageSource, setCoverImageSource] = useState<'url' | 'unsplash'>('unsplash');
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }, [isLoaded]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (!value) {
      setPredictions([]);
      return;
    }

    if (autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ['(cities)'],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
          } else {
            setPredictions([]);
          }
        }
      );
    }
  };

  const handlePlaceSelect = (placeId: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['address_components', 'geometry', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const addressComponents = place.address_components || [];
            const countryComponent = addressComponents.find(
              (component) => component.types.includes("country")
            );
            const cityComponent = addressComponents.find(
              (component) => component.types.includes("locality")
            );

            if (cityComponent && countryComponent && place.geometry?.location) {
              const newCity: CreateTripCityDto & { trip_places: CreateTripPlaceDto[] } = {
                name: cityComponent.long_name,
                country: countryComponent.long_name,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                trip_places: [],
              };

              setCities([...cities, newCity]);
              setSearchInput("");
              setPredictions([]);
            }
          }
        }
      );
    }
  };

  const { mutate: createTripMutation, isPending } = useMutation({
    mutationFn: async (data: CreateTripDto) => {
      if (!session) throw new Error("No session");
      const token = await session.getToken();
      if (!token) throw new Error("No token");
      return createTrip(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      onSuccess();
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to create trip");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }
    if (cities.length === 0) {
      alert("Please add at least one city");
      return;
    }

    const tripData: CreateTripDto = {
      title,
      description,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      cover_image: coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      trip_cities: cities,
      trip_tags: tags,
    };

    createTripMutation(tripData);
  };

  const onTripPlaceSelected = (cityIndex: number) => {
    if (!newPlaceName) {
      alert("Please enter a place name");
      return;
    }

    const updatedCities = [...cities];
    updatedCities[cityIndex].trip_places.push({ 
      name: newPlaceName,
    });
    setCities(updatedCities);
    setNewPlaceName("");
    setSelectedCityIndex(null);
  };

  const addTag = () => {
    if (!newTagName) {
      alert("Please enter a tag name");
      return;
    }

    setTags([...tags, { name: newTagName }]);
    setNewTagName("");
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const removePlace = (cityIndex: number, placeIndex: number) => {
    const updatedCities = [...cities];
    updatedCities[cityIndex].trip_places = updatedCities[cityIndex].trip_places.filter(
      (_, i) => i !== placeIndex
    );
    setCities(updatedCities);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleUrlSubmit = () => {
    if (coverImageUrl) {
      setCoverImage(coverImageUrl);
    }
  };

  if (showUnsplashSearch) {
    return (
      <div className="space-y-4">
        <UnsplashImageSearch
          onSelect={(imageUrl) => {
            setCoverImage(imageUrl);
            setShowUnsplashSearch(false);
          }}
          onClose={() => setShowUnsplashSearch(false)}
        />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUnsplashSearch(false)}
            className="flex items-center gap-2 w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to form
          </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Trip Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter trip title"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={coverImageSource === 'unsplash' ? 'default' : 'outline'}
              onClick={() => {
                setShowUnsplashSearch(true);
                setCoverImageSource('unsplash');
              }}
              className="flex-1"
            >
              Unsplash
            </Button>
            <Button
              type="button"
              variant={coverImageSource === 'url' ? 'default' : 'outline'}
              onClick={() => setCoverImageSource('url')}
              className="flex-1"
            >
              Image URL
            </Button>
          </div>

          {coverImageSource === 'url' ? (
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter image URL"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleUrlSubmit}>Add URL</Button>
            </div>
          ) : null}

          {coverImage && (
            <div className="relative aspect-video rounded-md overflow-hidden border">
              <Image
                src={coverImage}
                alt="Cover image"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCoverImage("");
                  setCoverImageUrl("");
                }}
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter trip description"
          required
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            className="w-full h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full h-11"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Label>Cities</Label>
          <div className="w-full sm:w-auto">
            {isLoaded ? (
              <div className="w-full sm:w-[400px] relative">
                <Input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for a city"
                  className="w-full h-11"
                />
                {predictions.length > 0 && (
                  <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto">
                    {predictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        className="w-full px-3 py-2 text-left hover:bg-muted cursor-pointer text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlaceSelect(prediction.place_id)
                        }}
                      >
                        {prediction.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>

        <ScrollArea className="h-[200px] rounded-md border p-3">
          <div className="space-y-3">
            {cities.map((city, cityIndex) => (
              <div key={cityIndex} className="space-y-2">
                <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{city.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({city.country})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCity(cityIndex)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="ml-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a place"
                      value={selectedCityIndex === cityIndex ? newPlaceName : ""}
                      onChange={(e) => {
                        setNewPlaceName(e.target.value);
                        setSelectedCityIndex(cityIndex);
                      }}
                      className="flex-1 sm:w-60 h-10"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onTripPlaceSelected(cityIndex)}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {city.trip_places.map((place, placeIndex) => (
                    <div
                      key={placeIndex}
                      className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                    >
                      <span className="text-sm truncate mr-2">{place.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlace(cityIndex, placeIndex)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Label>Tags</Label>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Add a tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 sm:w-40 h-10"
            />
            <Button 
              type="button" 
              onClick={addTag} 
              size="sm"
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full"
            >
              <span className="text-sm">{tag.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTag(index)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="w-full sm:w-auto h-11"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto h-11"
        >
          {isPending ? "Creating..." : "Create Trip"}
        </Button>
      </div>
    </form>
  );
} 
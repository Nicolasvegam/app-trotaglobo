export * from './calculate-duration';
export * from './get-country';
export * from './calculate-travel-stats';

// Country to ISO code mapping for flag emojis
const countryToCode: { [key: string]: string } = {
  // North America
  "United States": "US",
  "Canada": "CA",
  "Mexico": "MX",
  
  // Central America
  "Belize": "BZ",
  "Costa Rica": "CR",
  "El Salvador": "SV",
  "Guatemala": "GT",
  "Honduras": "HN",
  "Nicaragua": "NI",
  "Panama": "PA",
  
  // Caribbean
  "Cuba": "CU",
  "Dominican Republic": "DO",
  "Jamaica": "JM",
  "Haiti": "HT",
  "Puerto Rico": "PR",
  "Bahamas": "BS",
  "Trinidad and Tobago": "TT",
  "Barbados": "BB",
  
  // South America
  "Argentina": "AR",
  "Bolivia": "BO",
  "Brazil": "BR",
  "Chile": "CL",
  "Colombia": "CO",
  "Ecuador": "EC",
  "Guyana": "GY",
  "Paraguay": "PY",
  "Peru": "PE",
  "Suriname": "SR",
  "Uruguay": "UY",
  "Venezuela": "VE",
  
  // Europe
  "France": "FR",
  "Italy": "IT",
  "Spain": "ES",
  "United Kingdom": "GB",
  "Germany": "DE",
  "Switzerland": "CH",
  "Belgium": "BE",
  "Netherlands": "NL",
  "Croatia": "HR",
  "Montenegro": "ME",
  "Albania": "AL",
  "Portugal": "PT",
  "Greece": "GR",
  "Turkey": "TR",
  "Iceland": "IS",
  "Norway": "NO",
  "Sweden": "SE",
  "Malta": "MT",
  
  // Asia
  "China": "CN",
  "Japan": "JP",
  "South Korea": "KR",
  "Thailand": "TH",
  "Vietnam": "VN",
  "Hong Kong": "HK",
  
  // Africa
  "Egypt": "EG",
  "South Africa": "ZA",
  "Morocco": "MA",
  "Túnez": "TN",
  
  // Oceania
  "Australia": "AU",
  "New Zealand": "NZ"
};

export function getCountryFlag(countryName: string): string {
  const code = countryToCode[countryName];
  if (!code) return '🌍'; // Default globe emoji if country not found
  
  // Convert country code to flag emoji (works by converting regional indicator symbols)
  return code
    .toUpperCase()
    .replace(/./g, char => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

export const getCountryContinent = (country: string): string => {
  const continentMap: Record<string, string> = {
    // North America
    "United States": "North America",
    "Canada": "North America",
    "Mexico": "North America",
    
    // Central America
    "Belize": "Central America",
    "Costa Rica": "Central America",
    "El Salvador": "Central America",
    "Guatemala": "Central America",
    "Honduras": "Central America",
    "Nicaragua": "Central America",
    "Panama": "Central America",
    
    // Caribbean
    "Cuba": "Caribbean",
    "Dominican Republic": "Caribbean",
    "Jamaica": "Caribbean",
    "Haiti": "Caribbean",
    "Puerto Rico": "Caribbean",
    "Bahamas": "Caribbean",
    "Trinidad and Tobago": "Caribbean",
    "Barbados": "Caribbean",
    
    // South America
    "Argentina": "South America",
    "Bolivia": "South America",
    "Brazil": "South America",
    "Chile": "South America",
    "Colombia": "South America",
    "Ecuador": "South America",
    "Guyana": "South America",
    "Paraguay": "South America",
    "Peru": "South America",
    "Suriname": "South America",
    "Uruguay": "South America",
    "Venezuela": "South America",
    
    // Europe
    "France": "Europe",
    "Italy": "Europe",
    "Spain": "Europe",
    "United Kingdom": "Europe",
    "Germany": "Europe",
    "Switzerland": "Europe",
    "Belgium": "Europe",
    "Netherlands": "Europe",
    "Croatia": "Europe",
    "Montenegro": "Europe",
    "Albania": "Europe",
    "Portugal": "Europe",
    "Greece": "Europe",
    "Turkey": "Europe",
    "Iceland": "Europe",
    "Norway": "Europe",
    "Sweden": "Europe",
    "Malta": "Europe",
    
    // Asia
    "China": "Asia",
    "Japan": "Asia",
    "South Korea": "Asia",
    "Thailand": "Asia",
    "Vietnam": "Asia",
    "Hong Kong": "Asia",
    
    // Africa
    "Egypt": "Africa",
    "South Africa": "Africa",
    "Morocco": "Africa",
    "Túnez": "Africa",
    
    // Oceania
    "Australia": "Oceania",
    "New Zealand": "Oceania"
  };

  return continentMap[country] || "Other";
}; 
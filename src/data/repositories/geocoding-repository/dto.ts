export type SearchCityParams = {
  query: string
  userLocation?: {
    lat: number
    lon: number
  }
  limit?: number
}

export type ReverseGeocodeParams = {
  lat: number
  lon: number
}

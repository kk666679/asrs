export const GOOGLE_MAP_API_URL = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;

export const DEFAULT_MAP_CENTER = {
  lat: 37.7749,
  lng: -122.4194
};

export const MAP_STYLES = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [{"weight": "2.00"}]
  },
  {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#9c9c9c"}]
  },
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [{"visibility": "on"}]
  }
];
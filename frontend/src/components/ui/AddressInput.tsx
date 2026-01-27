/**
 * AddressInput - Input de dirección con mapa OpenStreetMap
 *
 * Usa Leaflet + Nominatim (gratuito) para búsqueda de direcciones
 * y selección en mapa
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AddressInputProps {
  label?: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  onAddressChange: (data: { direccion: string; latitud?: number; longitud?: number }) => void;
  required?: boolean;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Cargar Leaflet CSS dinámicamente
const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
};

export function AddressInput({
  label = 'Dirección',
  direccion,
  latitud,
  longitud,
  onAddressChange,
  required
}: AddressInputProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(direccion || '');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimeoutRef = useRef<number>();

  // Coordenadas por defecto (Buenos Aires)
  const defaultLat = latitud || -34.6037;
  const defaultLng = longitud || -58.3816;

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    loadLeafletCSS();
  }, []);

  // Buscar direcciones con Nominatim
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&limit=5`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = window.setTimeout(() => {
        searchAddress(searchQuery);
      }, 500);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchAddress]);

  // Seleccionar sugerencia
  const selectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setSearchQuery(result.display_name);
    setSuggestions([]);
    onAddressChange({
      direccion: result.display_name,
      latitud: lat,
      longitud: lng
    });

    // Actualizar mapa si está visible
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Inicializar mapa
  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Importar Leaflet dinámicamente
    const L = await import('leaflet');

    // Fix para iconos de Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

    // Click en mapa para mover marcador
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);

      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await response.json();
        if (data.display_name) {
          setSearchQuery(data.display_name);
          onAddressChange({
            direccion: data.display_name,
            latitud: lat,
            longitud: lng
          });
        }
      } catch {
        onAddressChange({
          direccion: searchQuery,
          latitud: lat,
          longitud: lng
        });
      }
    });

    // Drag del marcador
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();

      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await response.json();
        if (data.display_name) {
          setSearchQuery(data.display_name);
          onAddressChange({
            direccion: data.display_name,
            latitud: pos.lat,
            longitud: pos.lng
          });
        }
      } catch {
        onAddressChange({
          direccion: searchQuery,
          latitud: pos.lat,
          longitud: pos.lng
        });
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    setMapLoaded(true);

    // Forzar recálculo del tamaño del mapa
    setTimeout(() => map.invalidateSize(), 100);
  }, [defaultLat, defaultLng, onAddressChange, searchQuery]);

  // Inicializar mapa cuando se abre
  useEffect(() => {
    if (showMap && !mapInstanceRef.current) {
      initMap();
    }
  }, [showMap, initMap]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: theme.text }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      {/* Input de búsqueda */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dirección..."
            className="w-full px-4 py-2.5 pr-20 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: theme.backgroundSecondary,
              border: `1px solid ${theme.border}`,
              color: theme.text
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searching && (
              <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: theme.primary }} />
            )}
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: showMap ? theme.primary : theme.textSecondary }}
              title="Ver mapa"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <div
            className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            {suggestions.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectSuggestion(result)}
                className="w-full px-3 py-2 text-left text-sm flex items-start gap-2 transition-colors hover:opacity-80"
                style={{ color: theme.text }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                <span className="line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordenadas (si existen) */}
      {(latitud && longitud) && (
        <p className="text-xs" style={{ color: theme.textSecondary }}>
          Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}
        </p>
      )}

      {/* Mapa */}
      {showMap && (
        <div
          className="relative rounded-lg overflow-hidden"
          style={{ border: `1px solid ${theme.border}` }}
        >
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-[1000] p-1.5 rounded-lg shadow"
            style={{ backgroundColor: theme.card, color: theme.text }}
          >
            <X className="h-4 w-4" />
          </button>
          <div
            ref={mapRef}
            className="h-64 w-full"
            style={{ backgroundColor: theme.backgroundSecondary }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full" style={{ borderColor: theme.primary }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

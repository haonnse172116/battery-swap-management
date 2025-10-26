import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StationMap = ({ 
  stations = [], 
  userLocation = null, 
  selectedStation = null, 
  onStationSelect = () => {} 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routingControlRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // ✅ Custom Icons
  const createCustomIcon = (type, color = 'blue') => {
    const iconHtml = type === 'user' 
      ? `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`
      : `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
    
    return L.divIcon({
      html: iconHtml,
      iconSize: type === 'user' ? [20, 20] : [16, 16],
      iconAnchor: type === 'user' ? [10, 10] : [8, 8],
      className: 'custom-marker'
    });
  };

  // ✅ Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [10.7769, 106.7009], // Ho Chi Minh City
      zoom: 12,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ✅ Update Markers when stations or userLocation change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    const bounds = L.latLngBounds();

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { 
          icon: createCustomIcon('user', '#3b82f6'),
          zIndexOffset: 1000 
        }
      ).addTo(mapInstanceRef.current);
      
      userMarker.bindPopup(`
        <div class="text-center">
          <strong>📍 Vị trí của bạn</strong><br>
          <small class="text-gray-600">Độ chính xác: ±${Math.round(userLocation.accuracy)}m</small>
        </div>
      `);
      
      markersRef.current.push(userMarker);
      bounds.extend([userLocation.latitude, userLocation.longitude]);
    }

    stations.forEach(station => {
      if (!station.latitude || !station.longitude) return;

      const isSelected = selectedStation?.stationId === station.stationId;
      const isAvailable = !station.isFullForSwap && station.availableBatteriesOfType > 0;
      
      let markerColor = '#6b7280'; 
      if (isSelected) markerColor = '#dc2626'; 
      else if (isAvailable) markerColor = '#10b981'; 
      else if (station.isFullForSwap) markerColor = '#f59e0b'; // Orange for full

      const stationMarker = L.marker(
        [parseFloat(station.latitude), parseFloat(station.longitude)],
        { 
          icon: createCustomIcon('station', markerColor),
          zIndexOffset: isSelected ? 900 : 100
        }
      ).addTo(mapInstanceRef.current);

      // Station popup with detailed info
      const popupContent = `
        <div class="min-w-0 max-w-xs">
          <div class="font-semibold text-gray-800 mb-1">${station.stationName}</div>
          <div class="text-xs text-gray-600 mb-2">${station.address}</div>
          <div class="flex flex-wrap gap-1 mb-2">
            <span class="px-1.5 py-0.5 text-xs rounded-full ${
              station.isFullForSwap 
                ? 'bg-red-100 text-red-700' 
                : isAvailable 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }">
              ${station.isFullForSwap ? '🔴 Đã đầy' : isAvailable ? '🟢 Có sẵn' : '⚠️ Hết pin'}
            </span>
          </div>
          <div class="text-xs text-gray-600">
            🔌 ${station.availableSlots}/${station.totalSlots} slot<br>
            🔋 ${station.availableBatteriesOfType} pin có sẵn
          </div>
          ${!isSelected ? '<div class="mt-2"><button onclick="selectStation(\'' + station.stationId + '\')" class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Chọn trạm này</button></div>' : ''}
        </div>
      `;
      
      stationMarker.bindPopup(popupContent);
      
      // Handle station selection from map
      stationMarker.on('click', () => {
        onStationSelect(station);
      });

      markersRef.current.push(stationMarker);
      bounds.extend([parseFloat(station.latitude), parseFloat(station.longitude)]);
    });

    // Fit bounds if we have markers
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }

  }, [stations, userLocation, selectedStation, onStationSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !selectedStation) {
      // Clear existing route
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        setRouteInfo(null);
      }
      return;
    }

    // Clear existing route
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    // Create new route
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.latitude, userLocation.longitude),
        L.latLng(parseFloat(selectedStation.latitude), parseFloat(selectedStation.longitude))
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null,
      show:false,
      lineOptions: {
        styles: [
          { color: '#3b82f6', weight: 6, opacity: 0.8 }, 
          { color: '#ffffff', weight: 2, opacity: 1 }     
        ]
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      // ✅ Completely hide the instructions panel
      createMarker: function() { return null; },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      
      // ✅ Custom plan with no instructions
      plan: L.Routing.plan([
        L.latLng(userLocation.latitude, userLocation.longitude),
        L.latLng(parseFloat(selectedStation.latitude), parseFloat(selectedStation.longitude))
      ], {
        createMarker: function() { return null; },
        addWaypoints: false,
        draggableWaypoints: false
      })
    });

    // ✅ Hide the routing container completely
    routingControl.on('add', function() {
      const container = routingControl.getContainer();
      if (container) {
        container.style.display = 'none';
      }
    });

    routingControl.addTo(mapInstanceRef.current);
    routingControl.hide();    

    // Handle routing events
    routingControl.on('routesfound', (e) => {
      const routes = e.routes;
      const route = routes[0];
      
      if (route) {
        const distance = (route.summary.totalDistance / 1000).toFixed(1); // km
        const duration = Math.round(route.summary.totalTime / 60); // minutes
        
        setRouteInfo({
          distance: distance,
          duration: duration,
          instructions: route.instructions?.slice(0, 5) || [] // First 5 instructions
        });
        
        // ✅ Ensure the container stays hidden after route is found
        const container = routingControl.getContainer();
        if (container) {
          container.style.display = 'none';
        }
      }
    });

    routingControl.on('routingerror', (e) => {
      console.error('Routing error:', e);
      setRouteInfo({
        error: 'Không thể tìm đường đi. Vui lòng thử lại.'
      });
    });

    routingControlRef.current = routingControl;

  }, [userLocation, selectedStation]);

  return (
    <div className="relative w-full h-full">
      {/* ✅ Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '300px' }}
      />



      {/* ✅ Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Chú thích:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
              <span>Vị trí của bạn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></div>
              <span>Trạm có sẵn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></div>
              <span>Trạm đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white"></div>
              <span>Trạm đầy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-500 border border-white"></div>
              <span>Trạm hết pin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
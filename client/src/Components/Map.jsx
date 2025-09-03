import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Fix marker icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LeafletComponent = () => {
    const [currentLocation, setCurrentLocation] = useState([25.7609329, -80.14004589999999]);
    const [markerPosition, setMarkerPosition] = useState(currentLocation);

    // Get user's current location on mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = [latitude, longitude];
                setCurrentLocation(newLocation);
                setMarkerPosition(newLocation);
            },
            (error) => console.error("Error fetching location: ", error),
            { enableHighAccuracy: true }
        );
    }, []);

    // Handle map interactions
    const MapEventHandlers = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
            },
        });
        return null;
    };

    return (
        <MapContainer
            center={currentLocation}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            fullscreenControl={true} // Enables fullscreen control
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEventHandlers />
            <Marker
                position={markerPosition}
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        setMarkerPosition([lat, lng]);
                    },
                }}
            >
                <Popup>You are here</Popup>
            </Marker>
        </MapContainer>
    );
};

export default LeafletComponent;

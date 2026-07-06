"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Koordinat kantor Disdukcapil Pesisir Barat (Kompleks Perkantoran Pemda,
// Way Redak, Krui). Bisa dioverride lewat env NEXT_PUBLIC_OFFICE_LAT/LNG.
const OFFICE_LAT = Number(process.env.NEXT_PUBLIC_OFFICE_LAT ?? "-5.19361");
const OFFICE_LNG = Number(process.env.NEXT_PUBLIC_OFFICE_LNG ?? "103.94250");

/** Marker berdenyut (divIcon + CSS) — ringan, tanpa gambar aset. */
const pulseIcon = L.divIcon({
  className: "",
  html: `
    <div class="office-marker">
      <span class="office-marker__pulse"></span>
      <span class="office-marker__pin">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </span>
    </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 40],
});

/** Animasi fly-to halus saat peta pertama tampil. */
function FlyIn() {
  const map = useMap();
  useEffect(() => {
    map.setView([OFFICE_LAT, OFFICE_LNG], 11, { animate: false });
    const t = setTimeout(() => {
      map.flyTo([OFFICE_LAT, OFFICE_LNG], 15, {
        duration: 2.2,
        easeLinearity: 0.18,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function OfficeMap() {
  return (
    <MapContainer
      center={[OFFICE_LAT, OFFICE_LNG]}
      zoom={11}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full [&_.leaflet-container]:bg-slate-100"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        // CARTO Voyager: gaya bersih & modern, gratis untuk penggunaan wajar.
      />
      <Marker position={[OFFICE_LAT, OFFICE_LNG]} icon={pulseIcon} />
      <FlyIn />
    </MapContainer>
  );
}

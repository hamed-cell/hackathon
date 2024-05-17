import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./GrassMap.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getRandomCoordinates } from "../randomCoordinates"; // Importez la fonction depuis le fichier

function GrassMap() {
  mapboxgl.accessToken = "pk.eyJ1IjoiaGFtZWQxMiIsImEiOiJjbHc5MGh3d2YyYTltMnFweXNhZHgwYWw2In0.AVp8L6FfnEg_r8aRl6Qffw";

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [targetMarker, setTargetMarker] = useState(null); // Pour stocker le marqueur cible
  const [route, setRoute] = useState(null); // Pour stocker l'itinéraire

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-77.032, 38.913],
        },
        properties: {
          title: "Mapbox",
          description: "Washington, D.C.",
        },
      }
    ],
  };

  useEffect(() => {
    toast.success("Bienvenue sur Touch Grass! Il est temps de toucher de l'herbe!");

    const initializeMap = ({ setMap, mapboxgl }) => {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-74.5, 40],
        zoom: 9,
      });

      map.on("load", () => {
        setMap(map);
        map.resize();

        // Add nature points
        geojson.features.forEach((feature) => {
          new mapboxgl.Marker()
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setText(
                `${feature.properties.title} - ${feature.properties.description}`
              )
            )
            .addTo(map);
        });

        // Create a single target marker that will be reused
        const initialTarget = getRandomCoordinates();
        if (initialTarget) {
          const { lng, lat, name } = initialTarget;

          // Create an HTML element for the custom marker
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = 'green';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.borderRadius = '50%';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setText(
                `Point à atteindre: ${name}`
              )
            )
            .addTo(map);

          setTargetMarker(marker);
        }
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);

            new mapboxgl.Marker({ color: "blue" })
              .setLngLat([longitude, latitude])
              .addTo(map);

            map.flyTo({
              center: [longitude, latitude],
              zoom: 14,
            });
          },
          (error) => console.error(error),
          { enableHighAccuracy: true }
        );

        navigator.geolocation.watchPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);

            if (map) {
              map.flyTo({
                center: [longitude, latitude],
                zoom: 14,
              });
            }
          },
          (error) => console.error(error),
          { enableHighAccuracy: true }
        );
      }
    };

    if (!map) initializeMap({ setMap, mapboxgl });
  }, [map]);

  const setRandomTargetLocation = (map) => {
    const target = getRandomCoordinates();
    if (target) {
      const { lng, lat, name } = target;

      if (targetMarker) {
        // Update the existing marker and its popup
        targetMarker.setLngLat([lng, lat]).setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText(
            `Point à atteindre: ${name}`
          )
        ).addTo(map);
      } else {
        // Create an HTML element for the custom marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = 'green';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';

        const newTargetMarker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setText(
              `Point à atteindre: ${name}`
            )
          )
          .addTo(map);

        setTargetMarker(newTargetMarker); // Store the new marker
      }

      // Animate camera to the target location
      map.flyTo({
        center: [lng, lat],
        zoom: 14,
        speed: 1.2,
        curve: 1.42,
        easing: (t) => t,
        essential: true
      });

      // Obtenir l'itinéraire de l'utilisateur vers le marqueur cible
      getRoute([lng, lat]);
    } else {
      console.error("Invalid coordinates");
    }
  };

  const getRoute = async (end) => {
    const [endLng, endLat] = end;
    const [startLng, startLat] = userLocation;

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;

    if (map.getSource('route')) {
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      });
    } else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }

    setRoute(route);
  };

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "100vh" }} />
      <ToastContainer 
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <button
        onClick={() => setRandomTargetLocation(map)}
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Nouvel objectif
      </button>
    </div>
  );
}

export default GrassMap;

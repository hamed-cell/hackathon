import React, { useEffect, useState, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./GrassMap.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getRandomCoordinates } from "../randomCoordinates"; // Importez la fonction depuis le fichier

function GrassMap() {
  mapboxgl.accessToken = "pk.eyJ1IjoiaGFtZWQxMiIsImEiOiJjbHc5MGh3d2YyYTltMnFweXNhZHgwYWw2In0.AVp8L6FfnEg_r8aRl6Qffw";

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userMarker, setUserMarker] = useState(null); // Pour stocker le marqueur utilisateur
  const [targetMarker, setTargetMarker] = useState(null); // Pour stocker le marqueur cible
  const [route, setRoute] = useState(null); // Pour stocker l'itinéraire
  const [questMessage, setQuestMessage] = useState(""); // Pour stocker le message de la quête en cours

  const encouragement = [
    "Tu es capable de grandes choses.",
    "Ne baisse jamais les bras.",
    "Chaque effort compte.",
    "Tu es plus fort(e) que tu ne le penses.",
    "Continue d'avancer, tu es sur la bonne voie.",
    "Les échecs sont des leçons déguisées.",
    "Tu as tout ce qu'il faut pour réussir.",
    "La persévérance paie toujours.",
    "Crois en toi et en tes capacités.",
    "Chaque jour est une nouvelle opportunité.",
    "Ne te compare pas aux autres, avance à ton rythme.",
    "Les petits progrès mènent à de grandes réussites.",
    "Tu es une source d'inspiration.",
    "Ne laisse jamais le doute t'arrêter.",
    "Rien n'est impossible avec de la détermination.",
    "Tu es en train de devenir la meilleure version de toi-même.",
    "Le chemin peut être difficile, mais il en vaut la peine.",
    "Tu es sur la bonne route, continue d'avancer.",
    "N'oublie pas de célébrer chaque victoire, aussi petite soit-elle.",
    "Tu es plus près de ton objectif que tu ne le crois.",
    "T'es vraiment sur le fuseau horaire du décalage horaire, même pour une tortue.",
    "Si la lenteur était un sport olympique, tu serais un champion du monde.",
    "Tu prends ton temps comme si le temps était illimité.",
    "Même les escargots se demandent pourquoi tu vas si lentement.",
    "T'as déjà pensé à louer un escargot pour accélérer un peu les choses ?",
    "Ton horloge biologique doit être sur pause permanente.",
    "Je ne suis pas sûr(e) si tu marches ou si tu as juste oublié comment courir.",
    "Le monde tourne à la vitesse de la lumière, et toi tu es là, à la vitesse d'une tortue asthmatique.",
    "Si tu avais été un super-héros, tu aurais été 'Captain Lenteur'.",
    "Tu vas tellement lentement que même les molécules te dépassent.",
    "Je vais appeler la NASA, ils pourraient avoir besoin de toi pour ralentir certaines de leurs missions.",
    "Les cinq minutes avec toi, c'est comme un voyage dans un trou noir, le temps s'étire à l'infini.",
    "J'ai demandé à une plante de te suivre, elle m'a dit qu'elle avait mieux à faire.",
    "T'es tellement lent(e) que les gens te passent en marchant.",
    "J'ai vu des glaciers bouger plus vite que toi.",
    "Les tortues te prennent en photo pour se rappeler ce qu'est la lenteur.",
    "Ton concept de 'rapidité' est un peu flou, non ?",
    "Si tu participais à une course, les gens auraient le temps de se marier, de fonder une famille et de prendre leur retraite avant que tu arrives à la ligne d'arrivée.",
    "Même les GIFs de chargement te trouvent lent(e).",
    "Quand tu dis 'bientôt', les gens prévoient en fait pour l'année prochaine."
  ];

  const toastTimeouts = useRef([]);

  useEffect(() => {
    toast.info("Bienvenue dans Va toucher de l'herbe !", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
    });

    toast.info("Prêt à découvrir de nouveaux endroits et à toucher de l'herbe ?", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
    });

    const initializeMap = ({ setMap, mapboxgl }) => {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [0, 0],
        zoom: 1,
      });

      map.on("load", () => {
        setMap(map);
        map.resize();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { longitude, latitude } = position.coords;
              setUserLocation([longitude, latitude]);

              // Animate the camera to the user's location
              map.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                speed: 1.2,
                curve: 1.42,
                duration: 2000 // Shorter duration for faster geolocation
              });

              const marker = new mapboxgl.Marker({ color: "blue" })
                .setLngLat([longitude, latitude])
                .addTo(map);

              setUserMarker(marker);
            },
            (error) => console.error(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );

          navigator.geolocation.watchPosition(
            (position) => {
              const { longitude, latitude } = position.coords;
              setUserLocation([longitude, latitude]);

              if (userMarker) {
                userMarker.setLngLat([longitude, latitude]);
              } else {
                const marker = new mapboxgl.Marker({ color: "blue" })
                  .setLngLat([longitude, latitude])
                  .addTo(map);

                setUserMarker(marker);
              }
            },
            (error) => console.error(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      });
    };

    if (!map) initializeMap({ setMap, mapboxgl });
  }, [map, userMarker]);

  const clearAllTimeouts = () => {
    toastTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    toastTimeouts.current = [];
  };

  const setRandomTargetLocation = (map) => {
    clearAllTimeouts(); // Clear existing timeouts
    const target = getRandomCoordinates();
    if (target) {
      const { lng, lat, name, address } = target;

      const displayAddress = address ? address : "Lyon";

      toast.info(`Vous allez toucher de l'herbe à ${name}, ${displayAddress}`, {
        position: "top-center",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      });

      if (targetMarker) {
        targetMarker.setLngLat([lng, lat]).setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText(`Point à atteindre: ${name}`)
        ).addTo(map);
      } else {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = 'green';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';

        const newTargetMarker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setText(`Point à atteindre: ${name}`)
          )
          .addTo(map);

        setTargetMarker(newTargetMarker);
      }

      map.flyTo({
        center: [lng, lat],
        zoom: 14,
        speed: 1.2,
        curve: 1.42,
        duration: 3000, // Shorter duration to target location
        essential: true
      });

      setTimeout(() => {
        if (userLocation) {
          map.flyTo({
            center: userLocation,
            zoom: 14,
            speed: 1.2,
            curve: 1.42,
            duration: 3000, // Shorter duration for returning to user location
            essential: true
          });

          setQuestMessage(`Vous allez toucher de l'herbe à ${name}, ${displayAddress}`);
        }
      }, 6000); // Reduced delay before returning to user location

      getRoute([lng, lat]);

      const initialDelay = 10000;
      const interval = 6000;
      encouragement.forEach((message, index) => {
        const timeout = setTimeout(() => {
          toast(message, {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
          });
        }, initialDelay + index * interval);
        toastTimeouts.current.push(timeout);
      });
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

  const centerOnUserLocation = useCallback(() => {
    if (userLocation && map) {
      map.flyTo({
        center: userLocation,
        zoom: 14,
        speed: 1.2,
        curve: 1.42,
        duration: 3000, // Duration for centering on user location
        essential: true
      });
    }
  }, [userLocation, map]);

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "100vh" }} />
      <ToastContainer 
        position="top-center"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setRandomTargetLocation(map)}
          style={{
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
        <button
          onClick={centerOnUserLocation}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Centrer
        </button>
      </div>
      {questMessage && (
        <div className="quest-widget">
          <span className="quest-widget-icon">🌿</span>
          {questMessage}
        </div>
      )}
    </div>
  );
}

export default GrassMap;

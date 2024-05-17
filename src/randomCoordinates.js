import jardinsData from "./jardins_lyon_coord.json";

export const getRandomCoordinates = () => {
  const randomIndex = Math.floor(Math.random() * jardinsData.length);
  const target = jardinsData[randomIndex];

  if (target && target.coordinates && Array.isArray(target.coordinates) && target.coordinates.length === 2) {
    const [lng, lat] = target.coordinates;
    if (!isNaN(lng) && !isNaN(lat)) {
      return { lng, lat, name: target.nom };
    }
  }
  return null;
};

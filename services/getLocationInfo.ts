export const getLocationInfo = async () => {
    try {
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
            },
            () => {
              resolve("Localização não permitida");
            }
          );
        } else {
          resolve("Geolocalização não suportada");
        }
      });
    } catch (error) {
      return "Erro ao obter localização";
    }
  };
  
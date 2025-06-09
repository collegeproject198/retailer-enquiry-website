import { useEffect, useState } from "react";

const LocationForm = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCity = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Lat/Lng:", latitude, longitude);

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              console.log("Geocoding response:", data);

              const cityName =
                data?.address?.city ||
                data?.address?.town ||
                data?.address?.village ||
                data?.address?.state ||
                "Unknown";

              setCity(cityName);
            } catch (error) {
              console.error("Error during reverse geocoding:", error);
              setCity("Unknown");
            }

            setLoading(false);
          },
          (error) => {
            console.error("Geolocation error:", error.message);
            setCity("Permission denied or unavailable");
            setLoading(false);
          }
        );
      } else {
        console.error("Geolocation not supported");
        setCity("Not supported");
        setLoading(false);
      }
    };

    fetchCity();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Form submitted from city: ${city}`);
  };

  return (
    <div>
      <h2>User Location Form</h2>
      <form onSubmit={handleSubmit}>
        <label>City:</label>
        <input type="text" value={city} readOnly />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Detecting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LocationForm;

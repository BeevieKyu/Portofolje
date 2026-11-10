// pages/rentPage.jsx;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import RentDialog from "../components/RentDialog.jsx";
import sampleRentImg from "../assets/sample-images/rent-equipment-example-image.jpg";
import ButtonLight from "../components/ui/ButtonLight";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { apiRequest } from "../utils/api.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

import "../styles/styles.css";

export default function RentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [step, setStep] = useState("rent");

  useEffect(() => {
    apiRequest("/api/v1/inventory")
      .then((data) => setEquipment(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  function handleRentClick(item) {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedItem(item);
    setStep("form");
  }

  return (
    <>
      <Navbar />
      <main className="rent-page">
        <h1>Rent equipment</h1>

        {!user && (
          <p className="error">You need to be logged in to rent equipment.</p>
        )}

        {isLoading && <p>Loading available items...</p>}
        {error && <p className="error">{error}</p>}

        <div className="rent-card-container">
          {equipment.map((item) => {
            const isAvailable = item.available > 0;

            return (
              <InfoCard
                key={item._id}
                className="rent-card"
                image={item.image ? (item.image.startsWith("/") ? `${API_BASE_URL}${item.image}` : item.image) : sampleRentImg}
                title={item.name}
                description={item.description || "No description available."}
                action={
                  <ButtonLight
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) handleRentClick(item);
                    }}
                  >
                    {isAvailable ? "Rent" : "Unavailable"}
                  </ButtonLight>
                }
              />
            );
          })}
        </div>

        {selectedItem && (
          <RentDialog
            item={selectedItem}
            step={step}
            selectedDate={selectedDate}
            onClose={() => {
              setSelectedItem(null);
              setStep("form");
              setSelectedDate(null);
            }}
            onRent={(item, date) => {
              console.log("Confirm rent", item, date);
              setSelectedDate(date);
              setStep("success");
            }}
          />
        )}

      </main>
      <Footer />
    </>
  );
}

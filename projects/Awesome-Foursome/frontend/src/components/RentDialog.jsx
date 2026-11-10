import { useState, useEffect } from "react";
import Calendar from "../components/ui/Calendar";
import ButtonLight from "../components/ui/ButtonLight";
import sampleRentImg from "../assets/sample-images/rent-equipment-example-image.jpg";
import { apiRequest } from "../utils/api.js";
import { useAuth } from "../context/auth-context.jsx";

import "../styles/styles.css";

export default function RentDialog({
  item,
  onClose,
  onRent,
  step,
  selectedDate,
}) {
  const { user, authHeaders } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Disable scroll when dialog mounts
    document.body.style.overflow = "hidden";

    // Re-enable scroll when dialog unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [localDates, setLocalDates] = useState(selectedDate || []); // Local state to manage date selection within the dialog
  const contactInfo = {
    name: "John Doe",
    email: "john.doe@ntnu.no",
    phone: "+47 123 45 678",
  };

  return (
    <div className="rent-dialog-overlay">
      <div className="rent-dialog">
        <button className="rent-dialog__close" onClick={onClose}>
          ×
        </button>

        {step === "form" && (
          <div className="rent-dialog__form">
            <div className="rent-dialog__form__left">
              <figure className="rent-dialog__form__left__figure">
                <img
                  className="rent-dialog__form__left__figure__img"
                  src={item.image || sampleRentImg}
                  alt={item.name}
                />
              </figure>
              <h2>{item.name}</h2>
              <p>{item.description || "No description available."}</p>
              <h3>Contact Information</h3>
              <div className="rent-dialog__form__left__contact">
                <p>{contactInfo.name}</p>
                <p>{contactInfo.email}</p>
                <p>{contactInfo.phone}</p>
              </div>
            </div>

            <div className="rent-dialog__form__right">
              <h2>Choose Rental Date</h2>
              <div className="rent-dialog__form__right__calendar">
                <Calendar 
                  selected={localDates} 
                  onSelect={setLocalDates}
                  onSubmit={async () => {
                    if (!localDates || localDates.length === 0 || !user) return;
                    setIsSubmitting(true);
                    try {
                      await apiRequest("/api/v1/rentals", {
                        method: "POST",
                        headers: authHeaders,
                        body: JSON.stringify({
                          itemId: item._id,
                          rentalDates: localDates.map(d => d.toISOString()),
                        }),
                      });
                      onRent(item, localDates);
                    } catch (error) {
                      console.error("Failed to create rental:", error);
                      alert("Failed to create rental. Please try again.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="rent-dialog__success">
            <div className="rent-dialog__success__header">
              <h2>Booking Confirmed</h2>
            </div>

            <div className="rent-dialog__success__body">
              <p>
                You booked <strong>{item?.name}</strong> for{" "}
                <strong>
                  {Array.isArray(localDates) && localDates.length > 0
                    ? localDates.length === 1
                      ? localDates[0].toDateString()
                      : `${localDates[0].toDateString()} to ${localDates[localDates.length - 1].toDateString()}`
                    : "N/A"}
                </strong>
                .
              </p>

              <p>
                Item can be picked up at the HCAI lab. Remember to return item
                on the last day of rental.
              </p>

              <p>
                For questions or concerns, feel free to contact:{" "}
                <strong>{contactInfo.name}</strong> through email{" "}
                <strong>{contactInfo.email}</strong> or phone{" "}
                <strong>{contactInfo.phone}</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

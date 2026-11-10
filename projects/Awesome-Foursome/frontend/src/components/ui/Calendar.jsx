import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import ButtonLight from "./ButtonLight";

export default function Calendar({ selected, onSelect, onSubmit, isLoading }) {
  const handleSelect = (dates) => {
    // Limit selection to max 7 days
    if (Array.isArray(dates) && dates.length > 7) {
      return;
    }
    onSelect(dates);
  };

  return (
    <div className="calendar-wrapper">
      <DayPicker
        mode="multiple"
        max={7}
        selected={selected || []}
        onSelect={handleSelect}
      />
      {Array.isArray(selected) && selected.length > 0 && (
        <div className="selected-dates">
          <p>Selected: {selected.length} day(s)</p>
          {onSubmit && (
            <ButtonLight
              onClick={() => onSubmit()}
              disabled={isLoading}
              className="calendar-submit"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </ButtonLight>
          )}
        </div>
      )}
    </div>
  );
}

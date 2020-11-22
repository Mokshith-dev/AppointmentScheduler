import axios from "axios"; // for calling apis
import Calendar from "react-calendar"; // for calender
import { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
function GetEvents() {
  const [dateValue, setDateValue] = useState(new Date());
  const [events, setEvents] = useState([]);
  function onCalenderChange(changedDateValue) {
    setDateValue(changedDateValue);
    console.log(dateValue);
  }
  async function getEvents() {
    try {
      console.log(dateValue[0]);
      console.log(dateValue[1]);
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/event/${dateValue[0]}/${dateValue[1]}`
      );
      setEvents(data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="outer">
      <div className="left">
        <Calendar
        className="smallMargin"
          onChange={onCalenderChange}
          selectRange={true}
          returnValue="range"
        />
        <div className="smallMargin">
          <button id="button" className="button" onClick={getEvents}>
            Get Events
          </button>
        </div>
      </div>
      <div className="right">
        {events.map((event) => (
          <div key={event} className="box">{event}</div>
        ))}
      </div>
    </div>
  );
}

export default GetEvents;

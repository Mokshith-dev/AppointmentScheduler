import axios from "axios"; // for calling apis
import Calendar from "react-calendar"; // for calender
import { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import "./App.css";
function Home(props) {
  const [dateValue, setDateValue] = useState(new Date());
  const [durationValue, setDurationValue] = useState("");
  const [timeZoneValue, setTimeZoneValue] = useState("+:05:30");
  const [slotsData, setSlotsData] = useState([]);
  const [response, setResponse] = useState("");

  function onChangeInCalender(changedDateValue) {
    setDateValue(changedDateValue);
    //console.log(value);
  }
  function onChangeInDuration(event) {
    setDurationValue(event.target.value);
    console.log(durationValue);
  }
  function onTimeZoneChange(event) {
    setTimeZoneValue(event.target.value);
    console.log(timeZoneValue);
  }
  async function getSlots() {
    const input = {
      date: new Date(dateValue),
      timeZone: timeZoneValue,
    };
    console.log(durationValue);
    try {
      const { data } = await axios.put(
        `http://localhost:8080/api/v1/event`,
        input
      );
      setSlotsData(data);
      setResponse("");
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }
  async function bookSlot(slot) {
    try {
      let inputArr = slot.replace("T", "").split(" ");
      let dateAndTime = inputArr[0] + " " + inputArr[1];
      let durationGiven = durationValue;
      const input = {
        date: dateAndTime,
        duration: durationGiven,
      };
      const { data } = await axios.patch(
        "http://localhost:8080/api/v1/event",
        input
      );
      console.log(data);
      setResponse("Booked");
    } catch (error) {
      setResponse("Cannot Book");
      console.log(error);
    }
  }
  function goToEvents() {
    props.history.push("/events");
  }
  return (
    <div className="outer">
      <div className="left">
          <div className="lightStyle smallMargin">Pick A Date</div>
        <Calendar className="smallMargin" onChange={onChangeInCalender} />
        <div className="smallMargin">
          <input
          autocomplete="off"
            placeholder="Duration in minutes"
            value={durationValue}
            onChange={onChangeInDuration}
            type="text"
            name="duration"
            id="duration"
            
          />
        </div>
        <div className="smallMargin">
          <select id="timeZone" name="timeZone" onChange={onTimeZoneChange}>
            <option value="+:05:30">GMT+05:30</option>
            <option value="+:06:00">GMT+06:00</option>
            <option value="+:06:30">GMT+06:30</option>
            <option value="+:07:00">GMT+07:00</option>
          </select>
        </div>
        <div className="smallMargin">
          <button id="button" onClick={getSlots} className="button" >
            Get Available Slots
          </button>
        </div>

        <div className="smallMargin" onClick={goToEvents}>
          <button className="button">Go To Events</button>
        </div>
        <div className="smallMargin" className="lightStyle">
          {response}
        </div>
      </div>
      <div className="right">
        {slotsData.map((slot) => (
          <div key={slot} className="box" onClick={() => bookSlot(slot)}>
            {slot}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;

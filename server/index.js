const express = require("express");
const app = express(); // for making apis
app.use(express.json());

const cors = require("cors"); // for making connection with frontend

app.use(cors());

const date = require("date-and-time"); // for performing operations on date and time

var admin = require("firebase-admin"); // for getting access & connect to firestore db

var serviceAccount = require("./serviceAccountKey.json");

//login and connect
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scheduleappointment-18177.firebaseio.com",
});

const db = admin.firestore();

//for testing coonection with react
app.put("/api/v1/event/test", (req, res) => {
  let resArr = [];
  let rdate = date.format(new Date(req.body.date), "YYYY/M/D");

  let dur = req.body.duration;

  let z = req.body.timeZone;

  resArr.push(rdate);
  resArr.push(dur);
  resArr.push(z);
  res.send(resArr);
});

//for event 1
app.put("/api/v1/event", async (req, res) => {
  let paramsDate = req.body.date;
  const paramsTimeZone = req.body.timeZone;
  if (!paramsDate || !paramsTimeZone) {
    res.status(400).send(`Bad Request Change Parameters,format: {
      "date": YYYY/M/D(eg: "2020/11/26"),
        "timeZone": +/-:HH:mm(eg: "+:05:30")
       }`);
    return;
  }

  paramsDate = date.format(new Date(req.body.date), "YYYY/M/D");
  let receivedDate = paramsDate;
  paramsDate = date.transform(paramsDate, "YYYY/M/D", "D-M-YYYY"); //Changing the format of date

  let receivedTimeZone = paramsTimeZone;

  const datesRef = db.collection("appointments").doc("Dates"); // getting reffeence of dates document
  const availableFreeSlots = [];
  const resArray = [];

  try {
    receivedDate = receivedDate.split("/"); // convert to array
    let now = date.format(new Date(), date.compile("YYYY/M/D")).split("/"); // get current date
    receivedDate = new Date(...receivedDate); // convert to date obj
    now = new Date(...now); // convert to date obj
    if (date.subtract(receivedDate, now).toDays() < 0) {
      // compare the date with current date
      res.status(400).send("Cannot book in older days than present day");
      return;
    }

    const collRef = datesRef.collection(paramsDate);
    console.log("Wait while api is trying to get documents from db");
    const availableSlots = await collRef.get();
    console.log("Wait is over!!");
    if (availableSlots.size === 0) {
      // if date is not available in db
      //create a collection with the given date

      const newCollection = collRef;
      for (let i = 1, time = 10; i <= 16; i++, time += 0.5) {
        const slotTime = i % 2 === 1 ? time + ":00" : time - 0.5 + ":30";
        const data = {
          //set data
          date: paramsDate,
          name: `Slot${i}`,
          actualTime: slotTime,
          status: "free",
          time: time,
        };
        console.log("Wait while api is trying to get documents from db");
        const newSlot = await newCollection.doc(`Slot${i}`).set(data); // Create new slots
        console.log("wait is Over!!");
        //availableFreeSlots.push(data);
        resArray.push(`${paramsDate} T${slotTime} GMT:${paramsTimeZone}`);
      }

      res.send(resArray.sort());
      //res.send(availableFreeSlots); //Respond with newly created free slots
      return;
    }

    const pattern = date.compile("H:mm"); // pattern for time
    let currentTime = date.format(new Date(), pattern).split(":"); //Make an array
    currentTime[1] = currentTime[1] / 60;

    currentTime = Number(currentTime[0]) + Number(currentTime[1]);
    // if date is already available in db then filter slots which have free status using 'where'
    currentTime = Number(currentTime);

    if (date.subtract(receivedDate, now).toDays() === 0) {
      // if same day
      console.log("Wait while api is trying to get documents from db");
      var data = await collRef
        .where("status", "==", "free")
        .where("time", ">=", currentTime)
        .get();
      console.log("Wait is Over!!");
    } else {
      console.log("Wait while api is trying to get documents from db");
      var data = await collRef.where("status", "==", "free").get();
      console.log("Wait is Over!!");
    }

    //get data from snapshot
    data.forEach((doc) => {
      availableFreeSlots.push({
        id: doc.id,
        actualTime: doc.data().actualTime,
        data: doc.data(),
      });
    });

    // need to convert to speicific timezone
    receivedTimeZone = receivedTimeZone.split(":");
    receivedTimeZone[2] = receivedTimeZone[2] / 60;
    let sign = receivedTimeZone[0];
    receivedTimeZone =
      Number(receivedTimeZone[1]) + Number(receivedTimeZone[2]);
    if (sign === "-") {
      receivedTimeZone *= -1;
    }

    //convert appointment times to viewers timezone

    const nowDate = date.format(new Date(), "D-M-YYYY");

    for (const slot of availableFreeSlots) {
      //let actualSlotTime = slot.actualTime; // get time from data in db
      let actualSlotTime = `${nowDate} ${slot.actualTime} +0530`;

      let slotTime = date.parse(actualSlotTime, "D-M-YYYY H:mm Z"); // parse it into a date obj

      //calculating new times for slots according to timezone given by taking UTC as reference
      let utc = slotTime.getTime() + slotTime.getTimezoneOffset() * 60000;
      slotTime = new Date(utc + 3600000 * receivedTimeZone);
      slotTime = slotTime.toLocaleString();

      slotTime = date.format(new Date(slotTime), "[T]H:mm");

      resArray.push(`${paramsDate} ${slotTime} GMT:${paramsTimeZone}`);
    }

    //res.send(availableFreeSlots); // respond with free slots
    res.send(resArray.sort());
  } catch (error) {
    res.status(400).send(error);
  }
});

// for event 2
app.patch("/api/v1/event", async (req, res) => {
  const paramsDate = req.body.date;
  const paramsDuration = req.body.duration;
  if (!paramsDate || !paramsDuration) {
    res.status(400).send(`Bad request change parameters, format: {
        "date": D-M-YYYY H:mm(eg: 22/11/2020 10:30),
        "duration": number in minutes(integer)}(eg: 40)
    }`);
    return;
  }

  const receivedDate = date.transform(paramsDate, "D-M-YYYY H:mm", "D-M-YYYY");
  const receivedTime = date.transform(paramsDate, "D-M-YYYY H:mm", "H:mm");
  let receivedDuration = parseInt(paramsDuration);

  let responseArray = [];
  try {
    const collReff = db
      .collection("appointments")
      .doc("Dates")
      .collection(receivedDate); //Collection reference of the provided date
    let slotTime = receivedTime;

    let iterator;

    if (
      Number(slotTime.split(":")[0]) < 10 ||
      Number(slotTime.split(":")[0] > 17)
    ) {
      res.status(422).send("Not within the time range");
      return;
    }
    if (slotTime.split(":")[1] === "00") {
      iterator = 0;
    } else {
      iterator = 1;
    }

    let slotNameArray = [];
    let cannotBook = false;

    while (receivedDuration > 0) {
      //iterarte until duration < 0
      console.log("Wait while api is trying to get documents from db");

      const dbData = await collReff.where("actualTime", "==", slotTime).get();
      console.log("Wait is Over");
      let slotName = "";

      dbData.forEach((doc) => {
        slotName = doc.id;
        slotNameArray.push(slotName);
        if (doc.data().status === "booked") {
          for (let i = 0; i < slotNameArray.length - 1; i++) {
            const response = collReff
              .doc(slotNameArray[i])
              .update({ status: "free" });
          }
          res

            .status(422)
            .send(
              `Someone already booked ${
                slotNameArray[slotNameArray.length - 1]
              } at ${slotTime}`
            );
          cannotBook = true;
          return;
        }
      });
      if (cannotBook) {
        return;
      }

      const response = collReff.doc(slotName).update({ status: "booked" });
      responseArray.push(`Booked ${slotName} at ${slotTime}`);

      receivedDuration = receivedDuration - 30;

      iterator++;
      if (iterator % 2 === 1) {
        slotTime = `${slotTime.split(":")[0]}:30`;
      } else {
        slotTime = `${Number(slotTime.split(":")[0]) + 1}:00`;
      }
    }

    res.send(responseArray);
  } catch (error) {
    res.status(400).send(error);
  }
});

// for event 3
app.get("/api/v1/event/:startDate/:endDate", async (req, res) => {
  try {
    let paramsStartDate = req.params.startDate;

    let paramsEndDate = req.params.endDate;

    if (!paramsStartDate || !paramsEndDate) {
      res.status(400).send(`Bad request change parameters, format: {
        "startDate": YYYY/M/D(eg: 2020/11/22),
        "endDate": YYYY/M/D(eg: 2020/11/23)
      }`);
    }

    paramsStartDate = date.format(new Date(req.params.startDate), "YYYY/M/D");
    paramsEndDate = date.format(new Date(req.params.endDate), "YYYY/M/D");

    let receivedStartDate = paramsStartDate.split("/");
    let receivedEndDate = paramsEndDate.split("/");
    receivedStartDate = new Date(...receivedStartDate);
    receivedEndDate = new Date(...receivedEndDate);

    let numberOfDays =
      date.subtract(receivedEndDate, receivedStartDate).toDays() + 1; //get the number of days b/w the dates

    let currDate = date.transform(paramsStartDate, "YYYY/M/D", "D-M-YYYY");

    let responseArray = [];

    const dateDocRef = db.collection("appointments").doc("Dates");
    for (let i = 0; i < numberOfDays; i++) {
      console.log("Wait while api is trying to get documents from db");
      const data = await dateDocRef
        .collection(currDate)
        .where("status", "==", "booked")
        .get();
      console.log("Wait is Over!!");
      data.forEach((doc) => {
        responseArray.push(
          `${doc.id} on ${currDate} is booked at ${doc.data().actualTime}`
        );
      });
      //add 1 to increment the date
      currDate = date.addDays(
        new Date(date.parse(currDate + " +0000", "D-M-YYYY Z")),
        1
      );

      currDate = date.format(new Date(currDate), "D-M-YYYY");
    }
    res.send(responseArray);
  } catch (error) {
    res.status(404).send(error);
  }
});
app.listen(8080, () => console.log("Listening"));

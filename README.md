# AppointmentScheduler

Open Client and Server Folders seperately in different windows of VS Code or any other editor or IDE

# Window 1
cd client
npm install
npm start

# Window 2
cd server
npm install 
npm start

Go to http://localhost:3000 for Event 1(To see available Slots and Book Free Slots).
Go to http://localhost:3000/events for Event 2(To get events from a selected range of dates).

If you want to test using postman, use the following input format
# Event 1:(PUT)
{
      "date": "YYYY/M/D"(eg: "2020/11/26"),
        "timeZone": "+/-:HH:mm"(eg: "+:05:30"
    }

# Event2:(PATCH)
{
"date": "D-M-YYYY H:mm"(eg: 22/11/2020 10:30),
"duration": number in minutes(integer)}(eg: 40)
}
# Event3(GET):
pass in url inthe format "Fri Nov 27 2020 23:59:59 GMT+0530 (India Standard Time)"

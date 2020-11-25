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
# Event 1:(PUT) - URL: https://hostingassignment.herokuapp.com/api/v1/event/ (To see available free slots OR to create new slots if it's a new date)
{
      "date": "YYYY/M/D",
      "timeZone": "+/-:HH:mm"
}
eg:
{
      "date": "2020/11/26",
      "timeZone": "+:05:30"
}
# Event2:(PATCH) - URL: https://hostingassignment.herokuapp.com/api/v1/event/ (To book a slot)
{
      "date": "YYYY/M/D H:mm",
      "duration": number in minutes(integer)
}
eg: 
{
      "date": "2020/11/26 10:30",
      "duration": 40
}
# Event3(GET):(To get events between range of dates) 
Format, URL: https://hostingassignment.herokuapp.com/api/v1/event/YYYY-M-D/YYYY-M-D
eg: https://hostingassignment.herokuapp.com/api/v1/event/2020-11-26/2020-11-27


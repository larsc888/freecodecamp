// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/:date?", function (req, res) {
  let timestamp = req.params['date'];

  // If API Empty
  if (req.params['date'] === undefined) {
    let date = new Date();
    res.json({unix: date.getTime(), utc: date.toUTCString()}); 
  }
  
  // Convert unix timestamp into argument Date can accept  ("Thu, 01 Jan 1970 00:00:00 GMT")
  if (/^[0-9]{13}$/.test(`${timestamp}`)) {
    let date = new Date(Number(timestamp));
    res.json({unix: date.getTime(), utc: date.toUTCString() }); 
  }
  
  // Check if timestamp is valid
  timestamp = Date.parse(timestamp);
  if (isNaN(timestamp) == false) {
    let date = new Date(req.params['date']);
    res.json({unix: date.getTime(), utc: date.toUTCString()});    
  }
  else {
    res.json({ error : "Invalid Date" });
  }
});





// listen for requests :)
// var listener = app.listen(process.env.PORT, function () {
//   console.log('Your app is listening on port ' + listener.address().port);
//});

var listener = app.listen(8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();

// Logger middleware
app.use(function (req, res, next) {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Sets Public Folders
app.use("/public", express.static(__dirname + '/public'));

// Sets POST parsing 
app.use(bodyParser.urlencoded({extended: false}));

// Start Express
app.get('/', function(req, res) {
    // res.send('Hello Express');
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get("/json", function(req, res) {
    let response = "Hello json";
    if (process.env['MESSAGE_STYLE'] === "uppercase") {
        response.toUpperCase();
    }
    res.json({"message": response});
})

app.get('/now', function(req, res, next) {
    req.time = new Date().toString();
    next();
}, function(req, res) {
    res.json({"time": req.time});
});

app.get('/:word/echo', function(req, res) {
    res.json({"echo": req.params['word']});
});

app.get('/name', function(req, res) {
    res.json({ "name": `${req.query['first']} ${req.query['last']}` });
});
app.post('/name', function(req, res) {
    res.json({ "name": `${req.body['first']} ${req.body['last']}` });
});




































 module.exports = app;

require('dotenv').config();
const cors = require('cors');

// Setup Express
const express = require('express');
const app = express();

// Setup Bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

// Setup Mongo
const mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URL'], { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Shorturl API
const shortURLSchema = new mongoose.Schema({
  fullURL: { type: String, required: true },
  shortURL: Number
});

const ShortURL = mongoose.model('ShortURL', shortURLSchema);

const createAndSaveURL = (done) => {
  let document = Person({ name: "Rob Goodman", age: 20, favoriteFoods: [ "Hamburger", "Chicken"] });
  document.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};

app.post('/api/shorturl/', function(req, res) {
  res.json({ greeting: `hello post Shorturl: ${req.body["url"]}`});
});

app.get('/api/shorturl/:number?', function(req, res) {
  res.json({ greeting: `hello get Shorturl ${req.params['number']}` });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

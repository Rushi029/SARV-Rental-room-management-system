// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const Room = require('./Room');
const owner = require('./mongodb');

// Initialize Express app
const app = express();

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up view engine and views directory
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection URLs for login and room databases
const loginDBUrl = 'mongodb://localhost:27017/loginDatabase';
const roomDBUrl = 'mongodb://localhost:27017/roomDatabase';

// Connect to MongoDB databases
mongoose.connect(loginDBUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to login database');

    // Once connected to login database, connect to room database
    return mongoose.createConnection(roomDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  })
  .then((roomDBConnection) => {
    console.log('Connected to room database');

    // Set up Room model using room database connection
    const RoomSchema = new mongoose.Schema({
      location: String,
      price: Number,
      description: String,
      imageUrl: String,
    });
    const RoomModel = roomDBConnection.model('Room', RoomSchema);

    // Define routes

    // Route handler for the root path
    app.get('/', (req, res) => {
      res.render('login');
    });

    // Route handler for signup page
    app.get('/signup', (req, res) => {
      res.render('signup');
    });

    // Route handler for signup form submission
    app.post('/signup', async (req, res) => {
      const data = {
        username: req.body.username,
        password: req.body.password,
      };
      await owner.insertMany([data]);
      res.render('home');
    });

    // Route handler for login form submission
    app.post('/login', async (req, res) => {
      try {
        const check = await owner.findOne({ username: req.body.username });
        if (check.password == req.body.password) {
          res.render('home');
        } else {
          res.send('Wrong Password');
        }
      } catch {
        res.send('Wrong Details');
      }
    });

    // Route handler for signup form submission in owner dashboard
    app.post('/owner/signup', async (req, res) => {
      const data = {
        username: req.body.username,
        password: req.body.password,
      };

      await owner.insertMany([data]);

      // Transfer data to Room database
      try {
        const roomsData = await Room.find({});
        await owner.insertMany(roomsData.map(room => ({ username: req.body.username, ...room.toObject() })));
      } catch (error) {
        console.error('Error transferring data to Room database:', error);
      }

      res.render('home');
    });

    // Start the server
    const PORT = process.env.PORT || 30;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


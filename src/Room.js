const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  imageUrl: { // Define imageUrl field for storing room images
    type: String,
    default: '' // Default value is an empty string
  }
});

const Room = mongoose.model("Room", roomSchema); // Update model name to singular "Room"

module.exports = Room;

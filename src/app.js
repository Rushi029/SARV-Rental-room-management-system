const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer'); // Import multer for handling file uploads
const path = require("path");
const hbs = require("hbs");
const Room = require("./Room");
const router = express.Router();

const app = express();
const templatePath = path.join(__dirname, '../tempelates');

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads')); // Destination folder for storing uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with original extension
    }
});

const upload = multer({ storage: storage });
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/roomDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

app.get("/", async (req, res) => {
    try {
        // Fetch all rooms from the database
        const rooms = await Room.find({});
        const totalRooms = rooms.length; //get count of total rooms
        res.render("home", { rooms, totalRooms });
    } catch (err) {
        console.error("Error rendering home:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route for handling room uploads
app.post("/home", upload.single('image'), async (req, res) => {
    try {
        const {title, description, price,location } = req.body;
        const imageUrl = req.file ? '/uploads/' + req.file.filename : ''; // Save image URL if uploaded
        const room = new Room({ title, description, price, location, imageUrl });
        await room.save();
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/", async (req, res) => {
    try {
        // Fetch all rooms from Room database
        const rooms = await Room.find({});
        res.render("home", { rooms });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/home", async (req, res) => {
    try {
        const { title, description, price, location } = req.body;
        const room = new Room({ title, description, price, location });
        await room.save();
        res.redirect("/");
    } catch (error) {
        console.error("Error uploading room:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
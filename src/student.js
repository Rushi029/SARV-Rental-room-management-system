const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); 
const path = require('path');

const app = express();
const templatePath = path.join(__dirname, '../tempelates'); 

app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect('mongodb://localhost:27017/roomDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

const roomSchema = new mongoose.Schema({
    location: String,
    price: Number,
    description: String,
    imageUrl: String,
});

const Room = mongoose.model('Room', roomSchema);

app.get('/', (req, res) => {
    res.render('s_dash');
});

app.get('/search', async (req, res) => {
    try {
        const { location } = req.query;
        const query = {
            location: { $regex: location, $options: 'i' },
        };
        const rooms = await Room.find(query);
        res.render('s_dash', { rooms, searchedText: location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/view-all-rooms-button', async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.render('s_dash', { rooms });
    } catch (error) {
        console.error('Error fetching all rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
app.post('/home', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, location } = req.body;
        const imageUrl = req.file ? '/uploads/' + req.file.filename : '';
        const room = new Room({ title, description, price, location, imageUrl });
        await room.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

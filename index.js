const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Workouts = require('./models/workouts');
const methodOverride = require('method-override');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'workoutTracker',
        format: 'jpg', // force to JPG (optional)
        transformation: [
            {
                width: 400,
                height: 300,
                crop: "fill",
                gravity: "auto",
                quality: "auto",
                fetch_format: "auto"
            }
        ]
    }
});

const upload = multer({ storage });


const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');  // for unique IDs

app.use(cookieParser());

// Middleware to assign a userId if not exists
app.use((req, res, next) => {
    if (!req.cookies.userId) {
        const newId = uuid();
        res.cookie('userId', newId, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
        // console.log("New user assigned:", newId);   // ✅ this works
    } else {
        // console.log("Returning user:", req.cookies.userId);
    }
    next();
});

const days = ['Push', 'Pull', 'Legs'];

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MONGO CONNECTION OPEN");
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR");
        console.log(err);
    }
    )


app.listen(3000, () => {
    console.log("APP IS LISTENING ON PRT 3000!");
})

app.get('/', (req, res) => {
    res.redirect('/workouts');
});

app.get('/workouts', async (req, res) => {
    res.render("workouts/index", { days });
})

app.get('/workouts/new', (req, res) => {
    res.render('workouts/new', { days });
});

app.post('/workouts', upload.single('image'), async (req, res) => {
    const { name, day, subDay, weight, reps } = req.body;

    // Cloudinary gives you a secure URL
    const imagePath = req.file.path;  // Cloudinary URL

    const newWorkout = new Workouts({
        name,
        day,
        subDay,
        image: imagePath,   // store the Cloudinary URL
        weight,
        reps,
        userId: req.cookies.userId
    });

    await newWorkout.save();
    res.redirect(`/workouts/days/${day}`);
});

app.get('/workouts/days/:day', async (req, res) => {
    const { day } = req.params;
    const { subDay } = req.query;

    let filter = { day, userId: req.cookies.userId };
    if (subDay) filter.subDay = subDay; // ✅ only show workouts for chosen subDay

    const workouts = await Workouts.find(filter);

    const subDays = await Workouts.distinct("subDay", { day, userId: req.cookies.userId });

    es.render("workouts/days", { workouts, day, subDays, currentSubDay: subDay });
})

app.get('/workouts/:id/show', async (req, res) => {
    const { id } = req.params;
    const workout = await Workouts.findById(id);
    res.render("workouts/show", { workout });
})

app.put('/workouts/:id', async (req, res) => {
    const { id } = req.params;
    const workout = await Workouts.findByIdAndUpdate(
        id,
        { weight: req.body.weight, reps: req.body.reps, subDay: req.body.subDay},
        { runValidators: true, new: true }
    );
    res.redirect(`/workouts/days/${workout.day}`);
});

app.delete('/workouts/:id', async (req, res) => {
    const { id } = req.params;
    const workout = await Workouts.findByIdAndDelete(id);
    res.redirect(`/workouts/days/${workout.day}`);
});





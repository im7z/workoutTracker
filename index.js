const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Workouts = require('./models/workouts');
const methodOverride = require('method-override');
const multer = require('multer');


// Set storage location for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/uploads'));   // save inside /public/uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // unique filename
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
    const { name, day, weight, reps } = req.body;

    // Save image path (relative to /public)
    const imagePath = '/uploads/' + req.file.filename;

    const newWorkout = new Workouts({
        name,
        day,
        image: imagePath,  // store local path
        weight,
        reps,
        userId: req.cookies.userId 
    });

    await newWorkout.save();
    res.redirect(`/workouts/days/${day}`);
});

app.get('/workouts/days/:day', async (req, res) => {
    const { day } = req.params;
    const workouts = await Workouts.find({ day, userId: req.cookies.userId  });
    res.render("workouts/days", { workouts, day });
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
        { weight: req.body.weight, reps: req.body.reps },
        { runValidators: true, new: true }
    );
    res.redirect(`/workouts/days/${workout.day}`);
});

app.delete('/workouts/:id', async (req, res) => {
    const { id } = req.params;
    const workout = await Workouts.findByIdAndDelete(id);
    res.redirect(`/workouts/days/${workout.day}`);
});





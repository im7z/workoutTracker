const mongoose = require('mongoose');              // Import mongoose
const Workouts = require('./models/workouts');      // Import Workouts model

// Connect to MongoDB (farmStand database)
mongoose.connect('mongodb://localhost:27017/workoutsTracker')
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");       // Success message
  })
  .catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");// Error message
    console.log(err);                               // Show error details
  });

const seedWorkouts = [
  {
    name: 'Bench Press',
    day: 'Push',
    image: '/images/bench-press-800.jpg',
    weight: 0,
    reps: 0
  },
  {
    name: 'Machine Chest Fly',
    day: 'Push',
    image: '/images/machine-chest-fly-800.jpg',
    weight: 0,
    reps: 0
  },
  {
    name: 'Standing Cable Fly',
    day: 'Push',
    image: '/images/Cable-Standing-Fly_Chest.png',
    weight: 0,
    reps: 0
  }
];

Workouts.insertMany(seedWorkouts)
  .then(res => {
    console.log("Seed workouts inserted!");
    console.log(res);
  })
  .catch(err => {
    console.log("Error in seeding!");
    console.log(err);
  });
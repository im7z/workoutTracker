const mongoose = require("mongoose");

const workoutsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: ['Push', 'Pull', 'Legs']
    },                 // "Push", "Pull", "Legs"
    image: {
        type: String,
        required: true
    },             // store image URL (path or link)
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    reps: {
        type: Number,
        required: true,
        min: 0
    },
    userId: {
         type: String
    },
    username: {
         type: String
    },
    subDay: {
        type: Number,
        default: 1
    }
});


const Workouts = mongoose.model('Workouts', workoutsSchema);

module.exports = Workouts;
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [ true, "Username is already taken" ],
        required: [ true, "Username is required" ],
        trim: true,
        lowercase: true,
        index: true
    },

    email: {
        type: String,
        unique: [ true, "Account already exists with this email address" ],
        required: [ true, "Email is required" ],
        trim: true,
        lowercase: true,
        index: true
    },

    password: {
        type: String,
        required: [ true, "Password is required" ]
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel
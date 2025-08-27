const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema ({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    savedGames: [
        {
            name: String,
            background_image: String,
            released: String,
            description: String,
            metacritic: String,
            rating: String,
            slug: String,
            id: String
        }
    ],
    completed: [
        {
            name: String,
            background_image: String,
            released: String,
            description: String,
            metacritic: String,
            rating: String,
            slug: String,
            id: String
        }
    ],
    currentlyPlaying: [
        {
            name: String,
            background_image: String,
            released: String,
            description: String,
            metacritic: String,
            rating: String,
            slug: String,
            id: String
        }
    ],
    wantToPlay: [
        {
            name: String,
            background_image: String,
            released: String,
            description: String,
            metacritic: String,
            rating: String,
            slug: String,
            id: String
        }
    ]
})

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

module.exports = mongoose.model('User', UserSchema)
const mongoose = require('mongoose')

DBURL = process.env.DBURL
const connectDB = async () => {
    try {
        await mongoose.connect(DBURL, {
            
        })
        console.log('Connected to Database')
    } catch (err) {
        console.log('Error, Database Not Connected')
    }
}

module.exports = connectDB
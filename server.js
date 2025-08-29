require('dotenv').config()
const NodeCache = require('node-cache')
const express = require('express')
const connectDB = require('./public/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('./public/user')

const gameCache = new NodeCache({stdTTL: 3600})  //time to live set to one hour
const app = express()
app.use(express.json())
const port = process.env.PORT
//Provide API Key below
const api_key = process.env.API_KEY
const jwtSecret = process.env.JWT

const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2,'0')
const day = String(today.getDate()).padStart(2,'0')
const todaysDate = `${year}-${month}-${day}`
const endOfYear = `${year}-12-31`

const API_LINK = 'https://api.rawg.io/api'

connectDB()

async function fetchAndCache(key, url) {
    const cached = gameCache.get(key)
    if(cached) {
        console.log(`Cache hit: ${key}, fetching from Cache`)
        return cached
    }
    console.log(`Cache miss: ${key}, fetching ${url}, set into Cache`)
    const res = await fetch(url)
    const data = await res.json()

    const gameDescriptions = await Promise.all(data.results.map(async(game) => {
        const desRes = await fetch(`${API_LINK}/games/${game.id}?key=${api_key}`)
        const desData = await desRes.json()
        return {...game, description: desData.description || 'No Description Available'}
    }))
    gameCache.set(key, {...data, results: gameDescriptions})
    return {...data, results: gameDescriptions}
}

app.get('/upcoming', async(req, res) => {
    const page = req.query.page
    const cacheKey = `upcoming_games_page_${page}`
    const url = `${API_LINK}/games?key=${api_key}&ordering=released&dates=${todaysDate},${endOfYear}&page=${page}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

app.get('/top_rated_games', async(req,res) => {
    const page = req.query.page
    const cacheKey = `top_rated_games_page${page}`
    const url = `${API_LINK}/games?key=${api_key}&ordering=-metacritic&page=${page}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

app.get('/random', async(req, res) => {
    const page = req.query.page
    const cacheKey = `random_games_page${page}`
    const url = `${API_LINK}/games?key=${api_key}&page=${page}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

app.get('/genres', async(req,res) => {
    const cacheKey = `genrelist`
    const url = `${API_LINK}/genres?key=${api_key}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

app.get('/games_by_genre', async(req, res) => {
    const page = req.query.page
    const genreId = req.query.genre
    const cacheKey = `genre_${genreId}_page_${page}`
    const url = `${API_LINK}/games?genres=${genreId}&key=${api_key}&page=${page}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

app.get('/search', async(req,res) => {
    const page = req.query.page
    const searchTerm = req.query.search
    cacheKey = `searching_game_${searchTerm}_page${page}`
    const url = `${API_LINK}/games?key=${api_key}&search=${encodeURIComponent(searchTerm)}&page=${page}`
    const data = await fetchAndCache(cacheKey, url)
    res.json(data)
})

//Create Account
app.post('/register', async(req, res) => {
    try {
        console.log('Incoming body:', req.body)
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({error: '*All fields are required'})
        }

        const userExists = await User.findOne({ username })
        if(userExists) {
            return res.status(400).json({error: '*Username already exists'})
        }

        const newUser = await User.create({ username, email, password })
        res.json({ success: true, user_id: newUser._id })
    } catch(err) {
        res.status(500).json({ message: '*Registeration Error' })
    }
})

//Login the User
app.post('/login', async(req, res) => {
    try {
        console.log('Incoming Body:', req.body)
        const { username, password } = req.body

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ error:'*Invalid Username'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ user_id: user._id, username: user.username }, jwtSecret, { expiresIn: '1h' })
            res.json({message: 'Login Successful', token})
        } else {
            return res.status(401).json({error: '*Invalid Password'})
        }
    } catch(err) {
        res.status(500).json({ error:'Login Error' })
    }
})

app.post('/logout', async(req, res) => {
    res.status(200).json({message:'Logged Out Successfully'})
    console.log('Logged Out Successfully')
})

app.post('/deletedGame', async(req,res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const { name, background_image, metacritic, rating, description, released, slug, id, isCompletedTrue, isCurrentlyPlayingTrue, isWantToPlayTrue } = req.body
    
    if (!token) {
        return res.status(401).json({ error: 'No Token Provided' })
    }
    try {
        const checkToken = jwt.verify(token, jwtSecret)
        const user = await User.findById(checkToken.user_id)

        if (isCompletedTrue === true) {
            user.completed.pull({ name, background_image, metacritic, rating, description, released, slug, id, isCompletedTrue })
            await user.save()
        }

        if (isCurrentlyPlayingTrue === true) {
            user.currentlyPlaying.pull({ name, background_image, metacritic, rating, description, released, slug, id, isCurrentlyPlayingTrue })
            await user.save()
        }

        if(isWantToPlayTrue === true) {
            user.wantToPlay.pull({ name, background_image, metacritic, rating, description, released, slug, id,isWantToPlayTrue })
            await user.save()
        }
            
        await user.save()
        res.json({message: 'Game Deleted Successfully'})
        console.log('Game Deleted Successfully')
    } catch (err) {
        console.error('JWT Verification Error:', err.message)
        res.status(401).json({error:"Error, Account Session Error"})
    }
})

app.post('/completed', async(req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const { name, background_image, metacritic, rating, description, released, slug, id } = req.body
    if (!token) {
        return res.status(401).json({error: 'No Token Provided'})
    }
    try {
        const checkToken = jwt.verify(token, jwtSecret)
        const user = await User.findById(checkToken.user_id)

        user.completed.push({name, background_image, metacritic, rating, description, released, slug, id})
        await user.save()

        res.json({message: 'Game Saved Successfully to Completed List'})
    } catch(err) {
        console.error('JWT Verification Error:', err.message)
        res.status(401).json({error: 'Error, Account Session Error'})
    }
})

app.post('/wantToPlay', async(req,res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const { name, background_image, metacritic, rating, description, released, slug, id } = req.body
    if(!token) {
        return res.status(401).json({error: 'No Token Provided'})
    }
    try {
        const checkToken = jwt.verify(token, jwtSecret)
        const user = await User.findById(checkToken.user_id)

        user.wantToPlay.push({name, background_image, metacritic, rating, description, released, slug, id})
        await user.save()

        res.json({message: 'Game Saved Successfully to Want to Play List'})
    } catch (err) {
        console.error('JWT Verification Error:', err.message)
        res.status(401).json({error: 'Error, Account Session Error'})
    }
})

app.post('/currentlyPlaying', async(req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const { name, background_image, metacritic, rating, description, released, slug, id } = req.body
    if(!token) {
        return res.status(401).json({error: 'No Token Provided'})
    }
    try {
        const checkToken = jwt.verify(token, jwtSecret)
        const user = await User.findById(checkToken.user_id)

        user.currentlyPlaying.push({name, background_image, metacritic, rating, description, released, slug, id})
        await user.save()

        res.json({message: 'Game Saved Successfully to Currently Playing List'})
    } catch (err) {
        console.error('JWT Verification Error:', err.message)
        res.status(401).json({error: 'Error, Account Session Error'})
    }
})

app.post('/completedList', async(req, res) => {
    const page = req.query.page
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token) {
        return res.status(401).json({error: 'No Token Provided'})
    }
    try {
        const checkToken = jwt.verify(token, jwtSecret)
        const user = await User.findById(checkToken.user_id)

        res.json({completed: user.completed})
    } catch(err) {
        console.log('JWT Verification Error:', err.message)
    }
})

app.use(express.static('public'))
app.listen(port, () => console.log(`Server is running on Port ${port}`))
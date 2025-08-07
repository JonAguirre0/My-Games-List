require('dotenv').config()
const NodeCache = require('node-cache')
const express = require('express')

const gameCache = new NodeCache({stdTTL: 3600})  //time to live set to one hour
const app = express()
const port = process.env.PORT
const api_key = process.env.API_KEY

const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2,'0')
const day = String(today.getDate()).padStart(2,'0')
const todaysDate = `${year}-${month}-${day}`
const endOfYear = `${year}-12-31`

const API_LINK = 'https://api.rawg.io/api'

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

app.use(express.static('public'))
app.listen(port, () => console.log(`Server is running on Port ${port}`))
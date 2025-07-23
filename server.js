require('dotenv').config()
const NodeCache = require('node-cache')
const express = require('express')

const gameCache = new NodeCache({stdTTL: 3600})  //time to live set to one hour
const app = express()
const PORT = 5501
const api_key = process.env.API_KEY

app.get('/api/games', async (req, res) => {
    const {genre, page = 1} = req.query
    const cacheKey = `genre_${genre}_page_${page}`

    if (gameCache.has(cacheKey)) {
        console.log("returning from cache", cacheKey)
        return res.json(gameCache.get(cacheKey))
    }

    const url = `https://api.rawg.io/api/games?genres=${genre}&key=${api_key}&page=${page}`
    const response = await fetch(url)
    const data = await response.json()

    gameCache.set(cacheKey, data.results)
    res.json(data.results)
    console.log("returning data from API and cached", cacheKey)
})

app.use(express.static('public'))
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
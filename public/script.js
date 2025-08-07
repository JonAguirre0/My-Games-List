const menu = document.querySelector('.menu')
const offScreenMenu = document.querySelector('.off-screen-menu')
const accountMenu = document.querySelector('.user')
const accountIcon = document.getElementById('user')
const accountXIcon = document.getElementById('x')
const offScreenSideMenu = document.querySelector('.off-screen-side-menu')
const signin = document.querySelector('.signin')
const createAccount = document.querySelector('.create-account')
const logo = document.querySelector('.logoImg')
const topRated = document.querySelector('.toprated')
const random = document.querySelector('.random')
const darkToggle = document.querySelector('.dark-toggle')
const toggleImg = document.querySelector('.toggleImg')
const prev = document.querySelector('.prev')
const counter = document.querySelector('.counter')
const next = document.querySelector('.next')
const main = document.getElementById('main')
const main2 = document.getElementById('main2')
const form = document.querySelector('.form')
const search = document.querySelector('.search')
const closeEl = document.getElementById('x')
const title = document.getElementById('title')
const genre = document.querySelector('.genre')
const gameGenre = document.querySelector('.gameG')

const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2,'0')
const day = String(today.getDate()).padStart(2,'0')
const todaysDate = `${year}-${month}-${day}`
const endOfYear = `${year}-12-31`

counter.innerHTML = 1
let page = 1
let isTopRated = false
let isSearchTerm = false
let isGenre = false
let isUpcoming = true
let isRandom = false
let currentGenreId = null
let currentGenreName = null
let genreName = ''
let currentType = 'upcoming'
let currentParams = {}

const API = 'http://localhost:5501'

//The loading Screen
window.onload = function loading() {
    setTimeout(function() {
        document.getElementById('loader').style.display = "none"
        document.getElementById('background').style.display = "block"
    }, 999)
}

//Get initial games
fetchAndDisplay('upcoming', page)

async function fetchAndDisplay(type = 'upcoming', page = 1, extraParams = {}) {
    main.innerHTML = ''
    const params = new URLSearchParams({page, ...extraParams})
    const res = await fetch(`/${type}?${params.toString()}`)
    const data = await res.json()

    if(type === 'genres') {
        showGenres(data.results)
    } else {
        showGames(data.results)
    }

    document.getElementById('next').disabled = !data.next
    document.getElementById('prev').disabled = !data.previous
    console.log("Fetched from backend", data.results)
}

//Displays the Genres and gets the id and name of clicked genre
function showGenres(genres) {
    genres.forEach((genre) => {
        const { id, name } = genre

        const genreEl = document.createElement('div')
        genreEl.classList.add('genre')
        genreEl.innerHTML = `
            <div class="genre-info">
                <h3>${name}</h3>
            </div> 
        `

        genreEl.addEventListener('click', () => {
            document.getElementById('loader').style.display = "block"
            isGenre = true
            currentGenreName = name
            currentType = 'games_by_genre'
            currentParams = {genre: id}
            fetchAndDisplay(currentType, page, currentParams).then(() => {
                document.getElementById('loader').style.display = 'none'
                document.getElementById('background').style.display = 'block'
            })
            title.innerHTML = `Browsing by ${name} games`
            document.getElementById("prev").style.display = 'block'
            document.getElementById("counter").style.display = 'block'
            document.getElementById("next").style.display = 'block'
        })

        main.appendChild(genreEl)
    })
}

function showGames(games) {
    games.forEach((game) => {
        const {name, background_image, metacritic, rating, description, released} = game

        const gameEl = document.createElement('div')
        gameEl.classList.add('game')
        gameEl.innerHTML = `
            <img src="${background_image ? background_image: 'https://media.istockphoto.com/id/1472933890/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg?s=612x612&w=0&k=20&c=Rdn-lecwAj8ciQEccm0Ep2RX50FCuUJOaEM8qQjiLL0='}" alt="${title}"}>
            <div class="game-info">
                <h3>${name}</h3>
                <span id="UR">User Rating: <span id="R" class="${getClassByRate(rating)}">${rating}/5</span></span>
                <span id="line"></span>
                <span id="MR">Metacritic Rating: <span id="M" class="${getClassByMetacritic(metacritic)}">${metacritic ? metacritic :''}</span></span>
                <span id="line"></span>
                <span id="D">Date: <span class="date">${released}</span></span>
                <span id="line"></span>
            </div>
            <div class="overview">
                <h3>Description</h3>
                ${description} ${released}    
            </div>
        `
        main.appendChild(gameEl)
    })
}

function getClassByRate(rate){
    if(rate >= 4) {
        return 'green'
    } else if(rate >= 3) {
        return 'orange'
    } else {
        return 'red'
    }
}

function getClassByMetacritic(rate){
    if(rate >= 80) {
        return 'green'
    } else if(rate >= 50) {
        return 'orange'
    } else {
        return 'red'
    }
}


logo.addEventListener('click', () => {
    window.scrollTo(0,0)
    window.location.reload()
    search.value = ''
})

menu.addEventListener('click', () => {
    menu.classList.toggle('active')
    offScreenMenu.classList.toggle('active')
})

darkToggle.addEventListener('click', () => {
    if(toggleImg.src === 'https://cdn-icons-png.freepik.com/512/6714/6714978.png') {
        // toggleImg.src = 'https://static.thenounproject.com/png/979909-200.png'
        toggleImg.src = './images/image3.png' 
        document.body.classList.toggle('dark-theme')
    } else {
        toggleImg.src = 'https://cdn-icons-png.freepik.com/512/6714/6714978.png'
        document.body.classList.toggle('dark-theme')
    }   
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const searchTerm = search.value
    isSearchTerm = true
    isTopRated = false
    isGenre = false
    isUpcoming = false
    isRandom = false
    page = 1
    counter.innerHTML = `${page}`

    if(searchTerm && searchTerm !== '') {
        title.innerHTML = `${searchTerm}`

        page = 1
        currentType = 'search'
        currentParams = {search: searchTerm}
        fetchAndDisplay(currentType, page, currentParams)
    } else {
        window.location.reload()
    }
})

accountMenu.addEventListener('click', () => {
    accountIcon.classList.toggle('active')
    accountXIcon.classList.toggle('active')
    offScreenSideMenu.classList.toggle('active')
})

topRated.addEventListener('click', () => {
    document.getElementById('loader').style.display = "block"

    page = 1
    isTopRated = true
    isSearchTerm = false
    isGenre = false
    isUpcoming = false
    isRandom = false
    title.innerHTML = "Top Rated Games"
    counter.innerHTML = `${page}`
    currentType = 'top_rated_games'
    fetchAndDisplay(currentType, page).then(() => {
        document.getElementById('loader').style.display = "none"
        document.getElementById('background').style.display = "block"
    }) 
})

random.addEventListener('click', () => {
    document.getElementById('loader').style.display = "block"

    isRandom = true
    isTopRated = false
    isSearchTerm = false
    isGenre = false
    isUpcoming = false

    getRandomGames()
    title.innerHTML = "Random Games"
    counter.innerHTML = `${page}`
    document.getElementById("prev").style.display = 'none'
    document.getElementById("counter").style.display = 'none'
    document.getElementById("next").style.display = 'none'
})
function getRandomGames() {
    const randomPage = Math.floor(Math.random() * 500) + 1
    isRandom = true
    isTopRated = false
    isSearchTerm = false
    isGenre = false
    isUpcoming = false
    currentType = 'random'
    fetchAndDisplay(currentType, randomPage).then (() => {
        document.getElementById('loader').style.display = "none"
        document.getElementById('background').style.display = "block"
    })
}

genre.addEventListener('click', () => {
    page = 1
    isGenre = true
    isTopRated = false
    isSearchTerm = false
    isUpcoming = false
    isRandom = false
    counter.innerHTML = `${page}`
    title.innerHTML = "Browse by Genre"
    
    currentType = 'genres'
    fetchAndDisplay(currentType, page)

    document.getElementById("prev").style.display = 'none'
    document.getElementById("counter").style.display = 'none'
    document.getElementById("next").style.display = 'none'
})

next.addEventListener('click', () => {
    document.getElementById('loader').style.display = "block"
    page++
    fetchAndDisplay(currentType, page, currentParams).then(() => {
        document.getElementById('loader').style.display = "none"
        document.getElementById('background').style.display = "block"
    })
    counter.innerHTML = `${page}`
    console.log("Next clicked")
})

function getNextPage() {
    if (isTopRated) {
        title.innerHTML = `Top Rated Games Page ${page}`
    } else if (isSearchTerm) {
        const searchTerm = search.value
        title.innerHTML = `${searchTerm}`
    } else if(isGenre) {
        title.innerHTML = `Browsing by ${currentGenreName} games`
    } else {
        title.innerHTML = `Upcoming Games Page ${page}`
    }
}

prev.addEventListener('click', () => {
    document.getElementById('loader').style.display = "block"
    page--
    getPrevPage()
    counter.innerHTML = `${page}`
    fetchAndDisplay(currentType, page, currentParams).then (() => {
        document.getElementById('loader').style.display = "none"
        document.getElementById('background').style.display = "block"
    })
    console.log("prev clicked")
})

function getPrevPage() {
    if (page < 1) page = 1
    if (isTopRated) {
        title.innerHTML = `Top Rated Games Page ${page}`
    } else if(isSearchTerm) {
        document.getElementById('loader').style.display = 'block'
        const searchTerm = search.value
        title.innerHTML = `${searchTerm}`
    } else if(isGenre) {
        title.innerHTML = `Browsing by ${currentGenreName} games`
    }
    else {
        title.innerHTML = `Upcoming Games for ${year}`
    }
}

function updatePrevNext(prevPage, nextPage) {
    if (page <= 1) {
      document.getElementById('prev').disabled = true
    } else {
        document.getElementById('prev').disabled = false
    }

    if (!nextPage === null) {
        document.getElementById('next').disabled = true
    } else {
        document.getElementById('next').disabled = false
    }
 
}
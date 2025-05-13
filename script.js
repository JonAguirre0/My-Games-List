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
const form = document.querySelector('.form')
const search = document.querySelector('.search')
const closeEl = document.getElementById('x')


logo.addEventListener('click', () => {
    window.scrollTo(0,0)
    window.location.reload()
})

darkToggle.addEventListener('click', () => {
    if(toggleImg.src === 'https://cdn-icons-png.freepik.com/512/6714/6714978.png') {
        // toggleImg.src = 'https://static.thenounproject.com/png/979909-200.png'
        toggleImg.src = './image3.png' 
        document.body.classList.toggle('dark-theme')
    } else {
        toggleImg.src = 'https://cdn-icons-png.freepik.com/512/6714/6714978.png'
        document.body.classList.toggle('dark-theme')
    }   
})

menu.addEventListener('click', () => {
    menu.classList.toggle('active')
    offScreenMenu.classList.toggle('active')
})

accountMenu.addEventListener('click', () => {
    accountIcon.classList.toggle('active')
    accountXIcon.classList.toggle('active')
    offScreenSideMenu.classList.toggle('active')
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const searchTerm = search.value

    if(searchTerm && searchTerm !== '') {

        search.value = ''
        //to get rid of the prev, counter, next elements since not needed
        prev.style.display = 'none'
        counter.style.display = 'none'
        next.style.display = 'none'
    } else {
        window.location.reload()
    }
})
const STEAM_API_KEY = '8F234C9A7402FE95766ADF2570FBE004'
const STEAM_ID = '76561198078481960'
let steamform = document.getElementById('steamform')
let steamformClientIdInput = document.getElementById('steamid')
let steamId = undefined
let steamTimePlayedInMs = 0
let steamTimer = undefined

// https://developer.riotgames.com/apis#tft-match-v1/GET_getMatch
const LOL_API_KEY = 'RGAPI-5e3b94d4-6b7e-4341-b987-91bb03eab772' // refresh tous les jours
const LOL_ID = 'bpfNnWZ6fbtEkHwiqbXuSXvzpQkGICWjhh17lOrEvvpV04vTCVh0pYhGg2xybQPJP7sGoimspdcUOA'
let lolform = document.getElementById('lolform')
let lolformClientIdInput = document.getElementById('lolid')
let lolId = undefined
let lolTimePlayedInMs = 0
let lolTimer = undefined

// https://www.chartjs.org/docs/latest/developers/api.html
const ctx = document.getElementById('myChart');
new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    }
});

let percentageOfLifeLostTotal = 0
let percentageOfLifeLostSteam = 0
let percentageOfLifeLostLol = 0

let mainForm = document.getElementById('form')
let riotform = document.getElementById('riotform')

let mainFormBirthdayInput = document.getElementById('date')
let riotFormBirthdayInput = document.getElementById('date')

let providers = new Map()
providers.set('main', ['year', 'day', 'hour', 'minute', 'second'])
providers.set('absolute', ['absoluteyear', 'absoluteday', 'absolutehour', 'absoluteminute', 'absolutesecond'])
providers.set('steam', ['steamyear', 'steamday', 'steamhour', 'steamminute', 'steamsecond'])

let timer = undefined
let lifeTimeDate = new Date()
let lifeTimeInMs = 0

/**
 * BIRTHDAY
 */
mainForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let newDate = new Date(mainFormBirthdayInput.value);
    let now = Date.now()
    lifeTimeInMs = new Date(now - newDate.getTime()).getTime()
    updateTimeForDiv('main', calculateLostTime(lifeTimeInMs))
    updateTimeForDiv('absolute', calculateAbsoluteLostTime(lifeTimeInMs))

    if (timer !== undefined) {
        clearInterval(timer)
    }
    timer = setInterval(() => {
        updateTimeForDiv('main', calculateLostTime(lifeTimeInMs))
        updateTimeForDiv('absolute', calculateAbsoluteLostTime(lifeTimeInMs))
        lifeTimeDate.setTime(lifeTimeInMs + 1000)
        lifeTimeInMs = lifeTimeDate.getTime()
    }, 1000);
})

let calculateAbsoluteLostTime = (timeInMS) => {
    let inYears = Math.floor(timeInMS / 1000 / 60 / 60 / 24 / 365)
    let inDays = Math.floor(timeInMS / 1000 / 60 / 60 / 24)
    let inHours = Math.floor(timeInMS / 1000 / 60 / 60)
    let inMinutes = Math.floor(timeInMS / 1000 / 60)
    let inSeconds = Math.floor(timeInMS / 1000)
    return [
        inYears,
        inDays,
        inHours,
        inMinutes,
        inSeconds
    ]
}

let calculateLostTime = (timeInMS) => {
    let absoluteTime = calculateAbsoluteLostTime(timeInMS)
    let years = Math.floor(absoluteTime[0])
    let days = Math.floor(absoluteTime[1] - (years * 365))
    let hours = Math.floor(absoluteTime[2] - (absoluteTime[1] * 24))
    let mins = Math.floor(absoluteTime[3] - (absoluteTime[2] * 60))
    let secs = Math.floor(absoluteTime[4] - (absoluteTime[3] * 60))
    return [
        years,
        days,
        hours,
        mins,
        secs
    ]
}

let updateTimeForDiv = (div, timeArray) => {
    let els = providers.get(div)
    Object.entries(els).forEach(([i, el]) => {
        document.getElementById(el).innerText = timeArray[i]
    })
}

let calculatePercentageOfLifeLost = () => {
    percentageOfLifeLostSteam = steamTimePlayedInMs * 100 / lifeTimeInMs
    percentageOfLifeLostLol = lolTimePlayedInMs * 100 / lifeTimeInMs
    percentageOfLifeLostTotal = percentageOfLifeLostSteam + percentageOfLifeLostLol
    document.getElementById('percentageOfLifeLostTotal').innerText = 'Percentage of your life lost playing : ' + percentageOfLifeLostTotal.toFixed(2) + ' %'
    document.getElementById('percentageOfLifeLostSteam').innerText = 'Percentage of your life lost playing : ' + percentageOfLifeLostSteam.toFixed(2) + ' %'
    document.getElementById('percentageOfLifeLostLol').innerText = 'Percentage of your life lost playing : ' + percentageOfLifeLostLol.toFixed(2) + ' %'
}

/**
 * STEAM
 */
steamform.addEventListener('submit', (e) => {
    e.preventDefault()

    steamId = document.getElementById('steamid').value || STEAM_ID

    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_played_free_games=true&include_appinfo=true`, {
        mode: 'cors',
        crossorigin: true,
        credentials: 'same-origin',
        headers: {
            "Origin": "https://localhost"
        }
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            let timePlayedInMinute = 0
            json.response.games.forEach((el, i) => {
                timePlayedInMinute += el.playtime_forever
            })
            steamTimePlayedInMs = timePlayedInMinute * 60 * 1000
            updateTimeForDiv('steam', calculateLostTime(steamTimePlayedInMs))
            calculatePercentageOfLifeLost()
        });
})


// test Events
mainFormBirthdayInput.valueAsDate = new Date('2001-01-03')
const evt = new Event("submit", {});
mainForm.dispatchEvent(evt);
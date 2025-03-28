// A toi de jouer pour cette partie :-) Happy coding !

const cityInput = document.getElementById("cityInput");
const ok = document.querySelector("button");
const city = document.getElementById('city');
const gps = document.getElementById("gps");
const temp = document.getElementById("temperature");
const details = document.getElementById("details");
const ctx = document.getElementById('myChart');
const chart = document.querySelector(".chart");
const past = document.querySelector(".past");
const close = document.querySelector(".close");

let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'température moyenne',
            data: [],
            borderWidth: 1
        },{
            label: 'précipitation en mm',
            data: [],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

async function fetchCoordinates(choice) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${choice}&format=json&addressdetails=1&limit=1`);
    const data = await res.json();

    if (data[0] == undefined) {
        city.innerText = 'Ville non trouvée';
        temp.innerText = "-";
        details.innerText = 'Vérifiez le nom de la ville';
        past.style.display = 'none';
    } else {
        city.innerText = choice;
        gps.innerText = `Coordonnées GPS: ${data[0].lat}, ${data[0].lon}`;
        fetchWeather(data[0].lat, data[0].lon);
    }
}

async function fetchWeather(lat, lon) {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,relative_humidity_2m`);
    const data = await res.json();
    temp.innerText = `${data.current.temperature_2m}°C`;
    details.innerText = 'Température actuelle';
    past.innerText = 'Voir les 3 derniers jours';
    past.style.display = 'block';
    fetchPastDays(lat, lon);

}

async function fetchPastDays(lat, lon) {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&past_days=3`);
    const data = await res.json();
    let pastDaysTemp = {};
    let pastDaysPrec = {};
    for (let i = 0; i < 72; i++) {
        let day = new Date(data.hourly.time[i]);
        day = day.toLocaleDateString('fr-FR');
        if (!pastDaysTemp[day]) {
            pastDaysTemp[day] = data.hourly.temperature_2m[i];
            pastDaysPrec[day] = data.hourly.precipitation[i];
        } else {
            pastDaysTemp[day] += data.hourly.temperature_2m[i];
            pastDaysPrec[day] += data.hourly.precipitation[i];

        }
    }
    let labels = Object.keys(pastDaysTemp)
    let temperature = Object.values(pastDaysTemp);
    let prec = Object.values(pastDaysPrec);
    temperature = temperature.map(temp => temp / 24);
    myChart.data.labels = labels;
    myChart.data.datasets[0].data = temperature;
    myChart.data.datasets[1].data = prec;
    myChart.update();
}


ok.addEventListener("click", () => {
    fetchCoordinates(cityInput.value);
})

past.addEventListener("click", () => {
    chart.style.display = 'flex';

})

close.addEventListener("click", () => {
    chart.style.display = 'none';
})
document.addEventListener("click", (event) => {
    if (!chart.contains(event.target) && event.target !== past) {
        chart.style.display = "none";
    }
})
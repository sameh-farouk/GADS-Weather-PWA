const apiKey = "aaa38ea47b5def605e7b21575095068d";
const UNITS='metric';//or imperial
const apiUrl = city =>
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${UNITS}&appid=${apiKey}`;

let cites = [];

function unixTimeStampToDate(unixTimestamp) {
  const milliseconds = Number(unixTimestamp) * 1000;
  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toLocaleString();
  return humanDateFormat;
}

function add_city_card(data) {
  let elmnt = document.getElementById("card-template");
  let cln = elmnt.cloneNode(true);
  cln.classList.remove("hide");
  cln.getElementsByClassName("city-name")[0].innerText = data["cname"].toUpperCase();
  cln.getElementsByClassName("updated")[0].innerText = `last updated: ${
    data["dt"]
  }`;
  cln.getElementsByClassName("description")[0].innerText = `Feels like ${
    data["feels_like"]
  } °C, ${data["description"]}.`;
  cln.getElementsByClassName("temp")[0].innerText = data["temperature"] + "°C";
  cln.getElementsByClassName("t-max-min")[0].innerText =
    data["temp_max"] + " / " + data["temp_min"] + "°F";
  cln.getElementsByClassName("pressure")[0].innerText = data["pressure"] + "hPa";
  cln.getElementsByClassName("humidity")[0].innerText = data["humidity"] + "%";
  cln.dataset.cname = data["cname"];
  cln
    .getElementsByClassName("remove-city")[0]
    .addEventListener("click", function(event) {
      let cityName = this.parentElement.dataset.cname;
      this.parentElement.remove();
      const index = cites.indexOf(cityName);
      if (index > -1) {
        cites.splice(index, 1);
        localStorage.setItem("city-lsit", JSON.stringify(cites));
      }
    });
  let container = document.getElementById("main");
  container.appendChild(cln);
}

async function getCurrentWeather(city) {
  const response = await fetch(apiUrl(city));
  if (response.ok) {
    return await response.json();
  } else {
    return await Promise.reject(response);
  }
}

async function getAndUpdateUI(cname) {
  await getCurrentWeather(cname)
    .then(data => {
      let newData = {
        description: data.weather.map(group => group.description).join(),
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        cname: cname,
        dt: unixTimeStampToDate(data.dt)
      };
      return newData;
    })
    .then(add_city_card)
    .catch(err => {
      alert(`Error: ${err}`);
      throw "error";
    });
}

function init() {
  if (!localStorage.getItem("city-lsit")) {
    console.log("empty list");
    cites = [];
  } else {
    cites = JSON.parse(localStorage.getItem("city-lsit"));
    for (let city of cites) {
      console.log(city);
      getAndUpdateUI(city);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
  document.getElementById("add-city").addEventListener("click", () => {
    let cname = document.getElementById("cname").value.toLowerCase();
    if (cites.includes(cname)) {
      console.log("alread exists");
      return;
    }
    getAndUpdateUI(cname)
      .then(() => {
        cites.push(cname);
        localStorage.setItem("city-lsit", JSON.stringify(cites));
      })
      .catch(err => {
        alert(`Error: ${err}`);
      });
  });

  init();
});

// --- Globaalit muuttujat ---
let players = [];
let solution = null;
let headerAdded = false;

// --- Arvausrajat ---
let guessCount = 0;
const dailyMaxGuesses = 8;
const unlimitedMaxGuesses = 5;

// --- Pelimoodit ---
let unlimitedMode = false;

// --- Streakit ---
let dailyStreak = Number(localStorage.getItem("dailyStreak")) || 0;
let unlimitedStreak = 0;

// --- Autocomplete ---
const input = document.getElementById("guessInput");
const suggestionsBox = document.getElementById("suggestions");

// --- Laskurin alustus ---
document.addEventListener("DOMContentLoaded", () => {
  updateGuessCounter();
  updateStreakDisplay();
});

// --- Päivän pelaajan päivämääräfunktio ---
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// --- Pelaajan arpominen unlimited-moodiin ---
function pickNewSolution() {
  const index = Math.floor(Math.random() * players.length);
  solution = players[index];
  console.log("Uusi pelaaja arvottu:", solution.name);
}

// --- Pelaajien lataus ---
fetch("players.json")
  .then(response => response.json())
  .then(data => {
    players = data.map(p => ({
      ...p,
      age: Number(p.age),
      number: p.number === null ? null : Number(p.number)
    }));

    loadSolution();
  })
  .catch(err => console.error("Virhe players.json latauksessa:", err));

// --- Moodin mukaan valitaan pelaaja ---
function loadSolution() {
  if (unlimitedMode) {
    pickNewSolution();
  } else {
    const day = new Date().getDate();
    const index = day % players.length;
    solution = players[index];
  }

  console.log("Valittu pelaaja:", solution.name);
}

// --- Arvausfunktio ---
function makeGuess() {
  const guessName = input.value.trim();

  if (guessName === "") {
    alert("Kirjoita pelaajan nimi");
    return;
  }

  if (!solution) {
    alert("Peli latautuu vielä, yritä hetken päästä.");
    return;
  }

  const guessedPlayer = players.find(
    p => p.name.toLowerCase() === guessName.toLowerCase()
  );

  if (!guessedPlayer) {
    alert("Pelaajaa ei löytynyt listasta");
    return;
  }

  if (!headerAdded) {
    addHeaderRow();
    headerAdded = true;
  }

  addGuessRow(guessedPlayer);
  guessCount++;
  updateGuessCounter();
  input.value = "";

 // --- Unlimited Mode (5 arvauksen raja) ---
if (unlimitedMode) {

    // Oikein
    if (guessedPlayer.name === solution.name) {
        unlimitedStreak++;
        updateStreakDisplay();

        resetBoard();
        pickNewSolution();
        return;
    }

    // Väärin, mutta ei vielä 5 yritystä → ei ilmoitusta, ei paljastusta
    if (guessCount < unlimitedMaxGuesses) {
        return;
    }

    // 5. väärä → nyt paljastetaan oikea
    if (guessCount === unlimitedMaxGuesses) {
        alert("Oikea vastaus oli: " + solution.name);

        unlimitedStreak = 0;
        updateStreakDisplay();

        resetBoard();
        pickNewSolution();
        return;
    }
}

  // --- Daily Mode (8 arvauksen raja) ---
  if (guessedPlayer.name === solution.name) {
    dailyStreak++;
    localStorage.setItem("dailyStreak", dailyStreak);
    updateStreakDisplay();
    alert("Oikein! Päivää putkeen oikein: " + dailyStreak);
  }

  if (guessCount >= dailyMaxGuesses) {
    alert("Arvausraja täynnä! Oikea vastaus oli: " + solution.name);
  }
}

// --- Laskurin päivitys ---
function updateGuessCounter() {
  const counter = document.getElementById("guessCounter");

  if (unlimitedMode) {
    counter.textContent = "Arvaukset: " + guessCount + " / " + unlimitedMaxGuesses;
  } else {
    counter.textContent = "Arvaukset: " + guessCount + " / " + dailyMaxGuesses;
  }
}

// --- Streak-näytön päivitys ---
function updateStreakDisplay() {
  const dailyBox = document.getElementById("dailyStreakBox");
  const unlimitedBox = document.getElementById("unlimitedStreakBox");

  if (unlimitedMode) {
    dailyBox.style.display = "none";
    unlimitedBox.style.display = "block";
    unlimitedBox.textContent = "Oikein arvattua pelaajaa putkeen: " + unlimitedStreak;
  } else {
    unlimitedBox.style.display = "none";
    dailyBox.style.display = "block";
    dailyBox.textContent = "Päivää putkeen oikein: " + dailyStreak;
  }
}

// --- Resetointi ---
function resetBoard() {
  document.getElementById("guesses").innerHTML = "";
  headerAdded = false;
  guessCount = 0;
  updateGuessCounter();
}

// --- Värilogiikka ---
function getColor(value, correctValue) {
  return value === correctValue ? "green" : "gray";
}

// --- Nuolivihjeet ---
function getArrow(value, correctValue) {
  if (value === null || correctValue === null) return "";
  if (value < correctValue) return "↑";
  if (value > correctValue) return "↓";
  return "";
}

// --- Otsikkorivi ---
function addHeaderRow() {
  const container = document.getElementById("guesses");

  const header = document.createElement("div");
  header.className = "guess-row";

  header.innerHTML = `
    <div><b>Nimi</b></div>
    <div><b>Joukkue</b></div>
    <div><b>Pelipaikka</b></div>
    <div><b>Kätisyys</b></div>
    <div><b>Ikä</b></div>
    <div><b>Numero</b></div>
    <div><b>Maa</b></div>
  `;

  container.appendChild(header);
}

// --- Arvausrivi ---
function addGuessRow(player) {
  const container = document.getElementById("guesses");

  const row = document.createElement("div");
  row.className = "guess-row";

  const ageArrow = getArrow(player.age, solution.age);
  const numberArrow = getArrow(player.number, solution.number);

  row.innerHTML = `
    <div class="${getColor(player.name, solution.name)}">${player.name}</div>
    <div class="${getColor(player.team, solution.team)}">${player.team}</div>
    <div class="${getColor(player.position, solution.position)}">${player.position}</div>
    <div class="${getColor(player.shoots, solution.shoots)}">${player.shoots}</div>
    <div class="${getColor(player.age, solution.age)}">${player.age} ${ageArrow}</div>
    <div class="${getColor(player.number, solution.number)}">${player.number ?? "-"} ${numberArrow}</div>
    <div class="${getColor(player.country, solution.country)}">${player.country}</div>
  `;

  container.appendChild(row);
}

// --- Autocomplete ---
input.addEventListener("input", () => {
  const text = input.value.toLowerCase();

  if (text.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = players.filter(p =>
    p.name.toLowerCase().includes(text)
  );

  suggestionsBox.innerHTML = "";

  if (matches.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach(player => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = player.name;

    div.addEventListener("click", () => {
      input.value = player.name;
      suggestionsBox.style.display = "none";
    });

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
});

// --- Piilota lista ---
document.addEventListener("click", (e) => {
  if (e.target !== input) {
    suggestionsBox.style.display = "none";
  }
});

// --- ENTER ---
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    makeGuess();
  }
});

// --- Moodipainikkeet ---
document.getElementById("dailyBtn").addEventListener("click", () => {
  unlimitedMode = false;
  unlimitedStreak = 0;
  updateStreakDisplay();
  resetBoard();
  loadSolution();
  alert("Daily Mode käytössä");
});

document.getElementById("unlimitedBtn").addEventListener("click", () => {
  unlimitedMode = true;
  unlimitedStreak = 0;
  updateStreakDisplay();
  resetBoard();
  pickNewSolution();
  alert("Unlimited Mode käytössä (5 arvauksen raja)");
});

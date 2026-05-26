// --- Globaalit muuttujat ---
let players = [];
let solution = null;
let headerAdded = false;

// --- Arvauslaskuri ---
let guessCount = 0;
const maxGuesses = 8;

// --- Autocomplete tarvitsee nämä ---
const input = document.getElementById("guessInput");
const suggestionsBox = document.getElementById("suggestions");

// --- Laskurin alustus ---
document.addEventListener("DOMContentLoaded", () => {
  const counter = document.getElementById("guessCounter");
  if (counter) counter.textContent = "Arvaukset: 0 / " + maxGuesses;
});

// --- Päivän pelaajan päivämääräfunktio ---
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// --- Pelaajien lataus + päivän pelaaja ---
fetch("players.json")
  .then(response => response.json())
  .then(data => {
    players = data.map(p => ({
      ...p,
      age: Number(p.age),
      number: p.number === null ? null : Number(p.number)
    }));

    const day = new Date().getDate();
    const index = day % players.length;
    solution = players[index];

    console.log("Päivän pelaaja:", solution.name);
  })
  .catch(err => {
    console.error("Virhe players.json latauksessa:", err);
  });

// --- Arvausfunktio ---
function makeGuess() {
  const guessName = input.value.trim();

  if (guessCount >= maxGuesses) {
    alert("Arvausraja täynnä! Oikea vastaus oli: " + solution.name);
    return;
  }

  if (guessName === "") {
    alert("Kirjoita pelaajan nimi");
    return;
  }

  if (!solution) {
    alert("Peli latautuu vielä, yritä hetken päästä uudestaan.");
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

  // --- Arvausmäärän kasvu ---
  guessCount++;

  // --- Laskurin päivitys ---
  const counter = document.getElementById("guessCounter");
  if (counter) counter.textContent = "Arvaukset: " + guessCount + " / " + maxGuesses;

  input.value = "";

  if (guessedPlayer.name === solution.name) {
    alert("Oikein! Löysit päivän pelaajan!");
  }

  if (guessCount >= maxGuesses) {
    alert("Arvausraja täynnä! Oikea vastaus oli: " + solution.name);
  }
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

// --- Autocomplete pelaajahaku ---
input.addEventListener("input", () => {
  const text = input.value.toLowerCase();

  if (text.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = players.filter(p =>
    p.name.toLowerCase().startsWith(text)
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

// --- Piilota lista kun klikataan muualle ---
document.addEventListener("click", (e) => {
  if (e.target !== input) {
    suggestionsBox.style.display = "none";
  }
});

// --- ENTER-AKTIVOINTI ---
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    makeGuess();
  }
});

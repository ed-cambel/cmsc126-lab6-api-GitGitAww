/*
    Cambel - Frontend
    Espartero - Backend
    Fallarme - Backend
    Gelvezon - Frontend
*/

const grid = document.getElementById("pokemonGrid");
const loading = document.getElementById("loading");


// find pokemon function 
function findPokemon() {
  const search = document.getElementById('search-id').value.toLowerCase();
  const Pokemon_Cards = document.querySelectorAll('.pokemon-card');

  Pokemon_Cards.forEach(card => {
    const Pokemon_Name = card.querySelector('h3').textContent.toLowerCase();

    if(Pokemon_Name.includes(search)){
      card.style.display = "block";
    } else{
      card.style.display = "none";
    }
  });
}

// live search
document.getElementById('search-id').addEventListener('input', findPokemon)

// creates template for each card
function createCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>#${pokemon.id} ${pokemon.name.toUpperCase()}</h3>
    <div class="types"> ${pokemon.types .map((t) => `<span class="type type-${t.type.name}">${t.type.name}</span>`).join("")}</div>
    <p><strong>Abilities:</strong> ${pokemon.abilities.map((a) => a.ability.name).join(", ")}</p>
  `;

  return card;
}


// loads all gen 1 pokemon
async function loadPokemon() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await res.json();

    const detailed = await Promise.all(
      data.results.map((p) => fetch(p.url).then((r) => r.json())),
    );

    detailed.forEach((pokemon) => {
      grid.appendChild(createCard(pokemon));
    });
  } catch (err) {
    grid.innerHTML = "<p>Failed to load Pokémon.</p>";
  } finally {
    loading.style.display = "none";
  }
}

loadPokemon();

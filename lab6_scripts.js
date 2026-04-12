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
  // code here
}

// creates template for each card
function createCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>#${pokemon.id} ${pokemon.name.toUpperCase()}</h3>
    <p><strong>Type:</strong> ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
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

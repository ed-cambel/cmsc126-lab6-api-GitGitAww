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


// loads pokemons
async function loadPokemon(genId) {
  grid.innerHTML = " ";
  loading.style.display = "block";

  try {
    let pokemonList = []
    
    //Shows the pokemons based on the selected Generations
    if (genId == 0) {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      const data = await res.json();
      pokemonList = data.results;
    } else {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`)
      const data = await res.json();
      pokemonList = data.pokemon_species
    }

    const detailed = await Promise.all(
    pokemonList.map(async (p) => {
    try {
      // try to fetch by the name 
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
      if (!r.ok) throw new Error("Not found");
      return await r.json();
    } catch (e) {
          // If it fails, fetch the species data 
          const speciesRes = await fetch(p.url);
          const speciesData = await speciesRes.json();
          const defaultVariety = speciesData.varieties.find(v => v.is_default).pokemon.name;
          const finalRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${defaultVariety}`);
          return await finalRes.json();
        }
      })
    );

    // arrange based on ID
    detailed.sort((a, b) => a.id - b.id);

    detailed.forEach((pokemon) => {
      grid.appendChild(createCard(pokemon));
    });
      } catch (err) {
        grid.innerHTML = "<p>Error loading Pokémon.</p>";
      } finally {
        loading.style.display = "none";
      }
  }

document.getElementById('gen-select').addEventListener('change', function(){
  const selectedGenValue = this.value;
    
  // Get the label to update the h3
  const selectedGenText = this.options[this.selectedIndex].text;
    
  // Update the h3 text
  const titleElement = document.getElementById('gen-title');
    if (selectedGenValue == "0") {
        titleElement.textContent = "All Pokemon";
    } else {
        titleElement.textContent = `${selectedGenText} Pokemon`;
    }

  // Load the data
  loadPokemon(selectedGenValue);
});

//Generation 1 is the default display
loadPokemon(1);

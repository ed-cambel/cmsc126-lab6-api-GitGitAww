/*
    Cambel - Frontend
    Espartero - Backend
    Fallarme - Backend
    Gelvezon - Frontend
*/

// --- DOM ELEMENTS & UTILITIES --- //
const grid = document.getElementById("pokemonGrid");
const loading = document.getElementById("loading");
const searchInput = document.getElementById('search-id');
const genSelect = document.getElementById('gen-select');
const typeSelect1 = document.getElementById('type-select');
const typeSelect2 = document.getElementById('type-select-2');
const genTitle = document.getElementById('gen-title');

// Helper to safely extract the ID from PokeAPI URLs
const extractId = (url) => url.split('/').filter(Boolean).pop();

// --- SEARCH & UI TEMPLATES --- //

// Live Search Function
function findPokemon() {
  const search = searchInput.value.toLowerCase().trim(); 
  const pokemonCards = document.querySelectorAll('.pokemon-card');

  pokemonCards.forEach(card => {
    // Grab BOTH the name and the ID text from the card
    const pokemonName = card.querySelector('h3.name').textContent.toLowerCase();
    const pokemonId = card.querySelector('h3.id').textContent.toLowerCase();

    // Check if the search term is included in either the name OR the ID
    if (pokemonName.includes(search) || pokemonId.includes(search)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

// Card Template Creator
function createCard(pokemon) {
  const card = document.createElement("div");
  card.className = `pokemon-card ${pokemon.types[0].type.name}`;

  card.innerHTML = `
    <h3 class="id"> #${pokemon.id.toString().padStart(4, '0')} </h3>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3 class="name">${pokemon.name.toUpperCase()}</h3>
    <div class="types"> 
      ${pokemon.types.map((t) => `<span class="type type-${t.type.name}">${t.type.name}</span>`).join("")}
    </div>
    <p class="abilities">
      <span class="ability-header">Abilities: </span>
      <span class="ability-list">
        ${pokemon.abilities.map(a => `<span class="ability">${a.ability.name}</span>`).join("")}
      </span>
    </p>
  `;

  return card;
}

// Helper Function: Reusable logic to fetch, sort, and render cards from an array of IDs
async function fetchAndRenderDetails(validIds) {
  const detailed = await Promise.all(
    validIds.map(async (id) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      return await res.json();
    })
  );

  detailed.sort((a, b) => a.id - b.id);
  detailed.forEach((pokemon) => {
    grid.appendChild(createCard(pokemon));
  });
}

// --- DATA FETCHING & FILTERING --- //

// Load Pokemon by Generation
async function loadPokemon(genId) {
  grid.innerHTML = "";
  loading.style.display = "block";

  try {
    let pokemonList = [];
    
    if (genId == 0) {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
      const data = await res.json();
      pokemonList = data.results;
    } else {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
      const data = await res.json();
      pokemonList = data.pokemon_species;
    }

    const detailed = await Promise.all(
      pokemonList.map(async (p) => {
        try {
          const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
          if (!r.ok) throw new Error("Not found");
          return await r.json();
        } catch (e) {
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

// Traffic Controller for Filters
function handleTypeFilter() {
  let type1 = typeSelect1 ? typeSelect1.value : "";
  let type2 = typeSelect2 ? typeSelect2.value : ""; 
  const genId = genSelect ? genSelect.value : "1";

  if (type1 === "0") type1 = "";
  if (type2 === "0") type2 = "";

  // Prevent duplicate
  if (type1 !== "" && type1 === type2) {
    alert("You already selected that type!");
    if (typeSelect2) typeSelect2.value = "0"; 
    return;
  }

  // Determine route
  if (type1 === "" && type2 === "") {
    loadPokemon(genId); 
  } else if (type1 !== "" && type2 === "") {
    loadPokemonByType(type1, genId);
  } else if (type1 === "" && type2 !== "") {
    loadPokemonByType(type2, genId);
  } else {
    loadPokemonByTwoTypes(type1, type2, genId);
  }
}

// Filter by ONE Type + Generation
async function loadPokemonByType(type, genId) {
  grid.innerHTML = "";
  loading.style.display = "block";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await res.json();
    let validIds = data.pokemon.map(p => extractId(p.pokemon.url));

    if (genId && genId !== "0") {
      const genRes = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
      const genData = await genRes.json();
      const genIds = genData.pokemon_species.map(p => extractId(p.url));
      validIds = validIds.filter(id => genIds.includes(id));
    }

    if (validIds.length === 0) {
      grid.innerHTML = "<p>No Pokémon found with this type in the selected generation.</p>";
      return;
    }

    await fetchAndRenderDetails(validIds);

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Error loading Pokémon.</p>";
  } finally {
    loading.style.display = "none";
  }
}

// Filter by TWO Types + Generation
async function loadPokemonByTwoTypes(type1, type2, genId) {
  grid.innerHTML = "";
  loading.style.display = "block";

  try {
    const [res1, res2] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/type/${type1}`),
      fetch(`https://pokeapi.co/api/v2/type/${type2}`)
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const list1Ids = data1.pokemon.map(p => extractId(p.pokemon.url));
    const list2Ids = data2.pokemon.map(p => extractId(p.pokemon.url));

    // Intersect the two types
    let validIds = list1Ids.filter(id => list2Ids.includes(id));

    if (genId && genId !== "0") {
      const genRes = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
      const genData = await genRes.json();
      const genIds = genData.pokemon_species.map(p => extractId(p.url));
      validIds = validIds.filter(id => genIds.includes(id));
    }

    if (validIds.length === 0) {
      grid.innerHTML = `<p class="no-results"><strong>No Pokémon found with the combination of ${type1} and ${type2} types in the selected generation.</strong></p>`;
      return; 
    }

    await fetchAndRenderDetails(validIds);

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Error loading Pokémon.</p>";
  } finally {
    loading.style.display = "none";
  }
}

// --- EVENT LISTENERS & INITIALIZATION --- //

searchInput?.addEventListener('input', findPokemon);

genSelect?.addEventListener('change', function() {
  const selectedGenValue = this.value;
  const selectedGenText = this.options[this.selectedIndex].text;
    
  if (genTitle) {
    genTitle.textContent = selectedGenValue === "0" ? "All Pokemon" : `${selectedGenText} Pokemon`;
  }

  handleTypeFilter(); 
});

typeSelect1?.addEventListener('change', handleTypeFilter);
typeSelect2?.addEventListener('change', handleTypeFilter);

// Initialize Page Load
handleTypeFilter();
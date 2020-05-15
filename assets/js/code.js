const cardItem = props => {

    const {image, name, species, origin, id} = props;
    const {name: planet, url} = origin; 

    return `
        <div class="column is-one-quarter">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="${image}" alt="Placeholder image">
              </figure>
            </div>

            <div class="card-content">
              <div class="media">
                <div class="media-content">
                  <p class="title is-4">${name}</p>
                  <p class="title is-6">Species: ${species}</p>
                  <p class="title is-6">Planet: ${planet}</p>
                </div>
              </div>

              <div class="buttons">
                <button data="${id}" class="button is-primary open_modal">Ver más</button>
              </div>
            </div>
          </div>
        </div>
      `
}

//FUNCIÓN PARA OBTENER PERSONAJES DE LA API
const getCharacters = async (baseURL, from, to) =>{

    //Array.from({length: 5}, (v,i) => i);
    const charactersRange = Array.from({length: to - from +1}, (_,index) =>index +1).join(',');
    const url = `${baseURL}character/${charactersRange}`

    const response = await fetch(url);
    const characters = await response.json();

    return characters;
}

//FUNCIÓN PARA OBTENER PERSONAJES POR BÚSQUEDA
const getCharactersByQuery = async (baseURL, query) => {
    const url = `${baseURL}/character/?name=${query}`;
    const response = await fetch(url);
    const characters = await response.json();
    return characters
} 

//FUNCIÓN PARA AGREGAR LOS PERSONAJES AL DOM
const appendElements = (characters, emptyGrid) => {
    const $grid = document.querySelector('.grid');
    if(emptyGrid){ $grid.innerHTML = null;}
    characters.forEach(character =>{
        const cardItemHtml = cardItem(character);
        $grid.innerHTML += cardItemHtml;
    });
}

//Declaro los tags del DOM afuera de las funciones así puedo llamarlas desde cualquiera.
const $characterName = document.querySelector('#characterProfile');
const $characterStatus = document.querySelector('#character-status');
const $planetOrigin = document.querySelector('#planet-origin');
const $planetLocation = document.querySelector('#planet-location');
const $modalImg = document.querySelector('#modalImg');
const $episodesTable = document.querySelector('#episodesTable');

//INICIO DEL CÓDIGO, MAIN.
const main = async () =>{

    const  baseURL = 'https://rickandmortyapi.com/api/'; 

    //1. Obtener elementos de la api y mostrarlos en el DOM
    const characters = await getCharacters(baseURL, 1, 20);
    appendElements(characters);

    //2. Crear un buscador de personajes
    const $submit = document.querySelector('.handle_search');
    $submit.addEventListener('click',async (event)=>{ 
      event.preventDefault();
      const $input = document.querySelector('.input_search');
      const valor = $input.value;

      const charactersByQuery = await getCharactersByQuery(baseURL, valor);
      appendElements(charactersByQuery.results, true);
    })

    //3. Crear un Modal
    const modalFunctions = () =>{

      const $modalOpenArr = document.querySelectorAll('.open_modal');
      const $modal = document.querySelector('.modal');
      const $modalClose = document.querySelector('.modal-close');
      
      $modalOpenArr.forEach((boton) => {
        boton.addEventListener('click',()=>{
          $modal.classList.add("is-active");
          const character_id = boton.getAttribute('data');
          getCharactersModalData(character_id, characters); //Traigo los datos del modal
        })
      })
  
      $modalClose.addEventListener('click',() => {
        $modal.classList.remove("is-active");
        $episodesTable.innerHTML = "";
      })
    }
    modalFunctions();

    //4. Crear tabs de búsqueda por Capítulos y Locations
    const $grid = document.querySelector('.grid');
    const $episodesTab = document.querySelector('#episodesTab');
    const $locationsTab = document.querySelector('#locationsTab');
    const $charactersTab = document.querySelector('#charactersTab');

    //TAB DE PERSONAJES
    $charactersTab.addEventListener('click', async(event)=>{
        event.preventDefault();
        
        $charactersTab.classList.add("is-active");
        $locationsTab.classList.remove("is-active");
        $episodesTab.classList.remove("is-active");

        $grid.innerHTML = "";
        appendElements(characters);
        modalFunctions();
    });

    //TAB DE EPISODIOS
    $episodesTab.addEventListener('click', async(event)=>{
        event.preventDefault();

        $episodesTab.classList.add("is-active");
        $locationsTab.classList.remove("is-active");
        $charactersTab.classList.remove("is-active");

        $grid.innerHTML = "";
        getAllEpisodes(baseURL, $grid);
    });

    //TAB DE LOCATIONS
    $locationsTab.addEventListener('click', async (event)=>{
      event.preventDefault();

      $locationsTab.classList.add("is-active");
      $episodesTab.classList.remove("is-active");
      $charactersTab.classList.remove("is-active");

      $grid.innerHTML = "";
      getAllLocations(baseURL, $grid);
  });
}

main();

//FUNCIÓN PARA TAB DE LOCATIONS
const getAllLocations = async (baseURL, $grid) => {

  const url = `${baseURL}/location`;
  const response = await fetch(url);
  const allLocations = await response.json();
  const {results} = allLocations;
  const filteredLocations = results;

  const showLocations = filteredLocations.map(({name:locName, type, dimension})=>{
    const addLocation = `
    <div class="column is-one-quarter">
      <article class="message is-dark">
        <div class="message-header">
          <p>${locName}</p>
        </div>
        <div class="message-body">
          <p>Type: ${type}</p>
          <p>dimension: ${dimension}</p>
        </div>
      </article>
    </div>
    `;
    $grid.insertAdjacentHTML('beforeend', addLocation);
  });
}

//FUNCIÓN PARA TAB DE EPISODIOS
const getAllEpisodes = async (baseURL, $grid) => {

  const url = `${baseURL}/episode`;
  const response = await fetch(url);
  const allEpisodes = await response.json();
  const {results} = allEpisodes;
  const filteredEps = results;

  const showEps = filteredEps.map(({name:epName, air_date, episode})=>{
    const addEpisode = `
    <div class="column is-one-quarter">
      <article class="message is-dark">
        <div class="message-header">
          <p>${episode}</p>
        </div>
        <div class="message-body">
          <p>${epName}</p>
          <p>${air_date}</p>
        </div>
      </article>
    </div>
    `;
    $grid.insertAdjacentHTML('beforeend', addEpisode);
  })
}

//FUNCIÓN PARA MODAL
const getCharactersModalData = async (character_id, characters) => {
  
    let episodesData = [];
    const character_selected = characters.find(character => character.id == character_id);
    const {name, origin, episode, location, status, image} = character_selected; //Del personaje seleccionado extraigo el nombre, el origen y el episodio
    
    $modalImg.src=`${image}`
    $characterName.innerHTML = `${name}`
    $characterStatus.innerHTML = `${status}`
    $planetOrigin.innerHTML = `${origin.name}`
    $planetLocation.innerHTML = `${location.name}`

    //Get all episodes
    for(i=0; i<episode.length; i++){
        const response = await fetch(episode[i]);
        const data = await response.json();
        const {name:epName, episode: seasonEp, air_date} = data;
        episodesData.push({epName, seasonEp, air_date});
        $episodesTable.innerHTML += `
            <th>${seasonEp}</th>
            <td>${epName}</td>
            <td>${air_date}</td>
        `
    }
    return episodesData;
}

//EXTRA: Muestro una frase random de la serie :)
const phrases = [
"“What, so everyone’s supposed to sleep every single night now? You realize that nighttime makes up half of all time?”",
"“Listen Morty, I hate to break it to you, but what people call “love” is just a chemical reaction”",
"“The universe is basically an animal. It grazes on the ordinary. It creates infinite idiots just to eat them.”",
"“I'm a scientist; because I invent, transform, create, and destroy for a living, and when I don't like something about the world, I change it.”",
"“Honey, stop raising your father's cholesterol so you can take a hot funeral selfie.”",
"“Now if you'll excuse me, I've got a quick solo adventure to go on and this one will not be directed by Ron Howard.”",
"“Wubba Lubba Dub Dub”"
];

const phraseNum = Math.floor(Math.random() * 7);
const $phrase = document.querySelector('#phrase');
$phrase.innerHTML = phrases[phraseNum];
//--------------------SUPABASE--------------------

//URL del proyecto de supabase al que se conecta la página
let supabaseUrl="https://muqztfvjoryrptslujae.supabase.co";

//Clave pública (anon key) de supabase
let supabaseKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cXp0ZnZqb3J5cnB0c2x1amFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2Njg2NjYsImV4cCI6MjA4MDI0NDY2Nn0.xSDC1Hbpw3Eef8tJuJ0o4Vw8ZH-U2xLwcpCTxHsHQNY";

//Creo el cliente de supabase a partir de la URL y la clave
let supabase=window.supabase.createClient(supabaseUrl, supabaseKey);

//--------------------ESTADO--------------------

//Arrays con los pokémon elegidos
let equipoJugador1=[];
let equipoJugador2=[];

//Indico de que jugador es el turno de selección de pokemons
let jugadorActual=1;

//--------------------UTILIDADES--------------------

//Esta función recibe un array de nombres y lo convierte en un texto bonito con comas y "y" al final
function formatearListaNombres(nombres){

	//Si no hay nombres, devuelvo cadena vacía
	if(nombres.length==0){
		return "";
	}

	//Si solo hay 1, lo devuelvo tal cual
	if(nombres.length==1){
		return nombres[0];
	}

	// Si hay  2, los uno con " y "
	if(nombres.length==2){
		return `${nombres[0]} y ${nombres[1]}`;
	}

	//Si hay más de 2, uno todos menos el último con comas
	let todosMenosUltimo=nombres.slice(0, -1).join(", ");

	//Y me quedo con el último para poner "y último"
	let ultimo=nombres[nombres.length - 1];

	return todosMenosUltimo+" y "+ultimo;
}

//Actualizo el texto visible de "Tus Pokémon: ..." para cada jugador
function actualizarTextoEquipo(idElemento, nombres){
	let texto=formatearListaNombres(nombres);
	document.getElementById(idElemento).textContent="Tus Pokémon: "+texto;
	}

//Marco visualmente que jugador está seleccionando pokemons
function setJugadorActivo(numJugador){

	//Cojo los títulos de los dos jugadores
	let titulo1=document.getElementById("tituloJugador1");
	let titulo2=document.getElementById("tituloJugador2");

	//Quito la clase de activo de ambos
	titulo1.classList.remove("jugadorActivo");
	titulo2.classList.remove("jugadorActivo");

	//Y se la añado solo al que le toque selecionar pokemon
	if(numJugador==1){
		titulo1.classList.add("jugadorActivo");
	} 
	else{
		titulo2.classList.add("jugadorActivo");
	}
}

//Esta función tiene la lógica para añadir un pokémon a un equipo (sirve para jugador 1 y 2)
function manejarSeleccionPokemon(pokemon, equipo, idTextoEquipo){

	//Si el equipo ya tiene 3 pokemons, no dejo añadir más
	if(equipo.length>=3){
		return;
	}

	//Si el pokemon ya está en el equipo (mismo id), tampoco lo añado (evito duplicados)
	if(equipo.some((p)=>p.id===pokemon.id)){
		return;
	}

	equipo.push(pokemon);

	//Obtengo solo los nombres para mostrarlos en el texto
	let nombres=equipo.map((e)=>e.nombre);

	//Actualizo el texto "Tus Pokémon: ..." del jugador correspondiente
	actualizarTextoEquipo(idTextoEquipo, nombres);

}

//--------------------CARGA DE POKEMONS--------------------

//Descargo todos los pokemons de la tabla pokemons de supabase
async function cargarPokemons(){

	//Hago un SELECT * sobre la tabla pokemons
	let {data, error}=await supabase.from("pokemons").select("*");

	//Si hay error, aviso y devuelvo un array vacío
	if(error){
		alert("Error cargando pokémons");
		return [];
	}

	//Si todo va bien, devuelvo el array de pokemons
	return data;
}

//Creo todas las cartas de pokemons en el contenedor de la página
function renderPokemons(pokemons){

	//Obtengo el contenedor donde se van a añadir las cartas
	let contenedor=document.getElementById("listaPokemons");

	//Recorro todos los pokemos para ir creando cada carta
	pokemons.forEach((pokemon)=>{

		//Creo la carta, que será un div
		let card=document.createElement("div");
		card.className="pokemonCard";

		//Cuando haga clic en la carta, creará la imagen y el parrafo con el nombre
		card.onclick=()=>seleccionarPokemon(pokemon);

		let img=document.createElement("img");
		img.src=pokemon.imagenFrente;
		img.alt=pokemon.nombre;
		img.height=64;

		let nombre=document.createElement("p");
		nombre.textContent=pokemon.nombre;
		nombre.style.fontSize="20px";

		card.appendChild(img);
		card.appendChild(nombre);

		contenedor.appendChild(card);
	});
}

//--------------------SELECCIÓN DE EQUIPOS--------------------

// Se llama cuando se hace clic en una carta
function seleccionarPokemon(pokemon){

	//Si el jugador que está seleccionando ahora mismo es el 1
	if(jugadorActual==1){

		//Intento añadir este pokémon al equipo del jugador 1 (aplicando las reglas de máximo 3 y sin duplicados)
		manejarSeleccionPokemon(pokemon, equipoJugador1, "equipoJugador1");

		//Si después de añadirlo el equipo 1 tiene ya 3 pokemons
		if(equipoJugador1.length==3){

			//Espero 100 ms para que se vea bien la selección final
			setTimeout(()=>{
			
			//Aviso de que el equipo 1 ya está listo
			alert("Equipo 1 listo. Elige los pokémon del equipo 2.");
			
			//Cambio el turno al jugador 2
			jugadorActual=2;

			//Actualizo la UI para marcar al jugador 2 como activo
			setJugadorActivo(2);
			}, 100);
		}

		//Corto aquí para no ejecutar el código del jugador 2
		return;
	}

	//Hago lo mismo apara el jugador 2
	if(jugadorActual==2){
		manejarSeleccionPokemon(pokemon, equipoJugador2, "equipoJugador2")

		if(equipoJugador2.length==3){

			//Activo el botón de "Comenzar partida porque ya están los dos equipos completos
			document.getElementById("botonComenzar").disabled=false;
		}
	}
}

//--------------------INICIO DE PARTIDA--------------------

function inicializarBotonComenzar(){
	let botonComenzar=document.getElementById("botonComenzar");

	botonComenzar.addEventListener("click",()=>{
	let inputJ1=document.getElementById("tituloJugador1");
	let inputJ2=document.getElementById("tituloJugador2");

	// Tomo el valor del input, lo limpio de espacios, y si está vacío, pongo un nombre por defecto ("Jugador 1" o "Jugador 2")
	let nombreJ1=(inputJ1.value || "").trim() || "Jugador 1";
	let nombreJ2=(inputJ2.value || "").trim() || "Jugador 2";

	//Creo el objeto con toda la información necesaria para el combate
	let datos={equipo1:equipoJugador1, equipo2:equipoJugador2, nombreJ1, nombreJ2};

	//Guardo los datos en sessionStorage como JSON, para leerlos luego en juego.html
	sessionStorage.setItem("equiposPokemon", JSON.stringify(datos));

	//Meto un efecto antes de redireccionar al juego
	document.body.classList.add("fade-out");

	//Redirecciono a juego con un timeout para que se haga el efecto anterior completo antes de redirigir
	setTimeout(()=>{
		window.location.href="juego/juego.html";
	}, 700);
	});
}

//--------------------ONLOAD--------------------

//Cuando se cargue la página
window.onload=async()=>{

	//Cargo la lista de pokémon desde Supabase
	let pokemons=await cargarPokemons();

	//Creo las cartas
	renderPokemons(pokemons);

	//Marco al jugador 1 como activo (es el que empieza eligiendo)
	setJugadorActivo(1);

	//Preparo el botón de comenzar a jugar
	inicializarBotonComenzar();
};

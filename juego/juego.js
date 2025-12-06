//--------------------VARIABLES GLOBALES--------------------

//Equipos de cada jugador (array de pokemon con sus datos completos)
let equipo1=[];
let equipo2=[];

//Índice del pokemon activo de cada jugador (posición dentro del equipo)
let indice1=0; 
let indice2=0;

//Vida actual de cada pokemon de cada equipo (mismo orden que en equipo1/equipo2)
let vidasEquipo1=[];
let vidasEquipo2=[];

//Nombres de los jugadores (se cargan desde sessionStorage)
let nombreJ1="";
let nombreJ2="";

//Turno actual: 1 = le toca al jugador 1, 2 = le toca al jugador 2
let turno=1;

//Indica si la partida ya ha terminado (para bloquear acciones)
let partidaTerminada=false;

//Timeouts para autocerrar menús MOCHILA y POKEMONS
let timeoutMenuCambio=null;
let timeoutMenuMochila=null;

//Pociones disponibles para cada jugador (una cura a tope, otra 50% y otra 25% de la vida total del pokemon)
let pocionesJ1={maximo:1, hp50:1, hp25:1};
let pocionesJ2={maximo:1, hp50:1, hp25:1};

//--------------------UTILIDADES--------------------

//Devuelvo el primer índice de un pokemon con vida > 0 (si todos están muertos, devuelvo -1)
function obtenerPrimerIndiceVivo(vidas){

	for(let i=0; i<vidas.length; i++){
		if (vidas[i]>0){
			return i;
		}
	}

	return -1;
}

//Devuelvo true si queda al menos un pokemon vivo en el equipo
function hayPokemonsVivos(vidas){
	return vidas.some((e)=>e>0);
}

//Devuelvo un objeto con toda la información del jugador al que le toca (así evito repetir turno === 1 ? ... : ... muchas veces)
function getJugadorActual(){

	let esJugador1=turno===1;

	return{
	equipo:esJugador1?equipo1:equipo2,
	vidas:esJugador1?vidasEquipo1:vidasEquipo2,
	indice:esJugador1?indice1:indice2,
	nombre:esJugador1?nombreJ1:nombreJ2,
	pociones:esJugador1?pocionesJ1:pocionesJ2,
	};
}


//Cambio el turno de 1 a 2 y de 2 a 1, y actualizo toda la UI
function cambiarTurnoYActualizar(){
	turno=turno===1?2:1;
	actualizarTodo();
}

//--------------------CARGA E INICIO--------------------

//Leo de sessionStorage los equipos y nombres de jugadores. Si no hay datos, vuelvo a la pantalla de selección
function cargarEquipos(){

	let texto=sessionStorage.getItem("equiposPokemon");

	if(!texto){
		//Si no hay datos guardados, se redirige al index (no se puede jugar)
		window.location.href="../index.html";
		return;
	}

	//Convierto el string JSON en un objeto JS
	let datos=JSON.parse(texto);

	//Extraigo los equipos y nombres de los jugadores
	equipo1=datos.equipo1;
	equipo2=datos.equipo2;
	nombreJ1=datos.nombreJ1;
	nombreJ2=datos.nombreJ2;

	//vidasEquiposX son arrays con las vidas de cada pokemon de cada equipo
	vidasEquipo1=equipo1.map((e)=>e.vida);
	vidasEquipo2=equipo2.map((e)=>e.vida);
}

//Preparo todo para iniciar el combate
function iniciarCombate(){

	cargarEquipos();

	indice1=0;
	indice2=0;
	turno=1;
	partidaTerminada=false;

	actualizarTodo();
}

//--------------------UI--------------------

//Actualizo toda la información visible de los pokemon activos (imagenes, nombres, texto de vida y barras de vida)
function actualizarUI(){

	let p1=equipo1[indice1];
	let p2=equipo2[indice2];
	let vida1=vidasEquipo1[indice1];
	let vida2=vidasEquipo2[indice2];

	//imagenes de los pokemons
	document.getElementById("sprite-j1").src=p1.imagenEspalda;
	document.getElementById("sprite-j2").src=p2.imagenFrente;

	//Nombres de los pokemon activos
	document.getElementById("nombre-j1").textContent=p1.nombre;
	document.getElementById("nombre-j2").textContent=p2.nombre;

	//Texto de HP (vida actual / vida total)
	document.getElementById("vida-j1").textContent=`HP: ${vida1}/${p1.vida}`;
	document.getElementById("vida-j2").textContent=`HP: ${vida2}/${p2.vida}`;

	//Nombres de los jugadores
	document.getElementById("titulo-j1").textContent=nombreJ1;
	document.getElementById("titulo-j2").textContent=nombreJ2;

	//Barras de vida
	actualizarBarraVida("j1", vida1, p1.vida);
	actualizarBarraVida("j2", vida2, p2.vida);
}

//Redibujo las pokeballs de cada jugador según si sus pokemon están vivos o muertos
function renderPokeballs(){

	pintarPokeballsEquipo("balls-j1", vidasEquipo1);
	pintarPokeballsEquipo("balls-j2", vidasEquipo2);

}

//Pinto las 3 pokeballs de los equipos
function pintarPokeballsEquipo(idContenedor, vidas){

	let cont=document.getElementById(idContenedor);
	cont.innerHTML="";

	for(let i=0; i<3; i++){
		let img=document.createElement("img");

		//Modifico la imagen según si el pokemon está vivo o muerto
		if(i<vidas.length && vidas[i]>0){
			img.src="../imagenes/vivo.png";
		} 
		else{
			img.src="../imagenes/muerto.png";
		}
		cont.appendChild(img);
	}
}

//Ajusto el ancho y el color de la barra de vida según el porcentaje de vida actual del pokemon
function actualizarBarraVida(id, vidaActual, vidaTotal){

	let fill=document.getElementById(`vida-fill-${id}`);
	let porc=Math.max(0, Math.min(vidaActual/vidaTotal, 1));
	fill.style.width=porc*100+"%";

	if(porc>0.5){
		fill.style.backgroundColor="#1ccf4d";
	} 
	else if(porc > 0.2){
		fill.style.backgroundColor="#ff9f1c";
	} 
	else{
		fill.style.backgroundColor="#ff3838";
	}
}

//Resalto, en la UI, de qué jugador es el turno actual, añadiendo o quitando la clase jugador-activo
function resaltarTurno(){

	let t1=document.getElementById("titulo-j1");
	let t2=document.getElementById("titulo-j2");
	t1.classList.remove("jugador-activo");
	t2.classList.remove("jugador-activo");

	if(turno===1){
		t1.classList.add("jugador-activo");
	} 
	else{
		t2.classList.add("jugador-activo");
	}
}

//Vuelvo a pintar la UI, las pokeballs y el resaltado de turno (la llamo siempre que cambia algo importante del estado)
function actualizarTodo(){
	actualizarUI();
	renderPokeballs();
	resaltarTurno();
}

//Añado una línea al log de combate y hago que el scroll sea automático (para que siempre se vea el último mensaje)
function registrarLog(texto){

	let lista=document.getElementById("lista-log");
	let li=document.createElement("li");
	li.textContent=texto;
	lista.appendChild(li);

	let contenedor=document.getElementById("log-combate");
	contenedor.scrollTop=contenedor.scrollHeight;
}

//--------------------TIPOS--------------------

function multiplicadorTipo(tipoAtacante, tipoDefensor){

	//----------Ataques super efectivos (x2)----------

	// Agua
	if(tipoAtacante=="agua" && tipoDefensor=="fuego") return 2;
	if(tipoAtacante=="agua" && tipoDefensor=="roca") return 2;
	if(tipoAtacante=="agua" && tipoDefensor=="acero") return 2;

	// Planta
	if(tipoAtacante=="planta" && tipoDefensor=="agua") return 2;
	if(tipoAtacante=="planta" && tipoDefensor=="roca") return 2;

	// Roca
	if(tipoAtacante=="roca" && tipoDefensor=="fuego") return 2;
	if(tipoAtacante=="roca" && tipoDefensor=="electrico") return 2;

	// Acero
	if(tipoAtacante=="acero" && tipoDefensor=="roca") return 2;
	if(tipoAtacante=="acero" && tipoDefensor=="siniestro") return 2;

	// Eléctrico
	if(tipoAtacante=="electrico" && tipoDefensor=="agua") return 2;
	if(tipoAtacante=="electrico" && tipoDefensor=="acero") return 2;

	// Psíquico
	if(tipoAtacante=="psiquico" && tipoDefensor=="lucha") return 2;

	// Lucha
	if(tipoAtacante=="lucha" && tipoDefensor=="roca") return 2;
	if(tipoAtacante=="lucha" && tipoDefensor=="acero") return 2;
	if(tipoAtacante=="lucha" && tipoDefensor=="siniestro") return 2;

	// Siniestro
	if(tipoAtacante=="siniestro" && tipoDefensor=="psiquico") return 2;

	// Dragón
	if(tipoAtacante=="dragon" && tipoDefensor=="dragon") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="fuego") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="agua") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="planta") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="roca") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="electrico") return 2;
	if(tipoAtacante=="dragon" && tipoDefensor=="siniestro") return 2;

	//----------Ataques poco efectivos (x0.5)----------

	//Agua
	if(tipoAtacante=="agua" && tipoDefensor=="planta") return 0.5;
	if(tipoAtacante==="agua" && tipoDefensor=="dragon") return 0.5;

	//Planta
	if(tipoAtacante=="planta" && tipoDefensor=="fuego") return 0.5;
	if(tipoAtacante=="planta" && tipoDefensor=="acero") return 0.5;
	if(tipoAtacante=="planta" && tipoDefensor=="dragon") return 0.5;
	if(tipoAtacante=="planta" && tipoDefensor=="planta") return 0.5;

	//Roca
	if(tipoAtacante=="roca" && tipoDefensor=="lucha") return 0.5;
	if(tipoAtacante=="roca" && tipoDefensor=="planta") return 0.5;
	if(tipoAtacante=="roca" && tipoDefensor=="acero") return 0.5;

	//Acero
	if(tipoAtacante=="acero" && tipoDefensor=="fuego") return 0.5;
	if(tipoAtacante=="acero" && tipoDefensor=="agua") return 0.5;
	if(tipoAtacante=="acero" && tipoDefensor=="acero") return 0.5;
	if(tipoAtacante=="acero" && tipoDefensor=="dragon") return 0.5;

	//Eléctrico
	if(tipoAtacante=="electrico" && tipoDefensor=="planta") return 0.5;
	if(tipoAtacante=="electrico" && tipoDefensor=="electrico") return 0.5;
	if(tipoAtacante=="electrico" && tipoDefensor=="dragon") return 0.5;

	//Psíquico
	if(tipoAtacante=="psiquico" && tipoDefensor=="psiquico") return 0.5;
	if(tipoAtacante=="psiquico" && tipoDefensor=="siniestro") return 0.5;
	if(tipoAtacante =="psiquico" && tipoDefensor=="acero") return 0.5;

	//Lucha
	if(tipoAtacante=="lucha" && tipoDefensor=="planta") return 0.5;
	if(tipoAtacante=="lucha" && tipoDefensor=="psiquico") return 0.5;

	//Siniestro
	if(tipoAtacante=="siniestro" && tipoDefensor=="lucha") return 0.5;
	if(tipoAtacante=="siniestro" && tipoDefensor=="siniestro") return 0.5;
	if(tipoAtacante=="siniestro" && tipoDefensor=="acero") return 0.5;

	//Dragón defensivo
	if(tipoAtacante=="dragon" && tipoDefensor=="acero") return 0.5;

	//Si no es ninguna de las combinaciones anteriores, daño normal
	return 1;
}

//-------------------- COMBATE--------------------

//Ejecuto el ataque del jugador al que le toca
function atacar(){

	//Selecciono el pokemon atacante y defensor según de quien sea el turno
	let atacante=turno==1?equipo1[indice1]:equipo2[indice2];
	let defensor=turno==1?equipo2[indice2]:equipo1[indice1];

	let vidaDefensor=turno==1?vidasEquipo2[indice2]:vidasEquipo1[indice1];

	//Calculo el multiplicador por tipo (super efectivo o poco efectivo)
	let mult=multiplicadorTipo(atacante.tipo, defensor.tipo);

	//Daño base: ataque del atacante menos 1/4 de la defensa del defensor (para que los pokemon con más defensa reciban menos daño)
	let base=atacante.ataque-Math.floor(defensor.defensa/4);

	//Calculo el daño final con el multiplicador
	let danio=Math.floor(base*mult);

	vidaDefensor-=danio;

	if(vidaDefensor<0){
		vidaDefensor=0;
	}

	//Guardo la nueva vida en el array correspondiente
	if(turno==1){
		vidasEquipo2[indice2]=vidaDefensor;
	} 
	else{
		vidasEquipo1[indice1]=vidaDefensor;
	}

	//Muestro un mensaje de combate con el daño que ha hecho un pokemon a otro
	registrarLog(`${atacante.nombre} hace ${danio} de daño a ${defensor.nombre}`);

	//Si el defensor a muerto lo registro y actualizo todo
	if(vidaDefensor==0){
		registrarLog(`${defensor.nombre} se ha debilitado`);

		//Refresco la barra y el texto antes de la animación de KO
		actualizarTodo();

		//Cojo la imagen del pokemon que ha mueto para añadirle un efecto
		let spriteKO=turno==1? document.getElementById("sprite-j2"):document.getElementById("sprite-j1");

		//Le agrego el efecto a la imagen del pokemon que ha muerto
		spriteKO.classList.add("pokemon-fade-out");

		//Espero un poco para que se haga la animación y luego cambio de pokemon
		setTimeout(()=>{

			siguientePokemon();
			renderPokeballs();

			//Si la partida no ha terminado, paso el turno al otro jugador
			if(!finDePartida()){
				cambiarTurnoYActualizar();

				//Quito la clase de fade-out (el efecto) a la nueva imagen que entra
				spriteKO.classList.remove("pokemon-fade-out");
			}
		}, 450);

		//Salgo para no ejecutar el cambio de turno de abajo
		return;
	}

	//Si el defensor no ha muerto, cambio el turno y refresco la UI
	cambiarTurnoYActualizar();
}

//Uso una poción sobre el pokemon activo del jugador actual
function usarPocion(tipo){

    let jugador=getJugadorActual();

    let equipoActual=jugador.equipo;
    let vidasActual=jugador.vidas;
    let indiceActual=jugador.indice;
    let nombreJugador=jugador.nombre;
    let pociones=jugador.pociones;

    let pokemon=equipoActual[indiceActual];
    let vidaActual=vidasActual[indiceActual];
    let vidaTotal=pokemon.vida;
    let vidaNueva=vidaActual;

	//Si la vida ya está al máximo, no dejo usarla
    if(vidaActual>=vidaTotal){
        
		//Lo registro en el historial
		registrarLog(`${pokemon.nombre} ya tiene la vida al máximo`);
        
		// ierro el menú pero NO cambio el turno ni gasto la poción
        cerrarMenuMochila();
        return;
    }

	//Calculo cuanta vida se recupera según el tipo de poción
	if(tipo=="maximo"){
		vidaNueva=vidaTotal;
	}
	else if(tipo=="hp50"){
		vidaNueva=Math.min(vidaTotal, vidaActual+Math.floor(vidaTotal*0.5));
	} 
	else if(tipo=="hp25"){
		vidaNueva=Math.min(vidaTotal, vidaActual+Math.floor(vidaTotal*0.25));
	}

	//Aplico la curación al array de vidas
	vidasActual[indiceActual]=vidaNueva;

	//Quito la poción usada de la mochila
	pociones[tipo]--;

	registrarLog(nombreJugador+" usa una poción ("+(tipo=="maximo"?"Curación total":tipo=="hp50"?"+50%":"+25%")+") en "+pokemon.nombre);

	//Refresco barras, textos y pokeballs
	actualizarTodo();

	//Usar una poción consume el turno
	turno=turno==1?2:1;
	resaltarTurno();
	cerrarMenuMochila();
}

//Eligo automáticamente el siguiente pokemon vivo cuando el actual llega a 0 de vida
function siguientePokemon(){

	if(turno==1){
		//Ha atacado el jugador 1, puede haber muerto el pokemon activo del jugador 2
		indice2=obtenerPrimerIndiceVivo(vidasEquipo2);
	} 
	else{
		//Ha atacado el jugador 2, puede haber muerto el pokemon activo del jugador 1
		indice1=obtenerPrimerIndiceVivo(vidasEquipo1);
	}
}

//Compruebo si alguno de los dos equipos se ha quedado sin pokemon, si es así, . Si aún quedan pokémon en ambos equipos, devuelve false
function finDePartida(){

	let quedanVivos1=hayPokemonsVivos(vidasEquipo1);
	let quedanVivos2=hayPokemonsVivos(vidasEquipo2);

	//Si el jugador 1 no tiene mas pokemons, registro el mensaje y llamo a terminarPartida() indicando qué jugador gana y devuelvo true
	if(!quedanVivos1){
		registrarLog(`¡${nombreJ2} ha ganado la partida!`);
		terminarPartida(2);
		return true;
	}

	if(!quedanVivos2){
		registrarLog(`¡${nombreJ1} ha ganado la partida!`);
		terminarPartida(1);
		return true;
	}

	//S aun quedan pokemons en ambos equipos, devuelvo false
	return false;
}

//--------------------BOTÓN CAMBIAR--------------------

//Oculto el menú de cambio de pokemon (no hace falta vaciar innerHTML aquí porque abrirMenuCambio ya lo hace)
function cerrarMenuCambio(){

	let menu=document.getElementById("menu-cambiar");
	menu.classList.add("oculto");
	menu.innerHTML="";

	if(timeoutMenuCambio){
		clearTimeout(timeoutMenuCambio);
		timeoutMenuCambio=null;
	}
}

//Cambio el pokemon activo del jugador que tiene el turno al índice indicado
function cambiarPokemon(nuevoIndice){

	if(turno==1){
		indice1=nuevoIndice;

		//Escribo el log del cambio
		registrarLog(`${nombreJ1} cambia a ${equipo1[indice1].nombre}`);
	} 
	else{
		indice2=nuevoIndice;
		registrarLog(`${nombreJ2} cambia a ${equipo2[indice2].nombre}`);
	}

	//Refresco datos visibles y las pokeballs
	actualizarUI();
	renderPokeballs();

	//Cierro el menú de cambio ahora que ya se ha elegido pokemon
	cerrarMenuCambio();

	//Cambiar de pokemon consume el turno
	turno=turno==1?2:1;
	resaltarTurno();
}

//Relleno el menú de cambio con todos los pokemon del jugador actual que estén vivos y que NO sean el que está actualmente en combate. Si no hay opciones válidas, muestra un mensaje informativo, además, muestra el menú y programa su autocierre
function abrirMenuCambio(){

	let menu=document.getElementById("menu-cambiar");
	menu.innerHTML="";
	let {equipo:equipoActual, vidas:vidasActual, indice:indiceActual}=getJugadorActual();
	let hayOpciones=false;

	equipoActual.forEach((e, i)=>{

		//No muestro el pokemon que está peleando
		if (i===indiceActual){
			return;
		}

		//No muestro pokemons muertos
		if (vidasActual[i]<=0){
			return;
		}

		hayOpciones=true;

		//Voy creando los botones de cambio para cada pokemon
		let btn=document.createElement("button");
		btn.textContent=`${e.nombre} (HP: ${vidasActual[i]}/${e.vida})`;
		btn.className="btn-opcion-cambio";

		btn.addEventListener("click",()=>{
			cambiarPokemon(i);
		});

		menu.appendChild(btn);
	});

	//Si no hay más pokemons que se puedan cambiar, muestro un texto diciendolo
	if(!hayOpciones){
		let p=document.createElement("p");
		p.textContent="No tienes más pokémons disponibles para cambiar";
		p.style.margin="0";
		p.style.fontSize="14px";
		menu.appendChild(p);
	}

	//Muestro el menú en pantalla
	menu.classList.remove("oculto");

	clearTimeout(timeoutMenuCambio);

	timeoutMenuCambio=setTimeout(()=>{
		cerrarMenuCambio();
	}, 2500);
}

function cerrarMenuMochila(){

    let menu=document.getElementById("menu-mochila");
    menu.classList.add("oculto");

    clearTimeout(timeoutMenuMochila);
    timeoutMenuMochila=null;

}

function abrirMenuMochila(){

    let menu=document.getElementById("menu-mochila");
    menu.innerHTML="";

    let {pociones}=getJugadorActual();

    let opciones=[{tipo:"maximo", texto:"Poción Máxima"},{tipo:"hp50", texto:"Poción 50%" },{tipo:"hp25", texto:"Poción 25%"}];

    let hayOpciones=false;

    opciones.forEach((e)=>{

        //Solo muestro el botón de poción si hay ded ese tipo
        if(pociones[e.tipo]>0){
            hayOpciones=true;
            let btn=document.createElement("button");
            btn.className="btn-opcion-cambio";
            btn.textContent=`${e.texto} x${pociones[e.tipo]}`;

            //Al hacer clic, uso una poción de ese tipo
            btn.addEventListener("click",()=>usarPocion(e.tipo));
            menu.appendChild(btn);
        }
    });

    //Si no hay ninguna poción disponible, muestro un mensaje
    if (!hayOpciones) {
        let p=document.createElement("p");
        p.textContent="No te quedan pociones";
        p.style.margin="0";
        p.style.fontSize="14px";
        menu.appendChild(p);
    }

    //Muestro el menú en pantalla
    menu.classList.remove("oculto");

    //Autocerrar como el menú CAMBIAR
    clearTimeout(timeoutMenuMochila);

    timeoutMenuMochila=setTimeout(()=>{
        cerrarMenuMochila();
    }, 2500);
}

//--------------------FIN DE PARTIDA / HUIR--------------------

//Desactivo todos los botones de control (atacar, mochila, huir y cambiar)
function desactivarControles() {
    document.getElementById("btn-atacar").disabled=true;
    document.getElementById("btn-mochila").disabled=true;
    document.getElementById("btn-huir").disabled=true;
    document.getElementById("btn-cambiar").disabled=true;
    cerrarMenuCambio();
}

//Marco la partida como terminada
function terminarPartida(ganador){

    partidaTerminada=true;

    //Desactivo los controles
    desactivarControles();

    let nombreGanador=ganador===1?nombreJ1:nombreJ2;

    //Guardo en sessionStorage quién ha ganado
    sessionStorage.setItem("nombreGanador", nombreGanador);
    sessionStorage.removeItem("equiposPokemon");

    //Aplico una clase de fade-out (el efecto para pasar a victoria) al body
    setTimeout(()=>{
    document.body.classList.add("fade-out");
    }, 400);

    //Pasado un poco más de tiempo, redirecciono a victoria.html
    setTimeout(()=>{
    window.location.href="victoria.html";
    }, 1400);
}

//Permito que el jugador actual huya del combate (si huye el jugador 1, gana el jugador 2, y viceversa)
function huir(){

    if(turno==1){

        //Registro en los logs quien ha huido dde los 2
        registrarLog(`${nombreJ1} ha huido`);

        //Llamo a terminarPartida, para terminarla de verdad y redirigir a victoria
        terminarPartida(2);
    } 
    else{
        registrarLog(`${nombreJ2} ha huido`);
        terminarPartida(1);
    }
}

//--------------------INICIO--------------------

//Cuando carga la página de juego, inicializa el combate y engancha los listeners de los botones de atacar, huir, cambiar y mochila
window.onload=()=>{

    iniciarCombate();

    document.getElementById("btn-atacar").addEventListener("click", atacar);
    document.getElementById("btn-huir").addEventListener("click", huir);
    document.getElementById("btn-cambiar").addEventListener("click", abrirMenuCambio);
    document.getElementById("btn-mochila").addEventListener("click", abrirMenuMochila);
};

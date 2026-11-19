// banco de preguntas en formato JSON como pide la guia del proyecto
const preguntasJSON = [
    {
        pregunta: "¿Qué método de JavaScript se utiliza para convertir un objeto en una cadena de texto JSON?",
        opciones: [
            "JSON.parse()",
            "JSON.stringify()",
            "JSON.toObject()",
            "JSON.convert()"
        ],
        indiceCorrecto: 1
    },
    {
        pregunta: "En CSS Flexbox, ¿qué propiedad alinea los elementos hijos a lo largo del eje principal?",
        opciones: [
            "align-items",
            "flex-direction",
            "justify-content",
            "align-content"
        ],
        indiceCorrecto: 2
    },
    {
        pregunta: "¿Cuál etiqueta HTML5 es la más semántica para contener los enlaces principales de navegación?",
        opciones: [
            "<nav>",
            "<section>",
            "<header>",
            "<aside>"
        ],
        indiceCorrecto: 0
    },
    {
        pregunta: "¿Qué código de estado HTTP indica que una petición se completó con éxito?",
        opciones: [
            "404 Not Found",
            "500 Internal Server Error",
            "301 Moved Permanently",
            "200 OK"
        ],
        indiceCorrecto: 3
    },
    {
        pregunta: "En bases de datos relacionales (SQL), ¿qué cláusula se usa para filtrar registros según una condición?",
        opciones: [
            "GROUP BY",
            "ORDER BY",
            "WHERE",
            "SELECT"
        ],
        indiceCorrecto: 2
    },
    {
        pregunta: "¿Qué palabra clave en JavaScript declara una variable cuyo valor no puede ser reasignado?",
        opciones: [
            "var",
            "let",
            "static",
            "const"
        ],
        indiceCorrecto: 3
    }
];

// estado general del quiz
let indicePreguntaActual = 0;
let puntaje = 0;
let tiempoRestante = 60;
let temporizadorId = null;
let historialRespuestas = []; // aca guardo lo que contesto en cada una pa el resumen final

// referencias del DOM
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaPregunta = document.getElementById('pantalla-pregunta');
const pantallaResultados = document.getElementById('pantalla-resultados');

const botonIniciar = document.getElementById('boton-iniciar');
const botonSiguiente = document.getElementById('boton-siguiente');
const botonReiniciar = document.getElementById('boton-reiniciar');

const indicadorProgreso = document.getElementById('indicador-progreso');
const indicadorPuntaje = document.getElementById('indicador-puntaje');
const cajaTemporizador = document.getElementById('caja-temporizador');
const segundosRestantesEl = document.getElementById('segundos-restantes');
const barraProgresoRelleno = document.getElementById('barra-progreso-relleno');

const textoPregunta = document.getElementById('texto-pregunta');
const contenedorOpciones = document.getElementById('contenedor-opciones');
const mensajeRetroalimentacion = document.getElementById('mensaje-retroalimentacion');

// arranca o reinicia el juego desde cero
function iniciarQuiz() {
    indicePreguntaActual = 0;
    puntaje = 0;
    historialRespuestas = [];

    pantallaInicio.classList.add('oculto');
    pantallaResultados.classList.add('oculto');
    pantallaPregunta.classList.remove('oculto');

    cargarPregunta();
}

// pinta la pregunta actual y crea sus botones
function cargarPregunta() {
    detenerTemporizador();
    mensajeRetroalimentacion.classList.add('oculto');
    botonSiguiente.classList.add('oculto');

    const datosPregunta = preguntasJSON[indicePreguntaActual];
    const totalPreguntas = preguntasJSON.length;

    // actualizo cabecera y barra de progreso
    indicadorProgreso.textContent = `Pregunta ${indicePreguntaActual + 1} de ${totalPreguntas}`;
    indicadorPuntaje.textContent = `Puntos: ${puntaje}`;
    const porcentaje = ((indicePreguntaActual) / totalPreguntas) * 100;
    barraProgresoRelleno.style.width = `${porcentaje}%`;

    textoPregunta.textContent = datosPregunta.pregunta;
    contenedorOpciones.innerHTML = '';

    // genero un boton por cada opcion del arreglo
    datosPregunta.opciones.forEach((textoOpcion, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton-opcion';
        boton.textContent = textoOpcion;

        boton.addEventListener('click', () => seleccionarRespuesta(indice));
        contenedorOpciones.appendChild(boton);
    });

    // arranco el reloj de 1 minuto pa esta pregunta
    iniciarTemporizadorPregunta();
}

// maneja la cuenta regresiva de 60 segundos por pregunta
function iniciarTemporizadorPregunta() {
    tiempoRestante = 60;
    segundosRestantesEl.textContent = tiempoRestante;
    cajaTemporizador.classList.remove('urgente');

    temporizadorId = setInterval(() => {
        tiempoRestante--;
        segundosRestantesEl.textContent = tiempoRestante;

        if (tiempoRestante <= 10) {
            cajaTemporizador.classList.add('urgente');
        }

        // si llega a 0 sin responder, resta 1 punto y salta automatico como dice el pdf
        if (tiempoRestante <= 0) {
            detenerTemporizador();
            manejarTiempoAgotado();
        }
    }, 1000);
}

function detenerTemporizador() {
    if (temporizadorId) {
        clearInterval(temporizadorId);
        temporizadorId = null;
    }
}

// logica cuando el usuario hace clic en una opcion
function seleccionarRespuesta(indiceElegido) {
    detenerTemporizador();

    const datosPregunta = preguntasJSON[indicePreguntaActual];
    const esCorrecta = indiceElegido === datosPregunta.indiceCorrecto;
    const todosLosBotones = contenedorOpciones.querySelectorAll('.boton-opcion');

    // bloqueo todos los botones pa que no pueda cambiar su respuesta
    todosLosBotones.forEach((btn, idx) => {
        btn.disabled = true;

        // pinto de verde la correcta siempre pa que sepa cual era
        if (idx === datosPregunta.indiceCorrecto) {
            btn.classList.add('correcta');
            btn.innerHTML += ' <span>✓</span>';
        }
        // si se equivoco, pinto de rojo la que eligio
        if (idx === indiceElegido && !esCorrecta) {
            btn.classList.add('incorrecta');
            btn.innerHTML += ' <span>✗</span>';
        }
    });

    if (esCorrecta) {
        puntaje++;
        mensajeRetroalimentacion.textContent = '¡Correcto! Sumaste 1 punto.';
    } else {
        const textoCorrecto = datosPregunta.opciones[datosPregunta.indiceCorrecto];
        mensajeRetroalimentacion.textContent = `Incorrecto. La respuesta correcta era: "${textoCorrecto}".`;
    }

    indicadorPuntaje.textContent = `Puntos: ${puntaje}`;
    mensajeRetroalimentacion.classList.remove('oculto');

    // guardo el registro pa mostrarlo al final
    historialRespuestas.push({
        pregunta: datosPregunta.pregunta,
        elegida: datosPregunta.opciones[indiceElegido],
        correcta: datosPregunta.opciones[datosPregunta.indiceCorrecto],
        acerto: esCorrecta
    });

    // muestro el boton siguiente (o ver resultados si era la ultima)
    botonSiguiente.textContent = (indicePreguntaActual === preguntasJSON.length - 1) 
        ? 'Ver Resultados Finales' 
        : 'Siguiente Pregunta';
    botonSiguiente.classList.remove('oculto');
}

// si se acaban los 60s resta 1 punto y avanza solo
function manejarTiempoAgotado() {
    const datosPregunta = preguntasJSON[indicePreguntaActual];
    puntaje--;

    historialRespuestas.push({
        pregunta: datosPregunta.pregunta,
        elegida: 'Tiempo agotado (sin respuesta)',
        correcta: datosPregunta.opciones[datosPregunta.indiceCorrecto],
        acerto: false
    });

    avanzarSiguientePregunta();
}

function avanzarSiguientePregunta() {
    indicePreguntaActual++;

    if (indicePreguntaActual < preguntasJSON.length) {
        cargarPregunta();
    } else {
        mostrarPantallaFinal();
    }
}

// arma la pantalla final con la nota y todo el historial
function mostrarPantallaFinal() {
    detenerTemporizador();
    pantallaPregunta.classList.add('oculto');
    pantallaResultados.classList.remove('oculto');

    const total = preguntasJSON.length;
    const puntajeFinalEl = document.getElementById('puntaje-final-numero');
    const mensajeDesempenoEl = document.getElementById('mensaje-desempeno');
    const listaResumenEl = document.getElementById('lista-resumen-respuestas');

    puntajeFinalEl.textContent = `${puntaje} / ${total}`;

    if (puntaje === total) {
        mensajeDesempenoEl.textContent = '¡Puntaje perfecto! Dominas todos los conceptos.';
    } else if (puntaje >= total / 2) {
        mensajeDesempenoEl.textContent = '¡Buen trabajo! Aprobaste el cuestionario.';
    } else {
        mensajeDesempenoEl.textContent = 'Sigue repasando los conceptos e inténtalo nuevamente.';
    }

    // limpio y lleno el listado detallado de respuestas
    listaResumenEl.innerHTML = '';
    historialRespuestas.forEach((item, idx) => {
        const tarjetaItem = document.createElement('div');
        tarjetaItem.className = `item-resumen ${item.acerto ? 'acierto' : 'fallo'}`;

        tarjetaItem.innerHTML = `
            <p><strong>${idx + 1}. ${item.pregunta}</strong></p>
            <p class="detalle-respuesta">Tu respuesta: ${item.elegida}</p>
            ${!item.acerto ? `<p class="detalle-respuesta">Correcta: ${item.correcta}</p>` : ''}
        `;
        listaResumenEl.appendChild(tarjetaItem);
    });
}

// eventos de navegacion
botonIniciar.addEventListener('click', iniciarQuiz);
botonSiguiente.addEventListener('click', avanzarSiguientePregunta);
botonReiniciar.addEventListener('click', iniciarQuiz);
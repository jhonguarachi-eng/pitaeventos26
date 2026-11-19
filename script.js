/* ==========================================================
   PitaEventos · Lógica de la página
   1) Menú para celulares
   2) Lista de eventos (edita el arreglo EVENTOS)
   3) Cuenta regresiva en vivo
   ========================================================== */

/* ----------------------------------------------------------
   1) EVENTOS — EDITA AQUÍ
   Formato de fecha: "AAAA-MM-DDTHH:MM:SS" (hora local).
   Los eventos que ya pasaron se ocultan automáticamente.
   Los siguientes son EJEMPLOS: reemplázalos por los reales.
   ---------------------------------------------------------- */
const EVENTOS = [
  {
    nombre: "Feria científica",
    descripcion: "Exposición de proyectos de todos los cursos.",
    fecha: "2026-12-04T08:00:00",
    lugar: "Patio principal"
  },
  {
    nombre: "Campeonato deportivo interno",
    descripcion: "Finales de fútbol y básquet.",
    fecha: "2026-12-11T09:00:00",
    lugar: "Cancha polifuncional"
  },
  {
    nombre: "Reunión con padres de familia",
    descripcion: "Entrega de informes del trimestre.",
    fecha: "2026-12-18T18:30:00",
    lugar: "Salón de actos"
  },
  {
    nombre: "Celebración de fin de año",
    descripcion: "Acto de cierre y celebración escolar.",
    fecha: "2027-01-15T10:00:00",
    lugar: "Unidad Educativa"
  }
];

/* ---------- Utilidades ---------- */
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function dosDigitos(n) {
  return String(n).padStart(2, "0");
}

function calcularRestante(fecha) {
  const ms = Math.max(0, fecha - Date.now());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60
  };
}

function formatearHora(fecha) {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/* Devuelve los eventos futuros ordenados por fecha */
function eventosProximos() {
  return EVENTOS
    .map(e => ({ ...e, fechaObj: new Date(e.fecha) }))
    .filter(e => !isNaN(e.fechaObj) && e.fechaObj > Date.now())
    .sort((a, b) => a.fechaObj - b.fechaObj);
}

/* ----------------------------------------------------------
   2) Menú móvil
   ---------------------------------------------------------- */
function iniciarMenu() {
  const boton = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  if (!boton || !menu) return;

  function cambiar(abrir) {
    menu.classList.toggle("is-open", abrir);
    boton.setAttribute("aria-expanded", String(abrir));
    boton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
  }

  boton.addEventListener("click", () => {
    cambiar(boton.getAttribute("aria-expanded") !== "true");
  });

  // Cierra el menú al elegir una opción o al pulsar Escape
  menu.addEventListener("click", e => {
    if (e.target.closest("a")) cambiar(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cambiar(false);
  });
}

/* ----------------------------------------------------------
   3) Tarjeta del próximo evento + lista de agenda
   ---------------------------------------------------------- */
function pintarProximoEvento(evento) {
  const titulo = document.getElementById("next-title");
  const meta = document.getElementById("next-meta");
  const contador = document.getElementById("next-countdown");
  if (!titulo || !meta || !contador) return;

  if (!evento) {
    titulo.textContent = "Sin eventos próximos";
    meta.textContent = "Agrega eventos en el archivo script.js.";
    contador.hidden = true;
    return;
  }

  titulo.textContent = evento.nombre;
  meta.textContent = `${evento.fechaObj.getDate()} de ${MESES[evento.fechaObj.getMonth()]} · ${formatearHora(evento.fechaObj)} · ${evento.lugar}`;
  contador.hidden = false;
  contador.dataset.fecha = evento.fechaObj.getTime();
}

function pintarAgenda(lista) {
  const ol = document.getElementById("agenda");
  const vacio = document.getElementById("agenda-empty");
  if (!ol) return;

  ol.innerHTML = "";
  if (vacio) vacio.hidden = lista.length > 0;

  lista.forEach(evento => {
    const li = document.createElement("li");
    li.className = "agenda-item";
    li.dataset.fecha = evento.fechaObj.getTime();

    // textContent evita inyectar HTML si los textos tienen símbolos raros
    const fecha = document.createElement("div");
    fecha.className = "agenda-date";
    const dia = document.createElement("span");
    dia.className = "agenda-day";
    dia.textContent = dosDigitos(evento.fechaObj.getDate());
    const mes = document.createElement("span");
    mes.className = "agenda-month";
    mes.textContent = MESES[evento.fechaObj.getMonth()];
    fecha.append(dia, mes);

    const info = document.createElement("div");
    info.className = "agenda-info";
    const h4 = document.createElement("h4");
    h4.textContent = evento.nombre;
    const desc = document.createElement("p");
    desc.textContent = evento.descripcion;
    const donde = document.createElement("p");
    donde.textContent = `${formatearHora(evento.fechaObj)} · ${evento.lugar}`;
    info.append(h4, desc, donde);

    const faltan = document.createElement("p");
    faltan.className = "agenda-left";

    li.append(fecha, info, faltan);
    ol.appendChild(li);
  });
}

/* ----------------------------------------------------------
   4) Actualización de la cuenta regresiva (cada segundo)
   ---------------------------------------------------------- */
function actualizarContadores() {
  // Tarjeta principal
  const contador = document.getElementById("next-countdown");
  if (contador && contador.dataset.fecha) {
    const t = calcularRestante(Number(contador.dataset.fecha));
    Object.keys(t).forEach(unidad => {
      const el = contador.querySelector(`[data-unit="${unidad}"]`);
      if (el) el.textContent = unidad === "d" ? t[unidad] : dosDigitos(t[unidad]);
    });
  }

  // Lista de agenda
  document.querySelectorAll(".agenda-item").forEach(item => {
    const t = calcularRestante(Number(item.dataset.fecha));
    const texto = item.querySelector(".agenda-left");
    if (!texto) return;
    texto.textContent = t.d > 0
      ? `Faltan ${t.d} ${t.d === 1 ? "día" : "días"}`
      : `Faltan ${dosDigitos(t.h)}:${dosDigitos(t.m)}:${dosDigitos(t.s)}`;
  });
}

/* ----------------------------------------------------------
   Inicio
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();

  const proximos = eventosProximos();
  pintarProximoEvento(proximos[0]);
  pintarAgenda(proximos);

  actualizarContadores();
  setInterval(actualizarContadores, 1000);
});

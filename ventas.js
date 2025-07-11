const API_URL = "https://api.sheetbest.com/sheets/d2320623-59eb-42fb-88ff-5d9edce19c48";
let productos = [];

async function cargarDatos() {
  try {
    const response = await fetch(API_URL);
    productos = await response.json();
  } catch (error) {
    console.error("Error cargando los datos:", error);
  }
}

function buscarProducto() {
  const input = document.getElementById("busqueda").value.toLowerCase();
  const sugerencias = document.getElementById("sugerencias");
  const detalle = document.getElementById("detalleProducto");
  sugerencias.innerHTML = "";
  detalle.style.display = "none";

  if (input.length === 0) return;

  const coincidencias = productos.filter(p =>
    p.codigo.toLowerCase().includes(input) || p.nombre.toLowerCase().includes(input)
  );

  if (coincidencias.length === 0) {
    sugerencias.innerHTML = `<div style="color:#ff4d4d; border: 1px solid red;">❗ No se encontraron coincidencias.</div>`;
    return;
  }

  coincidencias.forEach(p => {
    const item = document.createElement("div");
    item.textContent = `${p.codigo} - ${p.nombre}`;
    item.onclick = () => mostrarDetalle(p);
    sugerencias.appendChild(item);
  });
}

function mostrarDetalle(producto) {
  const detalle = document.getElementById("detalleProducto");
  detalle.innerHTML = `
    <h2>${producto.nombre}</h2>
    <p><strong>Código:</strong> ${producto.codigo}</p>
    <p><strong>Contado:</strong> ${producto.contado}</p>
    <p><strong>3x:</strong> ${producto["3x"]}</p>
    <p><strong>6x:</strong> ${producto["6x"]}</p>
    <p><strong>13x:</strong> ${producto["13x"]}</p>
    <p><strong>25x:</strong> ${producto["25x"]}</p>
  `;
  detalle.style.display = "block";
  document.getElementById("sugerencias").innerHTML = "";
}

window.onload = cargarDatos;

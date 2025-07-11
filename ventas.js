const API_URL = 'https://api.sheetbest.com/sheets/d2320623-59eb-42fb-88ff-5d9edce19c48';

let productos = [];

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    productos = data;
  });

function buscarProducto() {
  const input = document.getElementById('busqueda');
  const valor = input.value.toLowerCase();
  const sugerencias = document.getElementById('sugerencias');
  const detalle = document.getElementById('detalleProducto');

  sugerencias.innerHTML = '';
  detalle.style.display = 'none';

  if (valor.length === 0) return;

  const resultados = productos.filter(p =>
    p.codigo.toLowerCase().includes(valor) || 
    p.nombre.toLowerCase().includes(valor)
  );

  if (resultados.length === 0) {
    sugerencias.innerHTML = `<div style="color: #ff5252; border: 1px solid #ff5252;">❗ No se encontraron coincidencias.</div>`;
    return;
  }

  resultados.forEach(producto => {
    const item = document.createElement('div');
    item.textContent = `${producto.codigo} - ${producto.nombre}`;
    item.onclick = () => mostrarDetalle(producto);
    sugerencias.appendChild(item);
  });
}

function mostrarDetalle(producto) {
  const detalle = document.getElementById('detalleProducto');
  detalle.style.display = 'block';
  detalle.innerHTML = `
    <h3>${producto.nombre}</h3>
    <p><strong>Código:</strong> ${producto.codigo}</p>
    <p><strong>Contado:</strong> ${producto.contado}</p>
    <p><strong>3x:</strong> ${producto["3x"]}</p>
    <p><strong>6x:</strong> ${producto["6x"]}</p>
    <p><strong>13x:</strong> ${producto["13x"]}</p>
    <p><strong>25x:</strong> ${producto["25x"]}</p>
  `;
}

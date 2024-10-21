class Producto {
    constructor(nombre, id, tipo, precio, stock, descripcion) {
        this.nombre = nombre;
        this.id = id;
        this.tipo = tipo;
        this.precio = Number(precio); 
        this.stock = Number(stock);   
        this.descripcion = descripcion;
    }
}

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

const mostrarToast = (mensaje) => {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #007bff, #000000)",
        }
    }).showToast();
};

const agregarProducto = ({ nombre, id, tipo, precio, stock, descripcion }) => {
    if (productos.some(prod => prod.id === id)) {
        mostrarToast(`Ya existe un producto con el ID: ${id}.`);
    } else {
        const productoNuevo = new Producto(nombre, id, tipo, precio, stock, descripcion);
        productos.push(productoNuevo);
        mostrarToast(`Producto agregado: ${nombre}`);
    }
};

const productosPreexistentes = async () => {
    if (productos.length === 0) {
        try {
            const response = await fetch('./productos.json');
            const productosData = await response.json();
            productosData.forEach(prod => agregarProducto(prod));
            localStorage.setItem("productos", JSON.stringify(productos));
        } catch (error) {
            console.error("Error cargando los productos:", error);
            mostrarToast("Error al cargar los productos.");
        }
    }
};

const totalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

const totalCarritoRender = () => {
    const carritoTotal = document.getElementById("carritoTotal");
    carritoTotal.innerHTML = `Precio total: $${totalCarrito()}`;
};

const agregarCarrito = (objetoCarrito) => {
    const existe = carrito.find(item => item.id === objetoCarrito.id);
    if (existe) {
        existe.cantidad += objetoCarrito.cantidad;
        mostrarToast(`Cantidad actualizada para ${existe.nombre}: ${existe.cantidad}`);
    } else {
        carrito.push(objetoCarrito);
        mostrarToast(`Producto agregado al carrito: ${objetoCarrito.nombre}`);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();
};

const renderizarCarrito = () => {
    const listaCarrito = document.getElementById("listaCarrito");
    listaCarrito.innerHTML = "";

    carrito.forEach(({ nombre, precio, cantidad, id }) => {
        let elementoLista = document.createElement("li");
        elementoLista.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        elementoLista.innerHTML = `
            <div>
                <strong>${nombre}</strong><br>
                P/u: $${precio} | Cantidad: ${cantidad}
            </div>
            <button class="btn btn-sm btn-danger" id="eliminarCarrito${id}">X</button>
        `;
        listaCarrito.appendChild(elementoLista);

        const botonBorrar = document.getElementById(`eliminarCarrito${id}`);
        botonBorrar.addEventListener("click", () => {
            carrito = carrito.filter(elemento => elemento.id !== id);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            renderizarCarrito();
            totalCarritoRender();
            mostrarToast(`Producto eliminado del carrito: ${nombre}`);
        });
    });
};

const borrarCarrito = () => {
    carrito.length = 0; 
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();
    mostrarToast("Carrito vaciado.");
};

const renderizarProductos = (arrayUtilizado) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = ""; 

    arrayUtilizado.forEach(({ nombre, id, tipo, precio, stock, descripcion }) => {
        const prodCard = document.createElement("div");
        prodCard.classList.add("col-md-4", "col-sm-6", "card");
        prodCard.style = "width: 100%; margin-bottom: 20px;";
        prodCard.id = id;
        prodCard.innerHTML = `
            <img src="./assets/${nombre}${id}.jpg" class="card-img-top" alt="${nombre}" onerror="this.onerror=null;this.src='./assets/default.jpg';">
            <div class="card-body">
                <h5 class="card-title">${nombre}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${tipo}</h6>
                <p class="card-text">${descripcion}</p>
                <p><strong>Stock:</strong> ${stock}</p>
                <p><strong>Precio:</strong> $${precio}</p>
                <form id="form${id}">
                    <div class="mb-3">
                        <label for="contador${id}" class="form-label">Cantidad</label>
                        <input type="number" class="form-control" id="contador${id}" min="1" max="${stock}" value="1" required>
                    </div>
                    <button class="btn btn-primary" id="botonProd${id}">Agregar</button>
                </form>
            </div>
        `;
        contenedorProductos.appendChild(prodCard);

        const btn = document.getElementById(`botonProd${id}`);
        btn.addEventListener("click", (evento) => {
            evento.preventDefault();
            const contadorInput = document.getElementById(`contador${id}`);
            const cantidad = Number(contadorInput.value);
            if (cantidad > 0 && cantidad <= stock) {
                agregarCarrito({ nombre, id, tipo, precio, stock, descripcion, cantidad });
                contadorInput.value = 1; 
            } else {
                mostrarToast("Cantidad inválida o excede el stock disponible.");
            }
        });
    });
};

const finalizarCompra = (event) => {
    event.preventDefault();
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío.");
        return;
    }

    const data = new FormData(event.target);
    const cliente = Object.fromEntries(data);
    const ticket = {
        cliente: cliente,
        total: totalCarrito(),
        id: pedidos.length + 1, 
        productos: carrito
    };
    pedidos.push(ticket);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    borrarCarrito();

    const mensaje = document.getElementById("carritoTotal");
    mensaje.innerHTML = "¡Muchas gracias por tu compra! Te esperamos pronto.";
    mostrarToast("Compra finalizada con éxito.");
};

const app = async () => {
    await productosPreexistentes();
    renderizarProductos(productos);
    renderizarCarrito();
    totalCarritoRender();
};

document.addEventListener("DOMContentLoaded", () => {
    app();

    const compraFinal = document.getElementById("formCompraFinal");
    compraFinal.addEventListener("submit", (event) => {
        finalizarCompra(event);
    });

    const selectorTipo = document.getElementById("tipoProducto");
    selectorTipo.addEventListener("change", (evt) => {
        const tipoSeleccionado = evt.target.value;
        if (tipoSeleccionado === "0") {
            renderizarProductos(productos);
        } else {
            const filtrados = productos.filter(prod => prod.tipo === tipoSeleccionado);
            renderizarProductos(filtrados);
        }
    });
});

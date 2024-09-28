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

// Array de productos base 
const productosBase = [
    {
        nombre: "Remeras",
        id: "001",
        tipo: "Prenda",
        precio: 25,
        stock: 50,
        descripcion: "Remeras de algodón de alta calidad."
    },
    {
        nombre: "Pantalones",
        id: "002",
        tipo: "Prenda",
        precio: 40,
        stock: 40,
        descripcion: "Pantalones de Jean."
    },
    {
        nombre: "Camperas",
        id: "003",
        tipo: "Prenda",
        precio: 60,
        stock: 30,
        descripcion: "Camperas Rompeviento."
    },
    {
        nombre: "Zapatillas",
        id: "004",
        tipo: "Calzado",
        precio: 80,
        stock: 20,
        descripcion: "Zapatillas de Lona."
    },
    {
        nombre: "Gorras",
        id: "005",
        tipo: "Accesorio",
        precio: 15,
        stock: 100,
        descripcion: "Gorras de Lona de alta Calidad."
    }
];

// Cargar datos desde localStorage o inicializar vacíos
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

// Función para agregar un producto al array de productos
const agregarProducto = ({ nombre, id, tipo, precio, stock, descripcion }) => {
    if (productos.some(prod => prod.id === id)) {
        console.warn(`Ya existe un producto con el ID: ${id}.`);
    } else {
        const productoNuevo = new Producto(nombre, id, tipo, precio, stock, descripcion);
        productos.push(productoNuevo);
        console.log(`Producto agregado: ${nombre}`);
    }
};

// Función para cargar productos preexistentes si el array está vacío
const productosPreexistentes = () => {
    if (productos.length === 0) {
        productosBase.forEach(prod => agregarProducto(prod));
        localStorage.setItem("productos", JSON.stringify(productos));
        console.log("Productos preexistentes cargados en localStorage.");
    } else {
        console.log("Productos cargados desde localStorage.");
    }
};

// Función para calcular el total del carrito
const totalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

// Función para renderizar el total en el DOM
const totalCarritoRender = () => {
    const carritoTotal = document.getElementById("carritoTotal");
    carritoTotal.innerHTML = `Precio total: $${totalCarrito()}`;
};

// Función para agregar productos al carrito
const agregarCarrito = (objetoCarrito) => {
    const existe = carrito.find(item => item.id === objetoCarrito.id);
    if (existe) {
        existe.cantidad += objetoCarrito.cantidad;
        console.log(`Cantidad actualizada para ${existe.nombre}: ${existe.cantidad}`);
    } else {
        carrito.push(objetoCarrito);
        console.log(`Producto agregado al carrito: ${objetoCarrito.nombre}`);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();
};

// Función para renderizar el carrito en el DOM
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

        // Añadir evento al botón de eliminar
        const botonBorrar = document.getElementById(`eliminarCarrito${id}`);
        botonBorrar.addEventListener("click", () => {
            carrito = carrito.filter(elemento => elemento.id !== id);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            renderizarCarrito();
            totalCarritoRender();
            console.log(`Producto eliminado del carrito: ${nombre}`);
        });
    });
};

// Función para borrar todo el carrito
const borrarCarrito = () => {
    carrito.length = 0; 
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    totalCarritoRender();
    console.log("Carrito vaciado.");
};

// Función para renderizar los productos en el DOM
const renderizarProductos = (arrayUtilizado) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = ""; 

    arrayUtilizado.forEach(({ nombre, id, tipo, precio, stock, descripcion }) => {
        const prodCard = document.createElement("div");
        prodCard.classList.add("col-md-4", "col-sm-6");
        prodCard.classList.add("card");
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

        // Añadir evento al botón de agregar
        const btn = document.getElementById(`botonProd${id}`);
        btn.addEventListener("click", (evento) => {
            evento.preventDefault();
            const contadorInput = document.getElementById(`contador${id}`);
            const cantidad = Number(contadorInput.value);
            if (cantidad > 0 && cantidad <= stock) {
                agregarCarrito({ nombre, id, tipo, precio, stock, descripcion, cantidad });
                contadorInput.value = 1; 
            } else {
                alert("Cantidad inválida o excede el stock disponible.");
            }
        });
    });
};

// Función para finalizar la compra
const finalizarCompra = (event) => {
    event.preventDefault();
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
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
    alert("Compra finalizada exitosamente.");
    console.log("Pedido realizado:", ticket);
};

// Función principal de la aplicación
const app = () => {
    productosPreexistentes();
    renderizarProductos(productos);
    renderizarCarrito();
    totalCarritoRender();
};

// Ejecutar la aplicación una vez que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    app();

    // Evento para finalizar la compra
    const compraFinal = document.getElementById("formCompraFinal");
    compraFinal.addEventListener("submit", (event) => {
        finalizarCompra(event);
    });

    // Evento para filtrar productos por tipo
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

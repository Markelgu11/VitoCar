/* global listElem */

let db;

init();

async function init() {
    db = await idb.openDb('VitoCarDb', 1, db => {
        //libros
        db.createObjectStore('books', {keyPath: 'name'});

        //viajes
        db.createObjectStore('viajes', {keyPath: 'idViaje', autoIncrement: true});

        //usuarios
        db.createObjectStore('usuarios', {keyPath: 'dni'});

    });

    list();
}


async function list() {
    let tx = db.transaction('usuarios');
    let usuariosStore = tx.objectStore('usuarios');

    let usuarios = await usuariosStore.getAll();

    if (usuarios.length) {
        listElem.innerHTML = usuarios.map(usuario => `<li>
        dni: ${usuario.dni}, nombre: ${usuario.nombre}, email: ${usuario.email}, 
        password: ${usuario.password} , imagen: ${usuario.imagen}, 
        modelo: ${usuario.modelo}, telefono: ${usuario.telefono}
      </li>`).join('');
    } else {
        listElem.innerHTML = '<li>No hay usuarios todavia. Por favor, añade usuarios.</li>';
    }

}


async function clearBooks() {
    let tx = db.transaction('usuarios', 'readwrite');
    await tx.objectStore('usuarios').clear();
    await list();
}


//no modificar
async function addBook() {

    //let name = prompt("Book name?");

    if (document.getElementById("fname").value === "")
        alert("MAL!");
    else
    {
        let name = document.getElementById("fname").value;

        let price = +prompt("Book price?");

        let tx = db.transaction('books', 'readwrite');

        try {
            await tx.objectStore('books').add({name, price});
            await list();
        } catch (err) {
            if (err.name === 'ConstraintError') {
                alert("Such book exists already");
                await addBook();
            } else {
                throw err;
            }
        }
    }
}


// Acepta NIEs (Extranjeros con X, Y o Z al principio)
function validarDNI(dni) {
    var numero, let, letra;
    var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;

    dni = dni.toUpperCase();

    if(expresion_regular_dni.test(dni) === true){
        numero = dni.substr(0,dni.length-1);
        numero = numero.replace('X', 0);
        numero = numero.replace('Y', 1);
        numero = numero.replace('Z', 2);
        let = dni.substr(dni.length-1, 1);
        numero = numero % 23;
        letra = 'TRWAGMYFPDXBNJZSQVHLCKET';
        letra = letra.substring(numero, numero+1);
        if (letra !== let) {
            //alert('Dni erroneo, la letra del NIF no se corresponde');
            return false;
        }else{
            //alert('Dni correcto');
            return true;
        }
    }else{
        //alert('Dni erroneo, formato no válido');
        return false;
    }
}

async function addUsuario() {

    let dni = document.getElementById("dni").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let nombre = document.getElementById("nombre").value;
    //Aqui deberiamos usar en el formulario un examinar
    let imagen = document.getElementById("imagen").value;
    let modelo = document.getElementById("modelo").value;
    let telefono = document.getElementById("telefono").value;


    if (validarDNI(dni))
    {
        let tx = db.transaction('usuarios', 'readwrite');

        try {
            await tx.objectStore('usuarios').add({dni, email, password, nombre, imagen, modelo, telefono});
            await list();
        } catch (err) {
            if (err.name === 'ConstraintError') {
                alert("Ese usuario ya existe!");
                await addUsuario();
            } else {
                throw err;
            }
        }
    }
    else
    {
        alert("FALLO EN EL DNI!");
    }
}

async function addViaje() {

    let idViaje = document.getElementById("idViaje").value;
    let origen = document.getElementById("origen").value;
    let destino = document.getElementById("destino").value;
    let fechaHora = document.getElementById("fechaHora").value;
    let precio = document.getElementById("precio").value;
    let DNIConductor = document.getElementById("DNIConductor").value;


    if (validarDNI(DNIConductor))
    {
        let tx = db.transaction('viajes', 'readwrite');

        try {
            await tx.objectStore('viajes').add({idViaje, origen, destino, 
                                                fechaHora, precio, DNIConductor});
            await list();
        } catch (err) {
            if (err.name === 'ConstraintError') {
                alert("Ese viaje ya existe!");
                await addViaje();
            } else {
                throw err;
            }
        }
    }
    else
    {
        invalid("FALLO EN EL DNI!");
    }
}

window.addEventListener('unhandledrejection', event => {
    alert("Error: " + event.reason.message);
});


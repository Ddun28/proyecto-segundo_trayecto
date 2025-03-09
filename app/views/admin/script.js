document.addEventListener('DOMContentLoaded', function () {
    const fullName = localStorage.getItem('fullName');

    // Mostrar el nombre completo en el navbar
    if (fullName) {
        const fullNameElement = document.getElementById('fullName');
        if (fullNameElement) {
            fullNameElement.textContent = `Bienvenido, ${fullName}`;
        }
    }

    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol'); 

    if (token) {
        const asistenciaLink = document.getElementById('asistenciaLink');
        asistenciaLink.href += encodeURIComponent(token, rol); 
    }

    if (!token || rol !== 'admin') {
        // Redirigir al usuario si no tiene token o no es admin
        window.location.href = '../auth/login.html';
    }

    // Función para actualizar la fecha
    function updateNewOrderDate() {
        const dateElement = document.getElementById('newOrderDate');
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`; // Formato DD/MM/YYYY
        dateElement.textContent = formattedDate; // Actualiza la fecha
    }

    updateNewOrderDate();

    const usersTableBody = document.getElementById('usersTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');    

    function fetchAndUpdateAsistencias() {
        fetch('../../controllers/AsistenciaController.php?action=getAsistenciasHoy')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar el contador de asistencias
                    const totalAsistenciasElement = document.getElementById('totalAsistencias');
                    totalAsistenciasElement.textContent = data.totalAsistencias.length;
    
                    // Actualizar la lista de asistencias
                    const asistenciaList = document.getElementById('asistenciaList');
                    asistenciaList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos
    
                    data.totalAsistencias.forEach(asistencia => {
                        const li = document.createElement('li');
                        li.className = asistencia.hora_salida ? 'completed' : 'not-completed';
    
                        const p = document.createElement('p');
                        p.innerHTML = `
                            <strong>${asistencia.name} ${asistencia.lastname}</strong><br>
                            <small>Llegada: ${asistencia.hora_llegada}</small><br>
                            <small>Salida: ${asistencia.hora_salida || 'Pendiente'}</small>
                        `;
    
                        const eliminarButton = document.createElement('button');
                        eliminarButton.textContent = 'Eliminar';
    
                        // Aplicar estilos manuales
                        eliminarButton.style.backgroundColor = '#dc3545';
                        eliminarButton.style.color = '#fff';
                        eliminarButton.style.border = 'none';
                        eliminarButton.style.borderRadius = '4px';
                        eliminarButton.style.padding = '8px 16px';
                        eliminarButton.style.fontSize = '14px';
                        eliminarButton.style.cursor = 'pointer';
                        eliminarButton.style.transition = 'background-color 0.3s ease';
    
                        // Efecto hover
                        eliminarButton.addEventListener('mouseover', () => {
                            eliminarButton.style.backgroundColor = '#c82333';
                        });
    
                        // Efecto al quitar el mouse
                        eliminarButton.addEventListener('mouseout', () => {
                            eliminarButton.style.backgroundColor = '#dc3545';
                        });
                        eliminarButton.addEventListener('click', function () {
                            Swal.fire({
                                title: '¿Estás seguro de que deseas eliminar esta asistencia?',
                                text: 'Esta acción no se puede deshacer.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Sí, eliminar',
                                cancelButtonText: 'Cancelar'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    eliminarAsistencia(asistencia.id);
                                }
                            });
                        });
    
                        // Agregar los elementos al li
                        li.appendChild(p);
                        li.appendChild(eliminarButton);
                        asistenciaList.appendChild(li);
                    });
                } else {
                    console.error('Error al obtener asistencias:', data.error);
                }
            })
            .catch(error => {
                console.error('Error de conexión:', error);
            });
    }
    
    // Llamar a la función para cargar y actualizar las asistencias
    fetchAndUpdateAsistencias();

    function eliminarAsistencia(id) {
        fetch(`../../controllers/AsistenciaController.php?action=deleteAsistencia`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id }) // Enviar el ID en el cuerpo
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Asistencia eliminada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchAndUpdateAsistencias(); // Recargar la lista de asistencias
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar la asistencia',
                    text: data.error
                });
            }
        })
        .catch(error => {
            console.error('Error al eliminar la asistencia:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar la asistencia',
                text: 'Hubo un error al eliminar la asistencia. Verifica la consola para más detalles.'
            });
        });
    }

    // Función para cargar los usuarios en la tabla
    function loadUsers() {
        fetch(`../../controllers/UserController.php?action=getAllUsers`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('La respuesta no es un array válido');
                }
                const usersTableBody = document.getElementById('usersTableBody');
                usersTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
    
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.lastname}</td>
                        <td>${user.ci}</td>
                        <td>${user.cargo}</td> <!-- Nuevo campo cargo -->
                        <td>
                            <button class="editBtn" data-id="${user.id}">Editar</button>
                            <button class="deleteBtn" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    usersTableBody.appendChild(row);
                });
    
                updateUserCount(data.length);
    
                // Estilizar los botones
                styleButtons();
    
                // Agregar eventos a los botones de eliminar
                document.querySelectorAll('.deleteBtn').forEach(button => {
                    button.addEventListener('click', function () {
                        const userId = this.getAttribute('data-id');
                        deleteUser(userId);
                    });
                });
    
                // Agregar eventos a los botones de editar
                document.querySelectorAll('.editBtn').forEach(button => {
                    button.addEventListener('click', function () {
                        const userId = this.getAttribute('data-id');
                        fetch(`../../controllers/UserController.php?action=getUserById&id=${userId}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Error en la solicitud: ' + response.statusText);
                                }
                                return response.json();
                            })
                            .then(user => {
                                openEditModal(user);
                            })
                            .catch(error => {
                                console.error('Error al obtener los datos del usuario:', error);
                            });
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar los usuarios:', error);
                alert('Hubo un error al cargar los usuarios. Verifica la consola para más detalles.');
            });
    }

    // Función para actualizar la cantidad de usuarios
    function updateUserCount(count) {
        const userCountElement = document.getElementById('userCount');
        userCountElement.textContent = count; // Actualiza el número de usuarios
    }

    // Función para estilizar los botones
    function styleButtons() {
        const deleteButtons = document.querySelectorAll('.deleteBtn');
        const editButtons = document.querySelectorAll('.editBtn');

        deleteButtons.forEach(button => {
            button.style.backgroundColor = '#dc3545'; // Rojo
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.padding = '10px 15px';
            button.style.cursor = 'pointer';
            button.style.transition = 'background-color 0.3s';
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#c82333'; // Rojo oscuro
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#dc3545'; // Rojo
            });
        });

        editButtons.forEach(button => {
            button.style.backgroundColor = '#007bff'; // Azul
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.padding = '10px 15px';
            button.style.cursor = 'pointer';
            button.style.transition = 'background-color 0.3s';
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#0056b3'; // Azul oscuro
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#007bff'; // Azul
            });
        });
    }

    // Función para eliminar un usuario
    function deleteUser (userId) {
        Swal.fire({
            title: '¿Estás seguro de que deseas eliminar este usuario?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`../../controllers/UserController.php?action=deleteUser `, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: userId }) // Enviar el ID en el cuerpo
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la solicitud: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Usuario eliminado correctamente',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        loadUsers(); // Recargar la tabla después de eliminar
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar el usuario',
                            text: data.error || 'Hubo un error al eliminar el usuario.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el usuario:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al eliminar el usuario. Verifica la consola para más detalles.'
                    });
                });
            }
        });
    }

   // Función para abrir el modal
   function openEditModal(user) {
    const modal = document.getElementById('editUserModal');
    const editName = document.getElementById('editName');
    const editLastname = document.getElementById('editLastname');
    const editCi = document.getElementById('editCi');
    const editRol = document.getElementById('editRol');
    const editCargo = document.getElementById('editCargo');

    // Llenar los campos del modal con los datos del usuario
    editName.value = user.name;
    editLastname.value = user.lastname;
    editCi.value = user.ci;
    editRol.value = user.rol;
    editCargo.value = user.cargo;

    // Mostrar el modal
    modal.classList.add('open');

    // Cerrar el modal cuando se hace clic en la 'x'
    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', function () {
        modal.classList.remove('open');
    });

    // Cerrar el modal cuando se hace clic fuera del modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.remove('open');
        }
    });

    // Manejar el envío del formulario
    const editUserForm = document.getElementById('editUserForm');
    editUserForm.addEventListener('submit', function (event) {
        event.preventDefault();
        saveUserChanges(user.id);
    });
}

function saveUserChanges(userId) {
    const editName = document.getElementById('editName').value;
    const editLastname = document.getElementById('editLastname').value;
    const editCi = document.getElementById('editCi').value;
    const editRol = document.getElementById('editRol').value;
    const editCargo = document.getElementById('editCargo').value;

    const updatedUser = {
        id: userId,
        name: editName,
        lastname: editLastname,
        ci: editCi,
        rol: editRol,
        cargo: editCargo
    };

    fetch(`../../controllers/UserController.php?action=updateUser`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar toast con SweetAlert2
            Swal.fire({
                position: 'top-end', // Posición del toast
                icon: 'success', // Icono de éxito
                title: 'Usuario actualizado correctamente',
                showConfirmButton: false, // No mostrar botón de confirmación
                timer: 3000 // Duración del toast (3 segundos)
            });
            loadUsers(); // Recargar la tabla después de actualizar
            document.getElementById('editUserModal').style.display = 'none';
            location.reload(); // Cerrar el modal
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al actualizar el usuario'
            });
        }
    })
    .catch(error => {
        console.error('Error al actualizar el usuario:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al actualizar el usuario. Verifica la consola para más detalles.'
        });
    });
}

    // Evento para buscar usuarios
    searchIcon.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query) {
            fetch(`../../../controllers/UserController.php?action=getAllUsers&query=${query}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la solicitud: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data)) {
                        throw new Error('La respuesta no es un array válido');
                    }
                    usersTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
                    data.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.name}</td>
                            <td>${user.lastname}</td>
                            <td>${user.ci}</td>
                            <td>
                                <button class="deleteBtn" data-id="${user.id}">Eliminar</button>
                            </td>
                        `;
                        usersTableBody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Error al buscar usuarios:', error);
                });
        } else {
            loadUsers();
        }
    });

    fetchAndUpdateAsistencias();
    loadUsers();
});


function openFilterModal() {
    Swal.fire({
        title: 'Filtrar Asistencias',
        text: 'Selecciona un período:',
        showCancelButton: false, // Ocultar el botón de cancelar
        showConfirmButton: false, // Ocultar el botón "OK"
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        html: `
            <div>
                <button id="filterDay" class="swal2-confirm swal2-styled">Por Día</button>
                <button id="filterWeek" class="swal2-confirm swal2-styled">Por Semana</button>
                <button id="filterMonth" class="swal2-confirm swal2-styled">Por Mes</button>
            </div>
        `,
        focusConfirm: false,
        didOpen: () => {
            // Configurar el evento para el botón "Por Día"
            document.getElementById('filterDay').onclick = () => {
                Swal.close(); // Cerrar el modal
                filterAsistencias('day'); // Aplicar el filtro de día
            };

            // Configurar el evento para el botón "Por Semana"
            document.getElementById('filterWeek').onclick = () => {
                Swal.close(); // Cerrar el modal
                filterAsistencias('week'); // Aplicar el filtro de semana
            };

            // Configurar el evento para el botón "Por Mes"
            document.getElementById('filterMonth').onclick = () => {
                Swal.close(); // Cerrar el modal
                filterAsistencias('month'); // Aplicar el filtro de mes
            };
        }
    });
}

function filterAsistencias(period) {
    const asistenciaList = document.getElementById('asistenciaList');
    const totalAsistenciasElement = document.getElementById('totalAsistencias');

    // Limpiar la lista antes de cargar nuevas asistencias
    asistenciaList.innerHTML = '<li>Cargando asistencias...</li>';
    totalAsistenciasElement.textContent = '0';

    // Realizar la solicitud al servidor
    fetch(`../../controllers/AsistenciaController.php?action=getAsistencias&filter=${period}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpiar la lista antes de agregar nuevos elementos
                asistenciaList.innerHTML = '';

                // Actualizar el contador de asistencias
                totalAsistenciasElement.textContent = data.asistencias.length;

                // Agregar las asistencias filtradas a la lista
                data.asistencias.forEach(asistencia => {
                    const li = document.createElement('li');
                    li.className = asistencia.hora_salida ? 'completed' : 'not-completed';

                    const p = document.createElement('p');
                    p.innerHTML = `
                        <strong>${asistencia.name} ${asistencia.lastname}</strong><br>
                        <small>Llegada: ${asistencia.hora_llegada}</small><br>
                        <small>Salida: ${asistencia.hora_salida || 'Pendiente'}</small>
                    `;

                    const eliminarButton = document.createElement('button');
                    eliminarButton.textContent = 'Eliminar';

                    // Aplicar estilos manuales
                    eliminarButton.style.backgroundColor = '#dc3545';
                    eliminarButton.style.color = '#fff';
                    eliminarButton.style.border = 'none';
                    eliminarButton.style.borderRadius = '4px';
                    eliminarButton.style.padding = '8px 16px';
                    eliminarButton.style.fontSize = '14px';
                    eliminarButton.style.cursor = 'pointer';
                    eliminarButton.style.transition = 'background-color 0.3s ease';

                    // Efecto hover
                    eliminarButton.addEventListener('mouseover', () => {
                        eliminarButton.style.backgroundColor = '#c82333';
                    });

                    // Efecto al quitar el mouse
                    eliminarButton.addEventListener('mouseout', () => {
                        eliminarButton.style.backgroundColor = '#dc3545';
                    });

                    // Agregar evento de clic
                    eliminarButton.addEventListener('click', function () {
                        Swal.fire({
                            title: '¿Estás seguro de que deseas eliminar esta asistencia?',
                            text: 'Esta acción no se puede deshacer.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                eliminarAsistencia(asistencia.id);
                            }
                        });
                    });

                    // Agregar los elementos al li
                    li.appendChild(p);
                    li.appendChild(eliminarButton);
                    asistenciaList.appendChild(li);
                });
            } else {
                console.error('Error al obtener asistencias:', data.error);
                asistenciaList.innerHTML = '<li>No se encontraron asistencias.</li>';
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            asistenciaList.innerHTML = '<li>Error al cargar las asistencias.</li>';
        });
}

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Búsqueda en el navbar
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');


// Ajustes para pantallas pequeñas
if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchForm.classList.remove('show');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchForm.classList.remove('show');
    }
});

// Modo oscuro
const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});


document.addEventListener('DOMContentLoaded', function () {

    // Logout con SweetAlert2
    const logoutButton = document.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();

            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas cerrar sesión?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    window.location.href = '../auth/login.html';
                }
            });
        });
    }
});

document.getElementById('generatePdf').addEventListener('click', function () {
    // Verificar si jsPDF está disponible
    if (!window.jspdf) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La librería jsPDF no está cargada.'
        });
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Asistencias', 10, 10);

    // Subtítulo con la fecha
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    doc.text(`Fecha: ${formattedDate}`, 10, 20);

    // Obtener la lista de asistencias
    const asistenciaList = document.getElementById('asistenciaList');
    if (!asistenciaList) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró la lista de asistencias.'
        });
        return;
    }

    const asistencias = asistenciaList.getElementsByTagName('li');
    if (asistencias.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No hay asistencias para generar el PDF.'
        });
        return;
    }

    // Preparar los datos para la tabla
    const data = [];
    for (let i = 0; i < asistencias.length; i++) {
        const asistencia = asistencias[i].querySelector('p').innerText;
        const [nombre, llegada, salida] = asistencia.split('\n'); // Dividir el texto en partes
        data.push([
            nombre.trim().replace('<strong>', '').replace('</strong>', ''), // Limpiar etiquetas HTML
            llegada.trim().replace('<small>', '').replace('</small>', ''), // Limpiar etiquetas HTML
            salida.trim().replace('<small>', '').replace('</small>', '') // Limpiar etiquetas HTML
        ]);
    }

    // Crear la tabla
    doc.autoTable({
        startY: 30, // Posición vertical inicial
        head: [['Nombre', 'Hora de Llegada', 'Hora de Salida']], // Encabezados de la tabla
        body: data, // Datos de la tabla
        theme: 'striped', // Estilo de la tabla
        styles: {
            fontSize: 10, // Tamaño de la fuente
            cellPadding: 3, // Espaciado interno de las celdas
        },
        headStyles: {
            fillColor: [40, 40, 40], // Color de fondo del encabezado
            textColor: [255, 255, 255], // Color del texto del encabezado
        },
    });

    // Guardar el PDF
    doc.save('reporte_asistencias.pdf');

    // Notificar al usuario
    Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: 'El reporte de asistencias se ha generado correctamente.',
        showConfirmButton: false,
        timer: 1500
    });
});
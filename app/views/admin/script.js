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
    const rol = localStorage.getItem('rol'); // Asegúrate de almacenar el rol en el localStorage

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

    function updateTotalAsistencias() {
        fetch('../../controllers/AsistenciaController.php?action=getAsistenciasHoy')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const totalAsistenciasElement = document.getElementById('totalAsistencias');
                    totalAsistenciasElement.textContent = data.totalAsistencias; // Actualizar el total
                } else {
                    console.error('Error al obtener el total de asistencias:', data.error);
                }
            })
            .catch(error => {
                console.error('Error de conexión:', error);
            });
    }
    updateTotalAsistencias();

    function fetchAsistencias() {
        fetch('../../controllers/AsistenciaController.php?action=getAsistencias')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const asistenciaList = document.getElementById('asistenciaList');
                    asistenciaList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos
    
                    data.asistencias.forEach(asistencia => {
                        const li = document.createElement('li');
                        li.className = asistencia.hora_salida ? 'completed' : 'not-completed';
    
                        const p = document.createElement('p');
                        p.innerHTML = `
                            <strong>${asistencia.name} ${asistencia.lastname}</strong><br>
                            <small>Llegada: ${asistencia.hora_llegada}</small><br>
                            <small>Salida: ${asistencia.hora_salida || 'Pendiente'}</small>
                        `;
    
                        // Crear el botón de eliminar
                        const eliminarButton = document.createElement('button');
                        eliminarButton.className = 'deleteBtn';
                        eliminarButton.textContent = 'Eliminar';
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
    
    // Función para eliminar una asistencia
    function eliminarAsistencia(id) {
        fetch(`../../controllers/AsistenciaController.php?action=deleteAsistencia&id=${id}`, {
            method: 'DELETE'
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
                fetchAsistencias(); // Recargar la lista de asistencias
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
                usersTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar nuevos datos
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.lastname}</td>
                        <td>${user.ci}</td>
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
                                alert('Hubo un error al obtener los datos del usuario. Verifica la consola para más detalles.');
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
    function deleteUser(userId) {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            fetch(`../../../controllers/UserController.php?action=deleteUser&id=${userId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la solicitud: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert('Usuario eliminado correctamente');
                        loadUsers(); // Recargar la tabla después de eliminar
                    } else {
                        alert('Error al eliminar el usuario');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el usuario:', error);
                    alert('Hubo un error al eliminar el usuario. Verifica la consola para más detalles.');
                });
        }
    }

   // Función para abrir el modal
function openEditModal(user) {
    const modal = document.getElementById('editUserModal');
    const editName = document.getElementById('editName');
    const editLastname = document.getElementById('editLastname');
    const editCi = document.getElementById('editCi');

    // Llenar los campos del modal con los datos del usuario
    editName.value = user.name;
    editLastname.value = user.lastname;
    editCi.value = user.ci;

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

    const updatedUser = {
        id: userId,
        name: editName,
        lastname: editLastname,
        ci: editCi,
        rol: editRol
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
            document.getElementById('editUserModal').style.display = 'none'; // Cerrar el modal
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
                    alert('Hubo un error al buscar usuarios. Verifica la consola para más detalles.');
                });
        } else {
            loadUsers();
        }
    });

    fetchAsistencias();
    loadUsers();
});

// Código para el sidebar, búsqueda y modo oscuro
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
    });
});
function openFilterModal() {
    // Variable para almacenar el período seleccionado
    let selectedPeriod = null;

    Swal.fire({
        title: 'Filtrar Asistencias',
        text: 'Selecciona un período:',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aplicar',
        html: `
            <div>
                <button id="filterDay" class="swal2-confirm swal2-styled">Por Día</button>
                <button id="filterWeek" class="swal2-confirm swal2-styled">Por Semana</button>
                <button id="filterMonth" class="swal2-confirm swal2-styled">Por Mes</button>
            </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
            return new Promise((resolve) => {
                // Asignar el evento de clic a cada botón
                document.getElementById('filterDay').onclick = () => {
                    selectedPeriod = 'day';
                    resolve(selectedPeriod); // Resolver la promesa con el período seleccionado
                };
                document.getElementById('filterWeek').onclick = () => {
                    selectedPeriod = 'week';
                    resolve(selectedPeriod); // Resolver la promesa con el período seleccionado
                };
                document.getElementById('filterMonth').onclick = () => {
                    selectedPeriod = 'month';
                    resolve(selectedPeriod); // Resolver la promesa con el período seleccionado
                };
            });
        }
    }).then((result) => {
        // Solo ejecutar el filtro si se ha seleccionado un período
        if (result.value) {
            filterAsistencias(result.value); // Llamar a la función de filtrado con el período seleccionado
        }
    });
}

function filterAsistencias(period) {
    fetch(`../../controllers/AsistenciaController.php?action=getAsistencias&filter=${period}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const asistenciaList = document.getElementById('asistenciaList');
                asistenciaList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

                data.asistencias.forEach(asistencia => {
                    const li = document.createElement('li');
                    li.className = asistencia.hora_salida ? 'completed' : 'not-completed';

                    const p = document.createElement('p');
                    p.innerHTML = `
                        <strong>${asistencia.name} ${asistencia.lastname}</strong><br>
                        <small>Llegada: ${asistencia.hora_llegada}</small><br>
                        <small>Salida: ${asistencia.hora_salida || 'Pendiente'}</small>
                    `;

                    // Crear el botón de eliminar
                    const eliminarButton = document.createElement('button');
                    eliminarButton.className = 'deleteBtn';
                    eliminarButton.textContent = 'Eliminar';
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

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// Ajustes para pantallas pequeñas
if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
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
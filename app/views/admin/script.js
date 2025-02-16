document.addEventListener('DOMContentLoaded', function () {

	const token = localStorage.getItem('token');
    
    if (!token) {
        // Si no hay token, redirigir al usuario a la página de inicio de sesión
        window.location.href = '../auth/login.html';
    }

	// Función para actualizar la fecha
function updateNewOrderDate() {
    const dateElement = document.getElementById('newOrderDate'); // Cambia a getElementById
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`; // Formato DD/MM/YYYY
    dateElement.textContent = formattedDate; // Actualiza la fecha
}

updateNewOrderDate();
    const usersTableBody = document.getElementById('usersTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');

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
			
				updateUserCount(data.length)

                // Estilizar los botones
                styleButtons();

                // Agregar eventos a los botones de eliminar
                document.querySelectorAll('.deleteBtn').forEach(button => {
                    button.addEventListener('click', function () {
                        const userId = this.getAttribute('data-id');
                        deleteUser (userId);
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
    const userCountElement = document.getElementById('userCount'); // Asegúrate de que este ID coincida con tu HTML
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
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            fetch(`../../../controllers/UserController.php?action=deleteUser &id=${userId}`, {
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

    // Evento para buscar usuarios
    searchIcon.addEventListener('click', function () {
        const query = searchInput.value.trim();
        if (query) {
            // Si hay una consulta, filtrar los usuarios
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
            // Si no hay consulta, cargar todos los usuarios
            loadUsers();
        }
    });

    // Cargar los usuarios al iniciar la página
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

function logout() {
	// Confirmar con el usuario antes de cerrar sesión
	const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
	
	if (confirmLogout) {
		// Verificar si el token existe
		const token = localStorage.getItem('token');
		
		if (token) {
			// Eliminar el token del localStorage
			localStorage.removeItem('token');
		}
		
		// Redirigir al usuario a la página de inicio de sesión
		window.location.href = '../auth/login.html';
	}
}
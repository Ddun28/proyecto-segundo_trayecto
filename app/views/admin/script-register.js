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
    
    const registerUserForm = document.getElementById('registerUserForm');

    registerUserForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Obtener los valores del formulario
        const name = document.getElementById('name').value;
        const lastname = document.getElementById('lastname').value;
        const ci = document.getElementById('ci').value;
        const rol = document.getElementById('rol').value;
        const cargo = document.getElementById('cargo').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden'
            });
            return;
        }

        // Crear el objeto con los datos del usuario
        const userData = {
            name: name,
            lastname: lastname,
            ci: ci,
            rol: rol,
            cargo: cargo,
            password: password
        };

        // Enviar los datos al servidor
        fetch('../../controllers/UserController.php?action=createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
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
                    title: 'Éxito',
                    text: 'Empleado registrado correctamente'
                });
                registerUserForm.reset(); // Limpiar el formulario
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al registrar el empleado'
                });
            }
        })
        .catch(error => {
            console.error('Error al registrar el empleado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al registrar el empleado. Verifica la consola para más detalles.'
            });
        });
    });
})

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
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
    })
}
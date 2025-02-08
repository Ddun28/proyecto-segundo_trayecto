<?php
// public/register_user.php

require '../../../config/database.php';
require '../../controllers/UserController.php';

// Crear una instancia del controlador de usuarios
$userController = new UserController($pdo);

// Verificar si se recibió una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $name = $_POST['name'];
    $lastname = $_POST['lastname'];
    $ci = $_POST['ci'];
    $rol = $_POST['rol'];
    $password = $_POST['password']; // Obtener la contraseña

    // Validar los datos (opcional)
    if (empty($name) || empty($lastname) || empty($ci) || empty($rol) || empty($password)) {
        echo "Todos los campos son obligatorios.";
        exit;
    }

    // Crear el usuario
    try {
        $userId = $userController->createUser ($name, $lastname, $ci, $rol, $password);
         "Usuario creado con ID: " . $userId;
    } catch (Exception $e) {
        echo "Error al crear el usuario: " . $e->getMessage();
    }
} else {
    echo "Método no permitido.";
}
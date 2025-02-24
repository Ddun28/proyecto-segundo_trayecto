<?php
require '../../../config/database.php';

header('Content-Type: application/json'); // Asegúrate de que la respuesta sea JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $ci = $_POST['ci'];
    $password = $_POST['password'];

    // Validar los datos
    if (empty($ci) || empty($password)) {
        echo json_encode(['error' => 'Cédula y contraseña son obligatorios.']);
        exit;
    }

    // Consultar la base de datos para verificar las credenciales
    $stmt = $pdo->prepare("SELECT id, name, lastname, password, ci, rol FROM user WHERE ci = :ci");
    $stmt->execute(['ci' => $ci]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Verificar si el rol es 'admin'
        if ($user['rol'] !== 'admin') {
            echo json_encode(['error' => 'Acceso denegado. Solo los administradores pueden iniciar sesión.']);
            exit;
        }
        // Generar un token (puedes usar JWT o cualquier otro método)
        $token = bin2hex(random_bytes(16)); // Ejemplo simple de token

        // Obtener el nombre completo del usuario
        $fullName = $user['name'] . ' ' . $user['lastname'];
        $rol = $user['rol']; // Obtener el rol del usuario

        // Devolver el token y el nombre completo del usuario como respuesta
        echo json_encode([
            'token' => $token,
            'fullName' => $fullName, // Incluir el nombre completo del usuario
            'rol' => $rol // Incluir el rol del usuario
        ]);
    } else {
        echo json_encode(['error' => 'Credenciales incorrectas.']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido.']);
}
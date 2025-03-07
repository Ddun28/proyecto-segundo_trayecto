<?php
// controllers/UserController.php

require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct($pdo) {
        $this->userModel = new User($pdo);
    }

    // Método para crear un nuevo usuario
    public function createUser($name, $lastname, $ci, $rol, $password, $cargo) {
        return $this->userModel->create($name, $lastname, $ci, $rol, $password, $cargo);
    }

    // Método para obtener todos los usuarios (con búsqueda opcional)
    public function getAllUsers($query = '') {
        $users = $this->userModel->getAll();
        if (!empty($query)) {
            $users = array_filter($users, function ($user) use ($query) {
                return stripos($user['name'], $query) !== false ||
                       stripos($user['lastname'], $query) !== false ||
                       stripos($user['ci'], $query) !== false ||
                       stripos($user['cargo'], $query) !== false;
            });
        }
        return array_values($users); // Reindexar el array
    }

    // Método para obtener un usuario por ID
    public function getUserById($id) {
        return $this->userModel->getById($id);
    }

    // Método para actualizar un usuario
    public function updateUser($id, $name, $lastname, $ci, $rol, $cargo) {
        return $this->userModel->update($id, $name, $lastname, $ci, $rol, $cargo);
    }

    // Método para eliminar un usuario
    public function deleteUser($id) {
        return $this->userModel->delete($id);
    }

    // Método para manejar las solicitudes
    public function handleRequest() {
        header('Content-Type: application/json'); // Establecer el tipo de respuesta como JSON
    
        $action = $_GET['action'] ?? '';
    
        try {
            switch ($action) {
                case 'createUser':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (empty($data['name']) || empty($data['lastname']) || empty($data['ci']) || empty($data['rol']) || empty($data['password']) || empty($data['cargo'])) {
                        throw new Exception('Todos los campos son obligatorios');
                    }
                    $userId = $this->createUser($data['name'], $data['lastname'], $data['ci'], $data['rol'], $data['password'], $data['cargo']);
                    echo json_encode(['success' => true, 'userId' => $userId]);
                    break;
    
                case 'getAllUsers':
                    $query = $_GET['query'] ?? '';
                    $users = $this->getAllUsers($query);
                    echo json_encode($users);
                    break;
    
                case 'getUserById':
                    $id = $_GET['id'] ?? '';
                    if (empty($id)) {
                        throw new Exception('ID de usuario no proporcionado');
                    }
                    $user = $this->getUserById($id);
                    if (!$user) {
                        throw new Exception('Usuario no encontrado');
                    }
                    echo json_encode($user);
                    break;
    
                case 'updateUser':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (empty($data['id'])) {
                        throw new Exception('ID de usuario no proporcionado');
                    }
                    if (empty($data['rol'])) {
                        throw new Exception('Rol de usuario no proporcionado');
                    }
                    $success = $this->updateUser($data['id'], $data['name'], $data['lastname'], $data['ci'], $data['rol'], $data['cargo']);
                    echo json_encode(['success' => $success]);
                    break;
    
                case 'deleteUser':
                    $id = $_GET['id'] ?? '';
                    if (empty($id)) {
                        throw new Exception('ID de usuario no proporcionado');
                    }
                    $success = $this->deleteUser($id);
                    echo json_encode(['success' => $success]);
                    break;
    
                default:
                    throw new Exception('Acción no válida');
            }
        } catch (Exception $e) {
            http_response_code(500); // Código de error del servidor
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}

// Ejecutar el controlador
try {
    // Incluir la configuración de la base de datos
    require_once '../../config/database.php';
    global $pdo; // Asegúrate de que $pdo esté disponible globalmente

    // Crear una instancia del controlador
    $controller = new UserController($pdo);

    // Manejar la solicitud
    $controller->handleRequest();
} catch (Exception $e) {
    // Manejar errores
    http_response_code(500); // Código de error del servidor
    echo json_encode(['error' => $e->getMessage()]);
}
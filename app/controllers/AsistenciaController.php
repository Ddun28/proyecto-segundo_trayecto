<?php

require_once __DIR__ . '/../models/Asistencia.php';

class AsistenciaController {
    private $asistenciaModel;

    public function __construct($pdo) {
        $this->asistenciaModel = new Asistencia($pdo);
    }

    public function registrarLlegada($cedula) {
        $horaLlegada = date('Y-m-d H:i:s');
        return $this->asistenciaModel->registrarAsistencia($cedula, $horaLlegada);
    }

    public function registrarSalida($cedula) {
        $horaSalida = date('Y-m-d H:i:s');
        return $this->asistenciaModel->actualizarSalida($cedula, $horaSalida);
    }

    public function getAsistencias() {
        $filter = $_GET['filter'] ?? null;
        $sql = "SELECT a.id, e.name, e.lastname, a.cedula, a.hora_llegada, a.hora_salida FROM asistencia a JOIN user e ON a.cedula = e.ci";
    
        if ($filter) {
            switch ($filter) {
                case 'day':
                    $sql .= " WHERE DATE(a.hora_llegada) = CURDATE()";
                    break;
                case 'week':
                    $sql .= " WHERE YEARWEEK(a.hora_llegada, 1) = YEARWEEK(CURDATE(), 1)";
                    break;
                case 'month':
                    $sql .= " WHERE MONTH(a.hora_llegada) = MONTH(CURDATE()) AND YEAR(a.hora_llegada) = YEAR(CURDATE())";
                    break;
            }
        }
    
        $sql .= " ORDER BY a.hora_llegada DESC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function handleRequest() {
        header('Content-Type: application/json');
        $action = $_GET['action'] ?? '';
    
        try {
            switch ($action) {
                case 'registrarLlegada':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (empty($data['cedula'])) {
                        throw new Exception('Cédula no proporcionada');
                    }
                    $asistenciaId = $this->registrarLlegada($data['cedula']);
                    echo json_encode(['success' => true, 'asistenciaId' => $asistenciaId]);
                    break;
    
                case 'registrarSalida':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (empty($data['cedula'])) {
                        throw new Exception('Cédula no proporcionada');
                    }
                    error_log("Registrando salida para cédula: " . $data['cedula']); // Depuración
                    $success = $this->registrarSalida($data['cedula']);
                    error_log("Resultado de registrar salida: " . ($success ? 'Éxito' : 'Fallo')); // Depuración
                    echo json_encode(['success' => $success]);
                    break;
    
                case 'getAsistencias':
                    $asistencias = $this->asistenciaModel->getAsistencias();
                    echo json_encode(['success' => true, 'asistencias' => $asistencias]);
                    break;
    
                case 'getAsistenciasHoy':
                    $totalAsistencias = $this->asistenciaModel->getAsistenciasHoy();
                    echo json_encode(['success' => true, 'totalAsistencias' => $totalAsistencias]);
                    break;
    
                case 'getAsistenciasSemana':
                    $asistenciasSemana = $this->asistenciaModel->getAsistenciasSemana();
                    echo json_encode(['success' => true, 'asistenciasSemana' => $asistenciasSemana]);
                    break;
    
                case 'getAsistenciasMes':
                    $asistenciasMes = $this->asistenciaModel->getAsistenciasMes();
                    echo json_encode(['success' => true, 'asistenciasMes' => $asistenciasMes]);
                    break;
    
                case 'deleteAsistencia':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if (empty($data['id'])) {
                        throw new Exception('ID de asistencia no proporcionado');
                    }
                    $success = $this->deleteAsistencia($data['id']);
                    echo json_encode(['success' => $success]);
                    break;
    
                default:
                    throw new Exception('Acción no válida');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}

try {
    require_once '../../config/database.php';
    global $pdo;
    $controller = new AsistenciaController($pdo);
    $controller->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
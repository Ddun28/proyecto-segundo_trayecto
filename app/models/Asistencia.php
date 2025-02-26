<?php
// models/Asistencia.php

class Asistencia {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Método para registrar una nueva asistencia
    public function registrarAsistencia($cedula, $horaLlegada, $horaSalida = null) {
        $sql = "INSERT INTO asistencia (cedula, hora_llegada, hora_salida) VALUES (:cedula, :hora_llegada, :hora_salida)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'cedula' => $cedula,
            'hora_llegada' => $horaLlegada,
            'hora_salida' => $horaSalida
        ]);
        return $this->pdo->lastInsertId();
    }

    public function getAsistenciasHoy() {
        $hoy = date('Y-m-d'); // Obtener la fecha actual en formato YYYY-MM-DD
        $sql = "SELECT a.*, e.name, e.lastname 
                FROM asistencia a 
                JOIN user e ON a.cedula = e.ci 
                WHERE DATE(a.hora_llegada) = :hoy";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['hoy' => $hoy]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Devuelve todas las asistencias del día junto con los datos del usuario
    }

    // Método para obtener todas las asistencias
    public function getAll() {
        $sql = "SELECT * FROM asistencia";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAsistencias() {
        $sql = "SELECT a.id, e.name, e.lastname, a.cedula, a.hora_llegada, a.hora_salida 
                FROM asistencia a 
                JOIN user e ON a.cedula = e.ci 
                ORDER BY a.hora_llegada DESC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Método para obtener asistencia por ID
    public function getById($id) {
        $sql = "SELECT * FROM asistencia WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function actualizarSalida($cedula, $horaSalida) {
        $sql = "UPDATE asistencia SET hora_salida = :hora_salida WHERE cedula = :cedula AND hora_salida IS NULL";
        $stmt = $this->pdo->prepare($sql);
        error_log("Ejecutando SQL: " . $sql); // Depuración
        error_log("Datos: cedula=$cedula, hora_salida=$horaSalida"); // Depuración
        return $stmt->execute(['cedula' => $cedula, 'hora_salida' => $horaSalida]);
    }

    // Método para eliminar una asistencia
    public function delete($id) {
        $sql = "DELETE FROM asistencia WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function getAsistenciasSemana() {
        $inicioSemana = date('Y-m-d', strtotime('monday this week')); // Inicio de la semana
        $finSemana = date('Y-m-d', strtotime('sunday this week')); // Fin de la semana
    
        $sql = "SELECT a.*, e.name, e.lastname 
                FROM asistencia a 
                JOIN user e ON a.cedula = e.ci 
                WHERE DATE(a.hora_llegada) BETWEEN :inicioSemana AND :finSemana";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'inicioSemana' => $inicioSemana,
            'finSemana' => $finSemana
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Devuelve todas las asistencias de la semana junto con los datos del usuario
    }
    
    public function getAsistenciasMes() {
        $inicioMes = date('Y-m-01'); // Primer día del mes
        $finMes = date('Y-m-t'); // Último día del mes
    
        $sql = "SELECT a.*, e.name, e.lastname 
                FROM asistencia a 
                JOIN user e ON a.cedula = e.ci 
                WHERE DATE(a.hora_llegada) BETWEEN :inicioMes AND :finMes";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'inicioMes' => $inicioMes,
            'finMes' => $finMes
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Devuelve todas las asistencias del mes junto con los datos del usuario
    }

}
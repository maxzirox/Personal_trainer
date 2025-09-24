-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: personal_trainer_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alimentos`
--

DROP TABLE IF EXISTS `alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `calorias_por_100g` int NOT NULL,
  `proteinas` decimal(5,2) DEFAULT '0.00',
  `carbohidratos` decimal(5,2) DEFAULT '0.00',
  `grasas` decimal(5,2) DEFAULT '0.00',
  `fibra` decimal(5,2) DEFAULT '0.00',
  `categoria` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentos`
--

LOCK TABLES `alimentos` WRITE;
/*!40000 ALTER TABLE `alimentos` DISABLE KEYS */;
INSERT INTO `alimentos` VALUES (1,'Pechuga de pollo',165,31.00,0.00,3.60,0.00,'Proteínas'),(2,'Arroz integral',123,2.60,23.00,0.90,1.80,'Carbohidratos'),(3,'Brócoli',34,2.80,7.00,0.40,2.60,'Verduras'),(4,'Salmón',208,25.40,0.00,12.40,0.00,'Proteínas'),(5,'Avena',389,16.90,66.30,6.90,10.60,'Carbohidratos'),(6,'Espinaca',23,2.90,3.60,0.40,2.20,'Verduras'),(7,'Huevo',155,13.00,1.10,11.00,0.00,'Proteínas'),(8,'Quinoa',368,14.10,64.20,6.10,7.00,'Carbohidratos'),(9,'Aguacate',160,2.00,8.50,14.70,6.70,'Grasas saludables'),(10,'Almendras',579,21.20,21.60,49.90,12.50,'Grasas saludables');
/*!40000 ALTER TABLE `alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_ejercicios`
--

DROP TABLE IF EXISTS `categorias_ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_ejercicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_ejercicios`
--

LOCK TABLES `categorias_ejercicios` WRITE;
/*!40000 ALTER TABLE `categorias_ejercicios` DISABLE KEYS */;
INSERT INTO `categorias_ejercicios` VALUES (1,'Pecho','Ejercicios para pectorales'),(2,'Espalda','Ejercicios para dorsales y trapecio'),(3,'Piernas','Ejercicios para cuádriceps, glúteos y isquiotibiales'),(4,'Brazos','Ejercicios para bíceps y tríceps'),(5,'Core','Ejercicios para abdomen y core'),(6,'Cardio','Ejercicios cardiovasculares'),(7,'Funcional','Ejercicios funcionales y compuestos');
/*!40000 ALTER TABLE `categorias_ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comida_alimentos`
--

DROP TABLE IF EXISTS `comida_alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comida_alimentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comida_id` int NOT NULL,
  `alimento_id` int NOT NULL,
  `cantidad_gramos` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comida_id` (`comida_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `comida_alimentos_ibfk_1` FOREIGN KEY (`comida_id`) REFERENCES `dieta_comidas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comida_alimentos_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comida_alimentos`
--

LOCK TABLES `comida_alimentos` WRITE;
/*!40000 ALTER TABLE `comida_alimentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `comida_alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dieta_comidas`
--

DROP TABLE IF EXISTS `dieta_comidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dieta_comidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dieta_id` int NOT NULL,
  `tipo_comida` enum('desayuno','almuerzo','cena','snack_1','snack_2') NOT NULL,
  `orden` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dieta_id` (`dieta_id`),
  CONSTRAINT `dieta_comidas_ibfk_1` FOREIGN KEY (`dieta_id`) REFERENCES `dietas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dieta_comidas`
--

LOCK TABLES `dieta_comidas` WRITE;
/*!40000 ALTER TABLE `dieta_comidas` DISABLE KEYS */;
/*!40000 ALTER TABLE `dieta_comidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dietas`
--

DROP TABLE IF EXISTS `dietas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `calorias_totales` int DEFAULT NULL,
  `tipo_dieta` enum('perdida_peso','ganancia_masa','mantenimiento','definicion') NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  CONSTRAINT `dietas_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietas`
--

LOCK TABLES `dietas` WRITE;
/*!40000 ALTER TABLE `dietas` DISABLE KEYS */;
/*!40000 ALTER TABLE `dietas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ejercicios`
--

DROP TABLE IF EXISTS `ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `categoria_id` int DEFAULT NULL,
  `meta_id` int DEFAULT NULL,
  `video_youtube_url` varchar(255) DEFAULT NULL,
  `instrucciones` text,
  `nivel_dificultad` enum('principiante','intermedio','avanzado') DEFAULT 'principiante',
  `puntos_otorgados` int DEFAULT '10',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ejercicios_categoria` (`categoria_id`),
  KEY `idx_ejercicios_meta` (`meta_id`),
  CONSTRAINT `ejercicios_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_ejercicios` (`id`),
  CONSTRAINT `ejercicios_ibfk_2` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicios`
--

LOCK TABLES `ejercicios` WRITE;
/*!40000 ALTER TABLE `ejercicios` DISABLE KEYS */;
INSERT INTO `ejercicios` VALUES (1,'Flexiones de pecho','Ejercicio básico para pectorales',1,2,'https://youtube.com/watch?v=ejemplo1','Mantén el cuerpo recto, baja hasta casi tocar el suelo','principiante',10,1,'2025-09-24 17:07:32'),(2,'Sentadillas','Ejercicio fundamental para piernas',3,2,'https://youtube.com/watch?v=ejemplo2','Baja como si te fueras a sentar, mantén la espalda recta','principiante',15,1,'2025-09-24 17:07:32'),(3,'Dominadas','Ejercicio para espalda y bíceps',2,2,'https://youtube.com/watch?v=ejemplo3','Cuelga de la barra y sube hasta que el mentón pase la barra','intermedio',25,1,'2025-09-24 17:07:32'),(4,'Plancha','Ejercicio isométrico para core',5,4,'https://youtube.com/watch?v=ejemplo4','Mantén el cuerpo recto como una tabla','principiante',20,1,'2025-09-24 17:07:32'),(5,'Burpees','Ejercicio completo de cuerpo entero',7,1,'https://youtube.com/watch?v=ejemplo5','Combinación de sentadilla, plancha, flexión y salto','avanzado',30,1,'2025-09-24 17:07:32');
/*!40000 ALTER TABLE `ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_ejercicios`
--

DROP TABLE IF EXISTS `historial_ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_ejercicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historial_id` int NOT NULL,
  `ejercicio_id` int NOT NULL,
  `series_completadas` int DEFAULT '0',
  `repeticiones_realizadas` varchar(50) DEFAULT NULL,
  `peso_utilizado` decimal(5,2) DEFAULT NULL,
  `completado` tinyint(1) DEFAULT '0',
  `notas` text,
  PRIMARY KEY (`id`),
  KEY `historial_id` (`historial_id`),
  KEY `ejercicio_id` (`ejercicio_id`),
  CONSTRAINT `historial_ejercicios_ibfk_1` FOREIGN KEY (`historial_id`) REFERENCES `historial_entrenamientos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_ejercicios_ibfk_2` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_ejercicios`
--

LOCK TABLES `historial_ejercicios` WRITE;
/*!40000 ALTER TABLE `historial_ejercicios` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_entrenamientos`
--

DROP TABLE IF EXISTS `historial_entrenamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_entrenamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `rutina_id` int NOT NULL,
  `fecha_entrenamiento` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `completado` tinyint(1) DEFAULT '0',
  `puntos_ganados` int DEFAULT '0',
  `notas` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rutina_id` (`rutina_id`),
  KEY `idx_historial_usuario_fecha` (`usuario_id`,`fecha_entrenamiento`),
  CONSTRAINT `historial_entrenamientos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_entrenamientos_ibfk_2` FOREIGN KEY (`rutina_id`) REFERENCES `rutinas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_entrenamientos`
--

LOCK TABLES `historial_entrenamientos` WRITE;
/*!40000 ALTER TABLE `historial_entrenamientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_entrenamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_puntos`
--

DROP TABLE IF EXISTS `historial_puntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_puntos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `puntos_ganados` int NOT NULL,
  `razon` enum('entrenamiento_completado','rutina_completada','objetivo_cumplido','bonus') NOT NULL,
  `referencia_id` int DEFAULT NULL,
  `fecha_ganados` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `historial_puntos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_puntos`
--

LOCK TABLES `historial_puntos` WRITE;
/*!40000 ALTER TABLE `historial_puntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_puntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mediciones`
--

DROP TABLE IF EXISTS `mediciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `fecha_medicion` date NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `altura` decimal(5,2) DEFAULT NULL,
  `imc` decimal(4,2) GENERATED ALWAYS AS ((`peso` / pow((`altura` / 100),2))) STORED,
  `porcentaje_grasa` decimal(4,2) DEFAULT NULL,
  `masa_muscular` decimal(5,2) DEFAULT NULL,
  `circunferencia_cintura` decimal(5,2) DEFAULT NULL,
  `circunferencia_cadera` decimal(5,2) DEFAULT NULL,
  `circunferencia_brazo` decimal(5,2) DEFAULT NULL,
  `circunferencia_pierna` decimal(5,2) DEFAULT NULL,
  `notas` text,
  `registrado_por` int DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `registrado_por` (`registrado_por`),
  KEY `idx_mediciones_usuario_fecha` (`usuario_id`,`fecha_medicion`),
  CONSTRAINT `mediciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mediciones_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediciones`
--

LOCK TABLES `mediciones` WRITE;
/*!40000 ALTER TABLE `mediciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `mediciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas`
--

DROP TABLE IF EXISTS `metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `activa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas`
--

LOCK TABLES `metas` WRITE;
/*!40000 ALTER TABLE `metas` DISABLE KEYS */;
INSERT INTO `metas` VALUES (1,'Pérdida de peso','Ejercicios enfocados en quemar calorías',1),(2,'Ganancia muscular','Ejercicios de fuerza y hipertrofia',1),(3,'Resistencia cardiovascular','Mejora del sistema cardiovascular',1),(4,'Flexibilidad','Ejercicios de estiramiento y movilidad',1),(5,'Fuerza funcional','Movimientos funcionales del día a día',1);
/*!40000 ALTER TABLE `metas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles`
--

DROP TABLE IF EXISTS `niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `puntos_requeridos` int NOT NULL,
  `recompensa` text,
  `icono` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nivel` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles`
--

LOCK TABLES `niveles` WRITE;
/*!40000 ALTER TABLE `niveles` DISABLE KEYS */;
INSERT INTO `niveles` VALUES (1,1,'Principiante',0,'Bienvenido al fitness!','novato.png'),(2,2,'Aprendiz',100,'Rutina bonus desbloqueada','aprendiz.png'),(3,3,'Entusiasta',300,'Plan nutricional básico gratis','entusiasta.png'),(4,4,'Dedicado',600,'Sesión personal gratuita','dedicado.png'),(5,5,'Atleta',1000,'Programa avanzado desbloqueado','atleta.png'),(6,6,'Experto',1500,'Acceso a entrenamientos exclusivos','experto.png'),(7,7,'Maestro',2500,'Certificado de logro + merchandising','maestro.png');
/*!40000 ALTER TABLE `niveles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutina_ejercicios`
--

DROP TABLE IF EXISTS `rutina_ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutina_ejercicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rutina_id` int NOT NULL,
  `ejercicio_id` int NOT NULL,
  `orden` int NOT NULL,
  `series` int DEFAULT '1',
  `repeticiones` varchar(20) DEFAULT NULL,
  `peso_sugerido` decimal(5,2) DEFAULT NULL,
  `descanso_segundos` int DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id`),
  KEY `rutina_id` (`rutina_id`),
  KEY `ejercicio_id` (`ejercicio_id`),
  CONSTRAINT `rutina_ejercicios_ibfk_1` FOREIGN KEY (`rutina_id`) REFERENCES `rutinas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rutina_ejercicios_ibfk_2` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutina_ejercicios`
--

LOCK TABLES `rutina_ejercicios` WRITE;
/*!40000 ALTER TABLE `rutina_ejercicios` DISABLE KEYS */;
/*!40000 ALTER TABLE `rutina_ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutinas`
--

DROP TABLE IF EXISTS `rutinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `duracion_minutos` int DEFAULT NULL,
  `nivel_dificultad` enum('principiante','intermedio','avanzado') DEFAULT 'principiante',
  `puntos_completar` int DEFAULT '50',
  `activa` tinyint(1) DEFAULT '1',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  CONSTRAINT `rutinas_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutinas`
--

LOCK TABLES `rutinas` WRITE;
/*!40000 ALTER TABLE `rutinas` DISABLE KEYS */;
/*!40000 ALTER TABLE `rutinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suscripciones`
--

DROP TABLE IF EXISTS `suscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suscripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `duracion_dias` int NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripciones`
--

LOCK TABLES `suscripciones` WRITE;
/*!40000 ALTER TABLE `suscripciones` DISABLE KEYS */;
INSERT INTO `suscripciones` VALUES (1,'Plan Básico','Acceso a rutinas básicas y seguimiento',29.99,30,1,'2025-09-24 17:07:32'),(2,'Plan Premium','Acceso completo + dietas personalizadas',49.99,30,1,'2025-09-24 17:07:32'),(3,'Plan Pro','Todo incluido + sesiones 1 a 1',99.99,30,1,'2025-09-24 17:07:32');
/*!40000 ALTER TABLE `suscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_dietas`
--

DROP TABLE IF EXISTS `usuario_dietas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_dietas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `dieta_id` int NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `asignado_por` int NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `dieta_id` (`dieta_id`),
  KEY `asignado_por` (`asignado_por`),
  CONSTRAINT `usuario_dietas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_dietas_ibfk_2` FOREIGN KEY (`dieta_id`) REFERENCES `dietas` (`id`),
  CONSTRAINT `usuario_dietas_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_dietas`
--

LOCK TABLES `usuario_dietas` WRITE;
/*!40000 ALTER TABLE `usuario_dietas` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_dietas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_niveles`
--

DROP TABLE IF EXISTS `usuario_niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_niveles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `puntos_totales` int DEFAULT '0',
  `nivel_actual` int DEFAULT '1',
  `fecha_ultimo_nivel` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `nivel_actual` (`nivel_actual`),
  CONSTRAINT `usuario_niveles_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_niveles_ibfk_2` FOREIGN KEY (`nivel_actual`) REFERENCES `niveles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_niveles`
--

LOCK TABLES `usuario_niveles` WRITE;
/*!40000 ALTER TABLE `usuario_niveles` DISABLE KEYS */;
INSERT INTO `usuario_niveles` VALUES (1,1,0,1,'2025-09-24 20:51:04');
/*!40000 ALTER TABLE `usuario_niveles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rutinas`
--

DROP TABLE IF EXISTS `usuario_rutinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rutinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `rutina_id` int NOT NULL,
  `asignado_por` int NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `completada` tinyint(1) DEFAULT '0',
  `activa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `rutina_id` (`rutina_id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_usuario_rutinas_activa` (`usuario_id`,`activa`),
  CONSTRAINT `usuario_rutinas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_rutinas_ibfk_2` FOREIGN KEY (`rutina_id`) REFERENCES `rutinas` (`id`),
  CONSTRAINT `usuario_rutinas_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rutinas`
--

LOCK TABLES `usuario_rutinas` WRITE;
/*!40000 ALTER TABLE `usuario_rutinas` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_rutinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_suscripciones`
--

DROP TABLE IF EXISTS `usuario_suscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_suscripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `suscripcion_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `suscripcion_id` (`suscripcion_id`),
  CONSTRAINT `usuario_suscripciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_suscripciones_ibfk_2` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_suscripciones`
--

LOCK TABLES `usuario_suscripciones` WRITE;
/*!40000 ALTER TABLE `usuario_suscripciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_suscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('M','F','Otro') DEFAULT NULL,
  `tipo_usuario` enum('cliente','entrenador','admin') DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_email` (`email`),
  KEY `idx_usuario_tipo` (`tipo_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan','Pérez','juan@email.com','$2a$12$bmAfYnj/h5wfMqYDLWPq6OohkvzQewKiWggFDWBvAV6prF/J5esvu','+56942445612','1992-09-24','M','cliente',1,'2025-09-24 20:51:04','2025-09-24 20:51:04');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-24 18:40:18

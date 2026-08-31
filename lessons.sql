-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-03-2026 a las 20:34:56
-- Versión del servidor: 11.8.3-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u803496046_harphub`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `youtubeId` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `gpFile` varchar(255) DEFAULT NULL,
  `practiceTab` text DEFAULT NULL,
  `difficulty` int(11) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `harmonica_key` varchar(10) DEFAULT 'ALL',
  `video_bookmarks` text DEFAULT NULL,
  `personal_notes` text DEFAULT NULL,
  `artist` varchar(100) DEFAULT NULL,
  `instrument` varchar(50) DEFAULT 'harmonica'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lessons`
--

INSERT INTO `lessons` (`id`, `user_id`, `title`, `youtubeId`, `category`, `description`, `gpFile`, `practiceTab`, `difficulty`, `createdAt`, `harmonica_key`, `video_bookmarks`, `personal_notes`, `artist`, `instrument`) VALUES
(2, '2', 'An updated test lesson', 'dQw4w9WgXcQ', 'daily', '', '', '4 -4 5 -5 64 -4 5', 1, '2026-02-21 22:50:45', 'ALL', '[{\"title\":\"Intro\",\"time\":\"00:15\",\"seconds\":15}]', 'Test note', NULL, 'harmonica'),
(3, '2', 'Final Successful Lesson', 'dQw4w9WgXcQ', 'daily', '', '', '4 -4 5\\n-5 6 -64 -4 5', 1, '2026-02-21 22:56:25', 'ALL', '[{\"title\":\"Intro\",\"time\":\"00:15\",\"seconds\":15}]', 'Test note', NULL, 'harmonica'),
(4, '2', 'An updated test lesson', 'dQw4w9WgXcQ', 'daily', '', '', '4 -4 5 -5 64 -4 5', 1, '2026-02-21 23:22:24', 'ALL', '[{\"title\":\"Intro\",\"time\":\"00:15\",\"seconds\":15}]', 'Test note', NULL, 'harmonica'),
(6, '1', '5 MINUTOS BIG TRAIN', '6IRq5EEVMbg', 'daily', '', '', '', 1, '2026-03-08 22:37:36', 'ALL', '[{\"title\":\"BIG TONE TRAIN\",\"time\":\"03:36\",\"seconds\":216},{\"title\":\"VIBRATO\",\"time\":\"16:37\",\"seconds\":997}]', '', '', 'harmonica'),
(7, '1', 'DESCONFIO DE LA VIDA', 'ogMRcAQu1D8', 'jam', '', '', '', 4, '2026-03-09 01:53:17', 'C', '[]', 'G en armonica de DO para el video, Tonalidad original armonica en G', 'Pappo', 'harmonica'),
(8, '1', 'JUNTOS A LA PAR', 'wlbinqSLuzM', 'jam', '', '', '', 3, '2026-03-09 02:01:05', 'ALL', '[{\"title\":\"VERSION CON BENDS\",\"time\":\"01:17\",\"seconds\":77},{\"title\":\"Versión sin Bends\",\"time\":\"04:51\",\"seconds\":291}]', '', 'Pappo', 'harmonica'),
(9, '1', '2 BAJISTAS', '0lWhwW0O7Yg', 'jam', '', '', '', 3, '2026-03-09 02:03:38', 'D', '[]', '', 'Pappo', 'harmonica'),
(10, '1', 'BUSCANDO UN AMOR', 'https://www.youtube.com/watch?v=qWUexCDs2hw', 'riffs', '', '', '', 4, '2026-03-09 02:05:47', 'ALL', '[]', '', 'Pappo', 'harmonica'),
(12, '1', 'PLAYLIST BLUES ACUSTICO', '5KQHQGNQIBk', 'jam', '', '', '4 -4 5 -5 6', 4, '2026-03-10 12:54:18', 'ALL', '[{\"title\":\"Lone Hill Moanin\",\"time\":\"00:00\",\"seconds\":0},{\"title\":\"Iron Step Blues\",\"time\":\"3:27\",\"seconds\":207},{\"title\":\"Rusty Wheel Blues\",\"time\":\"06:55\",\"seconds\":415},{\"title\":\"Hollow Shack Moan\",\"time\":\"10:35\",\"seconds\":635},{\"title\":\"Old Chain Blues\",\"time\":\"13:56\",\"seconds\":836},{\"title\":\"Stormfield Train Cry\",\"time\":\"17:27\",\"seconds\":1047},{\"title\":\"Crooked Fence Blues\",\"time\":\"20:43\",\"seconds\":1243},{\"title\":\"Gravel Dust Shuffle\",\"time\":\"23:51\",\"seconds\":1431},{\"title\":\" Whiskey Line Moanin\",\"time\":\"26:44\",\"seconds\":1604},{\"title\":\"Delta Creek Cry\",\"time\":\"29:35\",\"seconds\":1775},{\"title\":\"Black Dust Shuffle\",\"time\":\"32:26\",\"seconds\":1946},{\"title\":\"Tin Lantern Blues\",\"time\":\"35:01\",\"seconds\":2101},{\"title\":\"Bayou Moon Cry\",\"time\":\"38:28\",\"seconds\":2308},{\"title\":\"Cold River Shuffle\",\"time\":\"41:35\",\"seconds\":2495},{\"title\":\"Ragged Nail Moanin\",\"time\":\"44:51\",\"seconds\":2691},{\"title\":\"Freight Smoke Moanin\",\"time\":\"47:43\",\"seconds\":2863}]', '', 'varios', 'harmonica'),
(13, '1', 'ESCALA DE BLUES', 'https://youtu.be/ZxyIfmT1tDA?si=zUGRRqZdfP9pqvJU', 'daily', '', '', '4\' 4 5 +4 3\' 2\"\r\n5 6\r\n2 2 2\" 1 +1 1 3\' 2', 3, '2026-03-10 17:16:21', 'ALL', '[{\"title\":\"PRIMERA FRASE COMPLETA\",\"time\":\"04:18\",\"seconds\":258},{\"title\":\"ESCALA COMPLETA\",\"time\":\"05:21\",\"seconds\":321},{\"title\":\"SEGUNDA FRASE\",\"time\":\"06:30\",\"seconds\":390},{\"title\":\"TERCERA FRASE COMPLETA\",\"time\":\"07:59\",\"seconds\":479}]', '', 'Howlin Wolf', 'harmonica');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

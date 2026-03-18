-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 18, 2026 at 04:03 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ai_showcase`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `tech_tags` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `description`, `video_url`, `thumbnail_url`, `tech_tags`, `created_at`) VALUES
(1, 'hay qua', 'hayqua', '/uploads/videos/video-1773124190181-57091269.mp4', NULL, 'hayqua,hayqua', '2026-03-10 06:29:33'),
(3, 'vd 1', 'hayqua', '/uploads/videos/video-1773126580894-18352591.mp4', NULL, 'hayqua', '2026-03-10 07:09:40'),
(4, 'cscsac', 'scascsac', '/uploads/videos/video-1773126642352-461597656.mp4', NULL, 'sấcc', '2026-03-10 07:10:42'),
(5, 'csacsac', 'scsacasc', '/uploads/videos/video-1773126650833-562323927.mp4', NULL, 'acsacascas', '2026-03-10 07:10:50'),
(6, 'csacsacsa', 'csacsacas', '/uploads/videos/video-1773126658668-197216606.mp4', NULL, 'csacsacsacsa', '2026-03-10 07:10:58'),
(8, 'hay qua', 'scsacsac', '/uploads/videos/video-1773126685197-883619754.mp4', NULL, 'sấccascasc', '2026-03-10 07:11:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`) VALUES
(1, 'admin', '$2b$10$GHQH4mGnIyrVrbNCmkezkuGZyrCgbZoa0RDpyUMqKNo3OdB./VNwS', 'System Administrator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

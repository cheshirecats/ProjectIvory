-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 13, 2013 at 08:35 AM
-- Server version: 5.5.20
-- PHP Version: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `curiousw_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `follow`
--

CREATE TABLE IF NOT EXISTS `follow` (
  `follow_a` int(10) unsigned NOT NULL,
  `follow_b` int(10) unsigned NOT NULL,
  PRIMARY KEY (`follow_a`,`follow_b`),
  KEY `follow_a` (`follow_a`),
  KEY `follow_b` (`follow_b`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `list2top`
--

CREATE TABLE IF NOT EXISTS `list2top` (
  `id_topic` int(10) unsigned NOT NULL,
  `id_list` int(10) unsigned NOT NULL,
  `id_by` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_topic`,`id_list`,`id_by`),
  KEY `id_topic` (`id_topic`),
  KEY `id_list` (`id_list`),
  KEY `id_by` (`id_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lists`
--

CREATE TABLE IF NOT EXISTS `lists` (
  `list_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `list_by` int(10) unsigned NOT NULL,
  `list_date` datetime NOT NULL,
  `list_cnt` int(10) unsigned NOT NULL,
  PRIMARY KEY (`list_id`),
  KEY `list_cnt` (`list_cnt`),
  KEY `list_date` (`list_date`),
  KEY `list_by` (`list_by`),
  KEY `list_name` (`list_name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=30 ;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_text` text COLLATE utf8_unicode_ci NOT NULL,
  `post_date` datetime NOT NULL,
  `post_topic` int(10) unsigned DEFAULT NULL,
  `post_root` int(11) DEFAULT NULL,
  `post_by` int(10) unsigned NOT NULL,
  `post_special` int(10) unsigned NOT NULL,
  `post_edit` datetime NOT NULL,
  `post_ip` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `post_topic` (`post_topic`),
  KEY `post_date` (`post_date`),
  KEY `post_by` (`post_by`),
  KEY `post_root` (`post_root`),
  KEY `post_edit` (`post_edit`),
  KEY `post_special` (`post_special`),
  KEY `post_ip` (`post_ip`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=6937 ;

-- --------------------------------------------------------

--
-- Table structure for table `topics`
--

CREATE TABLE IF NOT EXISTS `topics` (
  `topic_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `topic_title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `topic_root` int(10) unsigned NOT NULL,
  `topic_date` datetime NOT NULL,
  `topic_by` int(10) unsigned NOT NULL,
  `topic_replies` int(10) unsigned NOT NULL,
  `topic_score` double NOT NULL,
  `topic_special` int(10) unsigned NOT NULL,
  `topic_class` int(10) unsigned NOT NULL,
  PRIMARY KEY (`topic_id`),
  KEY `topic_date` (`topic_date`),
  KEY `topic_by` (`topic_by`),
  KEY `topic_score` (`topic_score`),
  KEY `topic_root` (`topic_root`),
  KEY `topic_replies` (`topic_replies`),
  KEY `topic_special` (`topic_special`),
  KEY `topic_title` (`topic_title`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1746 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `user_pass` binary(20) NOT NULL,
  `user_email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `user_date` datetime NOT NULL,
  `user_ip` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  `user_level` int(10) NOT NULL,
  `user_posts` int(10) unsigned NOT NULL,
  `user_signin` datetime NOT NULL,
  `user_lastpost` datetime NOT NULL,
  `user_following` int(10) unsigned NOT NULL,
  `user_followers` int(10) unsigned NOT NULL,
  `user_css` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `user_hidposts` int(10) unsigned NOT NULL,
  `user_location` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `user_education` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `user_major` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `user_hobby` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`),
  KEY `user_signin` (`user_signin`),
  KEY `user_date` (`user_date`),
  KEY `user_posts` (`user_posts`),
  KEY `user_lastpost` (`user_lastpost`),
  KEY `user_following` (`user_following`),
  KEY `user_followers` (`user_followers`),
  KEY `user_email` (`user_email`),
  KEY `user_level` (`user_level`),
  KEY `user_hidposts` (`user_hidposts`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1095 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `follow_ibfk_1` FOREIGN KEY (`follow_a`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `follow_ibfk_2` FOREIGN KEY (`follow_b`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `list2top`
--
ALTER TABLE `list2top`
  ADD CONSTRAINT `list2top_ibfk_1` FOREIGN KEY (`id_topic`) REFERENCES `topics` (`topic_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `list2top_ibfk_2` FOREIGN KEY (`id_list`) REFERENCES `lists` (`list_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lists`
--
ALTER TABLE `lists`
  ADD CONSTRAINT `lists_ibfk_1` FOREIGN KEY (`list_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`post_topic`) REFERENCES `topics` (`topic_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`post_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `topics`
--
ALTER TABLE `topics`
  ADD CONSTRAINT `topics_ibfk_2` FOREIGN KEY (`topic_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `topics_ibfk_3` FOREIGN KEY (`topic_root`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

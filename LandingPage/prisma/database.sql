-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: dacorrado
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CarouselImage`
--

DROP TABLE IF EXISTS `CarouselImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CarouselImage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CarouselImage`
--

LOCK TABLES `CarouselImage` WRITE;
/*!40000 ALTER TABLE `CarouselImage` DISABLE KEYS */;
INSERT INTO `CarouselImage` VALUES (1,'/uploads/1774268716437-Al-Siciliana.png',NULL,'Al Siciliana',0,1,'2026-03-23 12:26:57.458','2026-03-23 12:26:57.458'),(2,'/uploads/1774268716438-Avocado_mit_shrimp-bearbeitet-scaled.png',NULL,'Avocado mit shrimp bearbeitet scaled',1,1,'2026-03-23 12:26:57.463','2026-03-23 12:26:57.463'),(3,'/uploads/1774268716438-Cevapcici.png',NULL,'Cevapcici',3,1,'2026-03-23 12:26:57.463','2026-03-23 12:26:57.463'),(4,'/uploads/1774268716437-Carbonara-Macceroni.png',NULL,'Carbonara Macceroni',2,1,'2026-03-23 12:26:57.463','2026-03-23 12:26:57.463'),(5,'/uploads/1774268716437-Chicken-Nuggets-9-St_.png',NULL,'Chicken Nuggets 9 St ',4,1,'2026-03-23 12:26:57.479','2026-03-23 12:26:57.479'),(6,'/uploads/1774268716490-Chicken-Wings-9-St_.png',NULL,'Chicken Wings 9 St ',5,1,'2026-03-23 12:26:57.479','2026-03-23 12:26:57.479'),(7,'/uploads/1774268716494-Cordon-Bleu.png',NULL,'Cordon Bleu',6,1,'2026-03-23 12:26:57.569','2026-03-23 12:26:57.569'),(8,'/uploads/1774268716532-De-Nero-Pasta.png',NULL,'De Nero Pasta',8,1,'2026-03-23 12:26:57.581','2026-03-23 12:26:57.581'),(9,'/uploads/1774268716535-Gamberetti-Pasta.png',NULL,'Gamberetti Pasta',10,1,'2026-03-23 12:26:57.581','2026-03-23 12:26:57.581'),(10,'/uploads/1774268716687-Gebackene-Champignons.png',NULL,'Gebackene Champignons',11,1,'2026-03-23 12:26:57.581','2026-03-23 12:26:57.581'),(11,'/uploads/1774268716534-Corrado-Burger-XL.png',NULL,'Corrado Burger XL',7,1,'2026-03-23 12:26:57.581','2026-03-23 12:26:57.581'),(12,'/uploads/1774268716531-Frutidemare_salat-bearbeitet-scaled.png',NULL,'Frutidemare salat bearbeitet scaled',9,1,'2026-03-23 12:26:57.582','2026-03-23 12:26:57.582'),(13,'/uploads/1774268716687-Gebackene-Karfiol.png',NULL,'Gebackene Karfiol',12,1,'2026-03-23 12:26:57.610','2026-03-23 12:26:57.610'),(14,'/uploads/1774268716711-Gebackene-Mini-Camembert.png',NULL,'Gebackene Mini Camembert',13,1,'2026-03-23 12:26:57.650','2026-03-23 12:26:57.650'),(15,'/uploads/1774268716712-Gemischt_Salat_mit_Ei-bearbeitet-scaled.png',NULL,'Gemischt Salat mit Ei bearbeitet',15,1,'2026-03-23 12:26:57.659','2026-03-23 12:26:57.659'),(16,'/uploads/1774268716712-Gebackene-Mozzarellasticks-scaled.png',NULL,'Gebackene Mozzarellasticks',14,1,'2026-03-23 12:26:57.659','2026-03-23 12:26:57.659'),(17,'/uploads/1774268716820-Gemischt_Salat_mit_shrimp-bearbeitet-scaled.png',NULL,'Gemischt Salat mit Shrimps',18,1,'2026-03-23 12:26:57.659','2026-03-23 12:26:57.659'),(18,'/uploads/1774268716801-Gemischt_Salat_mit_Schinken_und_Ei-bearbeitet-scaled.png',NULL,'Gemischt Salat mit Schinken und Ei bearbeitet',17,1,'2026-03-23 12:26:57.659','2026-03-23 12:26:57.659'),(19,'/uploads/1774268716712-Gemischt_Salat_mit_Mais_und_jougert-bearbeitet-scaled.png',NULL,'Gemischt Salat mit Mais und jougert bearbeitet',16,1,'2026-03-23 12:26:57.659','2026-03-23 12:26:57.659'),(20,'/uploads/1774268716820-Gemischt_Salat-bearbeitet-scaled.png',NULL,'Gemischt Salat',19,1,'2026-03-23 12:26:57.699','2026-03-23 12:26:57.699'),(21,'/uploads/1774268716820-Gemischte_salat_mit_Schafkaese-bearbeitet-scaled.png',NULL,'Gemischte salat mit Schafkaese',20,1,'2026-03-23 12:26:57.710','2026-03-23 12:26:57.710'),(22,'/uploads/1774268716833-Gemistet_Salat_mit_olivion-bearbeitet-scaled.png',NULL,'Gemistet Salat mit Oliven',22,1,'2026-03-23 12:26:57.720','2026-03-23 12:26:57.720'),(23,'/uploads/1774268716867-Gurkensalat-bearbeitet-scaled.png',NULL,'Gurkensalat',24,1,'2026-03-23 12:26:57.720','2026-03-23 12:26:57.720'),(24,'/uploads/1774268716861-Grun_Salat-bearbeitet-scaled.png',NULL,'Gr├╝ner Salat',23,1,'2026-03-23 12:26:57.720','2026-03-23 12:26:57.720'),(25,'/uploads/1774268716833-Gemischte_Salat_mit_Thunfisch-bearbeitet-scaled.png',NULL,'Gemischte Salat mit Thunfisch',21,1,'2026-03-23 12:26:57.720','2026-03-23 12:26:57.720'),(26,'/uploads/1774268716885-Hawai_Salat-bearbeitet-scaled.png',NULL,'Hawai Salat',25,1,'2026-03-23 12:26:57.751','2026-03-23 12:26:57.751'),(27,'/uploads/1774268716885-Kartofal_Salat-bearbeitet-scaled.png',NULL,'Kartoffelsalat',26,1,'2026-03-23 12:26:57.769','2026-03-23 12:26:57.769'),(28,'/uploads/1774268716885-Mozzarella_pomodoro-bearbeitet-scaled.png',NULL,'Mozzarella pomodoro',27,1,'2026-03-23 12:26:57.778','2026-03-23 12:26:57.778'),(29,'/uploads/1774268716893-Natur-Schnitzel.png',NULL,'Natur Schnitzel',28,1,'2026-03-23 12:26:57.794','2026-03-23 12:26:57.794'),(30,'/uploads/1774268716919-Puten_Salat-bearbeitet-scaled.png',NULL,'Puten Salat',29,1,'2026-03-23 12:26:57.794','2026-03-23 12:26:57.794'),(31,'/uploads/1774268716932-Risotto-Tacchino.png',NULL,'Risotto Tacchino',30,1,'2026-03-23 12:26:57.794','2026-03-23 12:26:57.794'),(32,'/uploads/1774268716959-Rucolla_Salat-bearbeitet-scaled.png',NULL,'Rucolla Salat',31,1,'2026-03-23 12:26:57.821','2026-03-23 12:26:57.821'),(33,'/uploads/1774268716960-Scampi-Gegrillt.png',NULL,'Scampi Gegrillt',32,1,'2026-03-23 12:26:57.831','2026-03-23 12:26:57.831'),(34,'/uploads/1774268716962-Schaf_Kaese_mit_Zwiebel_und_olivion-bearbeitet-scaled.png',NULL,'Schaf Kaese mit Zwiebel und Oliven',33,1,'2026-03-23 12:26:57.836','2026-03-23 12:26:57.836'),(35,'/uploads/1774268717031-Spinaci-Spaghetti.png',NULL,'Spaghetti Spinaci',35,1,'2026-03-23 12:26:57.849','2026-03-23 12:26:57.849'),(36,'/uploads/1774268717054-Tomaten_Salat-bearbeitet-scaled.png',NULL,'Tomaten Salat',36,1,'2026-03-23 12:26:57.849','2026-03-23 12:26:57.849'),(37,'/uploads/1774268716976-Spareribs.png',NULL,'Spareribs',34,1,'2026-03-23 12:26:57.849','2026-03-23 12:26:57.849');
/*!40000 ALTER TABLE `CarouselImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LegalPage`
--

DROP TABLE IF EXISTS `LegalPage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LegalPage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LegalPage_type_key` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LegalPage`
--

LOCK TABLES `LegalPage` WRITE;
/*!40000 ALTER TABLE `LegalPage` DISABLE KEYS */;
INSERT INTO `LegalPage` VALUES (1,'impressum','<h1>Impressum</h1><p>Informationspflicht laut ┬º 5 E-Commerce Gesetz, ┬º 14 Unternehmensgesetzbuch, ┬º 63 Gewerbeordnung und Offenlegungspflicht laut ┬º 25 Mediengesetz.</p><h2>Angaben zum Unternehmen</h2><p><strong>Pizzeria Da Corrado</strong><br>OG<br>Inhaber: Riaz Hussain<br>Linzerstra├ƒe 86<br>1140 Wien<br>├ûsterreich</p><h2>Kontakt</h2><p><strong>Telefon:</strong> 01 894 31 66<br><strong>E-Mail:</strong> <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"mailto:office@pizzeria1140.at\">office@pizzeria1140.at</a><br><strong>Website:</strong> <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://pizzeria1140.at\">https://pizzeria1140.at</a></p><h2>Umsatzsteuer-Identifikationsnummer</h2><p>ATU64231334</p><h2>Firmenbucheintrag</h2><p>FN FN 307388t ┬À Handelsgericht Wien</p><h2>Berufsrecht und Berufsbezeichnung</h2><p><strong>Gewerbe:</strong> Gastgewerbe<br><strong>Aufsichtsbeh├Ârde:</strong> Magistrat der Stadt Wien<br><strong>Berufsrecht:</strong> Gewerbeordnung: <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://www.ris.bka.gv.at\">www.ris.bka.gv.at</a></p><h2>EU-Streitschlichtung</h2><p>Gem├ñ├ƒ Verordnung ├╝ber Online-Streitbeilegung in Verbraucherangelegenheiten (ODR-Verordnung) m├Âchten wir Sie ├╝ber die Online-Streitbeilegungsplattform (OS-Plattform) informieren.<br>Verbraucher haben die M├Âglichkeit, Beschwerden an die Online Streitbeilegungsplattform der Europ├ñischen Kommission unter <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&amp;lng=DE\">https://ec.europa.eu/consumers/odr</a> zu richten. Die daf├╝r notwendige E-Mail-Adresse lautet: <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"mailto:office@pizzeria1140.at\">office@pizzeria1140.at</a></p><h2>Haftung f├╝r Inhalte dieser Website</h2><p>Wir entwickeln die Inhalte dieser Website st├ñndig weiter und bem├╝hen uns korrekte und aktuelle Informationen bereitzustellen. Leider k├Ânnen wir keine Haftung f├╝r die Korrektheit aller Inhalte auf dieser Website ├╝bernehmen, speziell f├╝r jene, die seitens Dritter bereitgestellt wurden. Sollten Ihnen problematische oder rechtswidrige Inhalte auffallen, bitten wir Sie uns umgehend zu kontaktieren, Sie finden die Angaben im Impressum.</p><h2>Haftung f├╝r Links auf dieser Website</h2><p>Unsere Website enth├ñlt Links zu anderen Websites f├╝r deren Inhalt wir nicht verantwortlich sind. Haftung f├╝r verlinkte Websites besteht f├╝r uns nicht, da wir keine Kenntnis rechtswidriger T├ñtigkeiten hatten und haben, uns solche Rechtswidrigkeiten auch bisher nicht aufgefallen sind und wir Links sofort entfernen w├╝rden, wenn uns Rechtswidrigkeiten bekannt werden.</p><h2>Urheberrechtshinweis</h2><p>Alle Inhalte dieser Webseite (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Bitte fragen Sie uns bevor Sie die Inhalte dieser Website verbreiten, vervielf├ñltigen oder verwerten, wie zum Beispiel auf anderen Websites erneut ver├Âffentlichen. Falls notwendig, werden wir die unerlaubte Nutzung von Teilen der Inhalte unserer Seite rechtlich verfolgen.</p><p><em>Alle Angaben ohne Gew├ñhr. Trotz sorgf├ñltiger inhaltlicher Kontrolle ├╝bernehmen wir keine Haftung f├╝r die Inhalte externer Links. F├╝r den Inhalt der verlinkten Seiten sind ausschlie├ƒlich deren Betreiber verantwortlich.</em></p>','2026-03-24 08:43:09.395'),(2,'datenschutz','<h1>Datenschutzerkl├ñrung</h1><h2>1. Datenschutz auf einen Blick</h2><h3>Allgemeine Hinweise</h3><p>Die folgenden Hinweise geben einen einfachen ├£berblick dar├╝ber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie pers├Ânlich identifiziert werden k├Ânnen. Ausf├╝hrliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgef├╝hrten Datenschutzerkl├ñrung.</p><h3>Datenerfassung auf dieser Website</h3><p><strong>Wer ist verantwortlich f├╝r die Datenerfassung auf dieser Website?</strong><br>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten k├Ânnen Sie dem Abschnitt ÔÇ×Hinweis zur Verantwortlichen Stelle\" in dieser Datenschutzerkl├ñrung entnehmen.</p><h2>2. Hosting und Content Delivery Networks (CDN)</h2><p>Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die ├╝ber eine Website generiert werden, handeln.</p><h2>3. Allgemeine Hinweise und Pflichtinformationen</h2><h3>Datenschutz</h3><p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer pers├Ânlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerkl├ñrung.</p><h3>Hinweis zur verantwortlichen Stelle</h3><p>Die verantwortliche Stelle f├╝r die Datenverarbeitung auf dieser Website ist:</p><p><strong>Pizzeria Da Corrado</strong><br>Riaz Hussain<br>Linzerstra├ƒe 86<br>1140 Wien<br><br>Telefon: 01 894 31 66<br>E-Mail: <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"mailto:office@pizzeria1140.at\">office@pizzeria1140.at</a></p><p>Verantwortliche Stelle ist die nat├╝rliche oder juristische Person, die allein oder gemeinsam mit anderen ├╝ber die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. ├ä.) entscheidet.</p><h3>Speicherdauer</h3><p>Soweit innerhalb dieser Datenschutzerkl├ñrung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck f├╝r die Datenverarbeitung entf├ñllt. Wenn Sie ein berechtigtes L├Âschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gel├Âscht, sofern wir keine anderen rechtlich zul├ñssigen Gr├╝nde f├╝r die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die L├Âschung nach Fortfall dieser Gr├╝nde.</p><h3>Ihre Rechte als betroffene Person</h3><p>Sie haben jederzeit das Recht:</p><ul><li><p>unentgeltlich Auskunft ├╝ber Herkunft, Empf├ñnger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)</p></li><li><p>die Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</p></li><li><p>die L├Âschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen (Art. 17 DSGVO)</p></li><li><p>die Einschr├ñnkung der Datenverarbeitung zu verlangen (Art. 18 DSGVO)</p></li><li><p>der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen (Art. 21 DSGVO)</p></li><li><p>Ihre Daten in einem strukturierten, g├ñngigen Format zu erhalten (Art. 20 DSGVO)</p></li></ul><p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz k├Ânnen Sie sich jederzeit an uns wenden. Sie haben zudem das Recht, bei der zust├ñndigen Aufsichtsbeh├Ârde Beschwerde einzulegen. In ├ûsterreich ist dies die <strong>Datenschutzbeh├Ârde</strong> (<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://www.dsb.gv.at\">www.dsb.gv.at</a>), Barichgasse 40-42, 1030 Wien.</p><h2>4. Datenerfassung auf dieser Website</h2><h3>Kontaktformular / Reservierungsanfragen</h3><p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und f├╝r den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p><p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erf├╝llung eines Vertrags zusammenh├ñngt oder zur Durchf├╝hrung vorvertraglicher Ma├ƒnahmen erforderlich ist. In allen ├╝brigen F├ñllen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit widerrufbar.</p><p>Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur L├Âschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck f├╝r die Datenspeicherung entf├ñllt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen ÔÇô insbesondere Aufbewahrungsfristen ÔÇô bleiben unber├╝hrt.</p><h3>Anfrage per E-Mail oder Telefon</h3><p>Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p><h2>5. Cookies</h2><p>Unsere Website verwendet technisch notwendige Cookies, die f├╝r den Betrieb der Website erforderlich sind. Diese Cookies speichern keine personenbezogenen Daten und sind f├╝r die Grundfunktionen der Website notwendig. Sie k├Ânnen Ihren Browser so einstellen, dass Sie ├╝ber das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies f├╝r bestimmte F├ñlle oder generell ausschlie├ƒen sowie das automatische L├Âschen der Cookies beim Schlie├ƒen des Browsers aktivieren.</p><h2>6. Plugins und Tools</h2><h3>Google Maps</h3><p>Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Zur Nutzung der Funktionen von Google Maps ist es notwendig, Ihre IP-Adresse zu speichern. Diese Informationen werden in der Regel an einen Server von Google in den USA ├╝bertragen und dort gespeichert. Der Anbieter dieser Seite hat keinen Einfluss auf diese Daten├╝bertragung. Wenn Google Maps aktiviert ist, kann Google zum Zwecke der einheitlichen Darstellung der Schriftarten Google Web Fonts verwenden. Beim Aufruf von Google Maps l├ñdt Ihr Browser die ben├Âtigten Web Fonts in ihren Browsercache, um Texte und Schriftarten korrekt anzuzeigen.</p><p>Die Nutzung von Google Maps erfolgt im Interesse einer ansprechenden Darstellung unserer Online-Angebote und an einer leichten Auffindbarkeit der von uns auf der Website angegebenen Orte. Dies stellt ein berechtigtes Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar.</p><p>Mehr Informationen zum Umgang mit Nutzerdaten finden Sie in der Datenschutzerkl├ñrung von Google: <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://policies.google.com/privacy\">https://policies.google.com/privacy</a></p><p><em>Stand: M├ñrz 2026</em></p>','2026-03-24 08:42:27.510');
/*!40000 ALTER TABLE `LegalPage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reservation`
--

DROP TABLE IF EXISTS `Reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `persons` int NOT NULL,
  `date` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reservation`
--

LOCK TABLES `Reservation` WRITE;
/*!40000 ALTER TABLE `Reservation` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RestaurantImage`
--

DROP TABLE IF EXISTS `RestaurantImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RestaurantImage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RestaurantImage`
--

LOCK TABLES `RestaurantImage` WRITE;
/*!40000 ALTER TABLE `RestaurantImage` DISABLE KEYS */;
INSERT INTO `RestaurantImage` VALUES (1,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-2.png','Pizzeria 1140 Wien Da Corrado Lokal 2',NULL,NULL,0,1,'2026-03-23 12:27:43.147','2026-03-23 12:27:43.147'),(2,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-6.png','Pizzeria 1140 Wien Da Corrado Lokal 6',NULL,NULL,4,1,'2026-03-23 12:27:43.157','2026-03-23 12:27:43.157'),(3,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-3.png','Pizzeria 1140 Wien Da Corrado Lokal 3',NULL,NULL,1,1,'2026-03-23 12:27:43.157','2026-03-23 12:27:43.157'),(4,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-4.png','Pizzeria 1140 Wien Da Corrado Lokal 4',NULL,NULL,2,1,'2026-03-23 12:27:43.157','2026-03-23 12:27:43.157'),(5,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-5.png','Pizzeria 1140 Wien Da Corrado Lokal 5',NULL,NULL,3,1,'2026-03-23 12:27:43.157','2026-03-23 12:27:43.157'),(6,'/uploads/1774268858032-Pizzeria-1140-Wien-Da-Corrado-Lokal-7.png','Pizzeria 1140 Wien Da Corrado Lokal 7',NULL,NULL,5,1,'2026-03-23 12:27:43.157','2026-03-23 12:27:43.157'),(7,'/uploads/1774268858152-Pizzeria-1140-Wien-Da-Corrado-Lokal-8.png','Pizzeria 1140 Wien Da Corrado Lokal 8',NULL,NULL,6,1,'2026-03-23 12:27:43.193','2026-03-23 12:27:43.193'),(8,'/uploads/1774268858181-Pizzeria-1140-Wien-Da-Corrado-Lokal-9.png','Pizzeria 1140 Wien Da Corrado Lokal 9',NULL,NULL,7,1,'2026-03-23 12:27:43.239','2026-03-23 12:27:43.239'),(9,'/uploads/1774268858153-Pizzeria-1140-Wien-Da-Corrado-Lokal-10.png','Pizzeria 1140 Wien Da Corrado Lokal 10',NULL,NULL,8,1,'2026-03-23 12:27:43.249','2026-03-23 12:27:43.249');
/*!40000 ALTER TABLE `RestaurantImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceCard`
--

DROP TABLE IF EXISTS `ServiceCard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceCard` (
  `id` int NOT NULL AUTO_INCREMENT,
  `headline` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imageAlt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceCard`
--

LOCK TABLES `ServiceCard` WRITE;
/*!40000 ALTER TABLE `ServiceCard` DISABLE KEYS */;
INSERT INTO `ServiceCard` VALUES (1,'Lieferservice','Unser schneller Lieferservice bringt Ihre Lieblingsgerichte direkt zu Ihnen nach Hause!','/uploads/1774268453526-Lieferservice-Pizzeria-Da-Corrado-1140-Wien-Linzer-Strasse.jpg','Lieferservice Pizzeria Da Corrado',1,1,'2026-03-23 12:07:44.195','2026-03-24 08:25:36.001','https://bestellung.pizzeria1140.at/'),(2,'Weine','Unverwechselbarer Geschmack und h├Âchste Qualit├ñt ÔÇô ein wahrer Genuss! Reservieren Sie heute noch einen Tisch bei uns.','/uploads/1774268488694-Wein.webp','Weine Da Corrado',2,1,'2026-03-23 12:07:44.210','2026-03-23 12:21:30.480',NULL),(3,'Schnitzel','Unsere Schnitzel und Cordon Bleu werden aus hochwertigem Fleisch zubereitet und goldbraun gebraten ÔÇô ein unvergleichlicher Genuss!','/uploads/1774268501868-Wiener-Schnitzel-scaled.jpg','Wiener Schnitzel Da Corrado',3,1,'2026-03-23 12:07:44.223','2026-03-23 12:21:43.343',NULL),(4,'Fisch','Unsere Fischspezialit├ñten sind fangfrisch und meisterhaft zubereitet ÔÇô ein wahrer Genuss f├╝r Fischliebhaber!','/uploads/1774268528557-94253.jpg','Fischgerichte Da Corrado',4,1,'2026-03-23 12:07:44.236','2026-03-23 12:22:09.842',NULL),(5,'Pasta','Spaghetti ist eine der bekanntesten Pastasorten und besteht aus Hartweizengri├ƒ und Wasser. Sie werden oft mit verschiedenen Saucen wie Bolognese oder Carbonara serviert und sind weltweit beliebt.','/uploads/1774268546441-Spaghetti-scaled.jpg','Pasta Da Corrado',5,1,'2026-03-23 12:07:44.246','2026-03-23 12:22:27.794',NULL),(6,'Burger','Saftige Burger mit frischen Zutaten ÔÇô handgemacht und nach Ihrem Geschmack! Von klassisch bis ausgefallen, f├╝r jeden etwas dabei.','/uploads/1774337205335-Burger_am_Grill.webp','Da Corrado Burger Angebote',5,1,'2026-03-24 07:28:22.168','2026-03-24 07:28:22.168',NULL);
/*!40000 ALTER TABLE `ServiceCard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Settings`
--

DROP TABLE IF EXISTS `Settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Settings_key_key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Settings`
--

LOCK TABLES `Settings` WRITE;
/*!40000 ALTER TABLE `Settings` DISABLE KEYS */;
INSERT INTO `Settings` VALUES (1,'site_title','Pizzeria Da Corrado | 1140 Wien','2026-03-24 08:41:31.179'),(2,'site_description','Pizzeria Da Corrado in 1140 Wien - Authentische italienische K├╝che, Pizza, Pasta, Burger und mehr. Lieferservice und Tischreservierung.','2026-03-24 08:41:31.179'),(3,'logo_url','/uploads/1774268215538-logo.webp','2026-03-24 08:41:31.180'),(4,'restaurant_name','Pizzeria Da Corrado','2026-03-24 08:41:31.183'),(5,'restaurant_address','Linzer Stra├ƒe 86, 1140 Wien','2026-03-24 08:41:31.179'),(6,'restaurant_phone','01 894 31 66','2026-03-24 08:41:31.180'),(7,'restaurant_email','office@pizzeria1140.at','2026-03-24 08:41:31.180'),(8,'restaurant_lat','48.1939154','2026-03-24 08:41:31.180'),(9,'restaurant_lng','16.3043904','2026-03-24 08:41:31.182'),(10,'opening_hours','[{\"day\":\"Montag\",\"open\":\"11:00\",\"close\":\"23:00\",\"closed\":false},{\"day\":\"Dienstag\",\"open\":\"11:00\",\"close\":\"23:00\",\"closed\":false},{\"day\":\"Mittwoch\",\"open\":\"11:00\",\"close\":\"23:00\",\"closed\":false},{\"key\":\"Donnerstag\",\"open\":\"11:00\",\"close\":\"23:00\",\"closed\":false},{\"day\":\"Freitag\",\"open\":\"11:00\",\"close\":\"23:30\",\"closed\":false},{\"day\":\"Samstag\",\"open\":\"11:00\",\"close\":\"23:30\",\"closed\":false},{\"day\":\"Sonntag\",\"open\":\"12:00\",\"close\":\"23:00\",\"closed\":false}]','2026-03-24 08:41:31.180'),(11,'og_image','/uploads/1774341557812-Screenshot_2026-03-24_093851.webp','2026-03-24 08:41:31.180'),(12,'google_analytics','','2026-03-24 08:41:31.181'),(13,'favicon_url','/uploads/1774341121857-dacorrado-icon.webp','2026-03-24 08:41:31.180'),(14,'rechtsform','OG','2026-03-24 08:41:31.181'),(15,'atu_nummer','ATU64231334','2026-03-24 08:41:31.181'),(16,'restaurant_strasse','Linzerstra├ƒe 86','2026-03-24 08:41:31.181'),(17,'restaurant_plz','1140','2026-03-24 08:41:31.181'),(18,'restaurant_ort','Wien','2026-03-24 08:41:31.181'),(19,'firmenbuchgericht','Handelsgericht Wien','2026-03-24 08:41:31.182'),(20,'behoerde','Magistrat der Stadt Wien','2026-03-24 08:41:31.181'),(21,'inhaber_name','Riaz Hussain','2026-03-24 08:41:31.182'),(22,'fn_nummer','FN 307388t','2026-03-24 08:41:31.182'),(23,'gewerbe','Gastgewerbe','2026-03-24 08:41:31.182');
/*!40000 ALTER TABLE `Settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SlideshowImage`
--

DROP TABLE IF EXISTS `SlideshowImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SlideshowImage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imageRight` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SlideshowImage`
--

LOCK TABLES `SlideshowImage` WRITE;
/*!40000 ALTER TABLE `SlideshowImage` DISABLE KEYS */;
INSERT INTO `SlideshowImage` VALUES (2,'/uploads/1774310120501-Da-Corrado-Hero.webp','Da Corrado Lieferservice','JETZT DIREKT BEI UNS BESTELLEN','Unser hauseigener Lieferservice ist nun online. Bestellen Sie direkt auf unserer Website ÔÇö ohne Umwege, ohne Extrakosten. Schnell, einfach und bequem!',0,1,'2026-03-23 13:02:39.599','2026-03-23 23:55:24.058','https://bestellung.pizzeria1140.at/',NULL);
/*!40000 ALTER TABLE `SlideshowImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SocialMedia`
--

DROP TABLE IF EXISTS `SocialMedia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SocialMedia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SocialMedia`
--

LOCK TABLES `SocialMedia` WRITE;
/*!40000 ALTER TABLE `SocialMedia` DISABLE KEYS */;
INSERT INTO `SocialMedia` VALUES (2,'Facebook','https://www.facebook.com/profile.php?id=100070966030473','facebook',1,0);
/*!40000 ALTER TABLE `SocialMedia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Speisekarte`
--

DROP TABLE IF EXISTS `Speisekarte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Speisekarte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdfUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unsere Speisekarte',
  `description` text COLLATE utf8mb4_unicode_ci,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Speisekarte`
--

LOCK TABLES `Speisekarte` WRITE;
/*!40000 ALTER TABLE `Speisekarte` DISABLE KEYS */;
INSERT INTO `Speisekarte` VALUES (1,'/uploads/1774337512137-Speisekarte_2025.webp','/uploads/1774337518953-Speisekarte_November_2025-kleiner.pdf','Unsere Speisekarte','Liebe G├ñste,\n\nin ├£bereinstimmung mit der Verordnung des Bundesministeriums f├╝r Gesundheit zur Kennzeichnung von Allergenen informieren wir Sie gerne ├╝ber die Allergene in unseren Speisen. In unserer K├╝che verarbeiten wir Produkte, die\nfolgende Allergene enthalten k├Ânnen: Gluten, Krebstiere, Eier, Fische, Erdn├╝sse, Soja, Milch (einschlie├ƒlich Laktose), N├╝sse, Sellerie, Senf, Sesamsamen, Schwefeldioxid/Sulphite, Lupinen und Weichtiere.\n\nBitte informieren Sie uns vor Ihrer Bestellung ├╝ber eventuelle Lebensmittelallergien oder -unvertr├ñglichkeiten. Wir sind bem├╝ht, Ihnen genaue Informationen ├╝ber die in unseren Gerichten enthaltenen Allergene zu geben und beraten Sie gerne bei der Auswahl einer f├╝r Sie geeigneten Speise. Ihre Gesundheit und Ihr Wohlbefinden sind uns wichtig. Wir danken Ihnen f├╝r Ihr Vertrauen und w├╝nschen Ihnen einen angenehmen Aufenthalt und einen genussvollen Appetit.','2026-03-24 07:32:02.336');
/*!40000 ALTER TABLE `Speisekarte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'office@nextpuls.com','$2b$12$MPLMWBMf1J2p1q7oQILFa.UCERNLfFCj6oqClum/XAD35mVqo58oO','Admin','2026-03-23 12:07:44.003','2026-03-23 12:07:44.003');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24  9:41:10

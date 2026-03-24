SET NAMES utf8mb4;

-- Fix known broken frontend texts with clean UTF-8 content.

UPDATE Speisekarte
SET description = 'Liebe Gäste,

in Übereinstimmung mit der Verordnung des Bundesministeriums für Gesundheit zur Kennzeichnung von Allergenen informieren wir Sie gerne über die Allergene in unseren Speisen. In unserer Küche verarbeiten wir Produkte, die folgende Allergene enthalten können: Gluten, Krebstiere, Eier, Fische, Erdnüsse, Soja, Milch (einschließlich Laktose), Nüsse, Sellerie, Senf, Sesamsamen, Schwefeldioxid/Sulphite, Lupinen und Weichtiere.

Bitte informieren Sie uns vor Ihrer Bestellung über eventuelle Lebensmittelallergien oder -unverträglichkeiten. Wir sind bemüht, Ihnen genaue Informationen über die in unseren Gerichten enthaltenen Allergene zu geben und beraten Sie gerne bei der Auswahl einer für Sie geeigneten Speise. Ihre Gesundheit und Ihr Wohlbefinden sind uns wichtig. Wir danken Ihnen für Ihr Vertrauen und wünschen Ihnen einen angenehmen Aufenthalt und einen genussvollen Appetit.'
WHERE id = 1;

UPDATE ServiceCard
SET text = 'Unverwechselbarer Geschmack und höchste Qualität – ein wahrer Genuss! Reservieren Sie heute noch einen Tisch bei uns.'
WHERE id = 2;

UPDATE ServiceCard
SET text = 'Unsere Schnitzel und Cordon Bleu werden aus hochwertigem Fleisch zubereitet und goldbraun gebraten – ein unvergleichlicher Genuss!'
WHERE id = 3;

UPDATE ServiceCard
SET text = 'Unsere Fischspezialitäten sind fangfrisch und meisterhaft zubereitet – ein wahrer Genuss für Fischliebhaber!'
WHERE id = 4;

UPDATE ServiceCard
SET text = 'Spaghetti ist eine der bekanntesten Pastasorten und besteht aus Hartweizengrieß und Wasser. Sie werden oft mit verschiedenen Saucen wie Bolognese oder Carbonara serviert und sind weltweit beliebt.'
WHERE id = 5;

UPDATE ServiceCard
SET text = 'Saftige Burger mit frischen Zutaten – handgemacht und nach Ihrem Geschmack! Von klassisch bis ausgefallen, für jeden etwas dabei.'
WHERE id = 6;

UPDATE Settings
SET value = 'Linzer Straße 86, 1140 Wien'
WHERE `key` = 'restaurant_address';

UPDATE Settings
SET value = 'Pizzeria Da Corrado in 1140 Wien - Authentische italienische Küche, Pizza, Pasta, Burger und mehr. Lieferservice und Tischreservierung.'
WHERE `key` = 'site_description';

-- Fix malformed opening-hours entry (key -> day)
UPDATE Settings
SET value = REPLACE(value, '\"key\":\"Donnerstag\"', '\"day\":\"Donnerstag\"')
WHERE `key` = 'opening_hours' AND value LIKE '%\"key\":\"Donnerstag\"%';

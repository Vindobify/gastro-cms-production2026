SELECT HEX(SUBSTRING(description, 1, 120)) AS speisekarte_hex
FROM Speisekarte
WHERE id = 1;

SELECT HEX(SUBSTRING(text, 1, 120)) AS service_hex
FROM ServiceCard
WHERE id = 2;

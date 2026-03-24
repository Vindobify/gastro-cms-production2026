SELECT id, LEFT(description, 180) AS sample
FROM Speisekarte;

SELECT id, LEFT(text, 180) AS sample
FROM ServiceCard;

SELECT id, `key`, LEFT(value, 180) AS sample
FROM Settings
WHERE `key` IN ('site_description', 'restaurant_address');

-- Fix mojibake by reinterpreting wrongly decoded latin1/utf8 text back to utf8mb4.
-- Only updates rows that contain typical broken markers.

UPDATE Speisekarte
SET description = CONVERT(CAST(CONVERT(description USING latin1) AS BINARY) USING utf8mb4)
WHERE description IS NOT NULL
  AND (
    description LIKE '%Ã%'
    OR description LIKE '%Â%'
    OR description LIKE '%â%'
    OR description LIKE '%├%'
    OR description LIKE '%ÔÇ%'
    OR description LIKE '%�%'
  );

UPDATE ServiceCard
SET text = CONVERT(CAST(CONVERT(text USING latin1) AS BINARY) USING utf8mb4)
WHERE text IS NOT NULL
  AND (
    text LIKE '%Ã%'
    OR text LIKE '%Â%'
    OR text LIKE '%â%'
    OR text LIKE '%├%'
    OR text LIKE '%ÔÇ%'
    OR text LIKE '%�%'
  );

UPDATE Settings
SET value = CONVERT(CAST(CONVERT(value USING latin1) AS BINARY) USING utf8mb4)
WHERE value IS NOT NULL
  AND (
    value LIKE '%Ã%'
    OR value LIKE '%Â%'
    OR value LIKE '%â%'
    OR value LIKE '%├%'
    OR value LIKE '%ÔÇ%'
    OR value LIKE '%�%'
  );

-- UTF-8 hardening for MySQL (run inside the target database)
-- Goal: enforce utf8mb4 + utf8mb4_unicode_ci on DB, tables, and text columns.

SET NAMES utf8mb4;

-- 1) Database default charset/collation
SET @db_name := DATABASE();
SET @sql_db := CONCAT(
  'ALTER DATABASE `',
  @db_name,
  '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
);
PREPARE stmt FROM @sql_db;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Convert all base tables in current DB
SELECT GROUP_CONCAT(
  CONCAT(
    'ALTER TABLE `',
    TABLE_NAME,
    '` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  )
  SEPARATOR '; '
) INTO @table_sql
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = @db_name
  AND TABLE_TYPE = 'BASE TABLE';

SET @table_sql := IFNULL(@table_sql, 'SELECT 1');
PREPARE stmt FROM @table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Ensure all textual columns explicitly use utf8mb4
SELECT GROUP_CONCAT(
  CONCAT(
    'ALTER TABLE `',
    TABLE_NAME,
    '` MODIFY `',
    COLUMN_NAME,
    '` ',
    COLUMN_TYPE,
    ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    IF(IS_NULLABLE = 'NO', ' NOT NULL', ''),
    IF(COLUMN_DEFAULT IS NOT NULL, CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT)), '')
  )
  SEPARATOR '; '
) INTO @column_sql
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db_name
  AND DATA_TYPE IN ('char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext');

SET @column_sql := IFNULL(@column_sql, 'SELECT 1');
PREPARE stmt FROM @column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

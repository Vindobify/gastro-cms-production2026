#!/usr/bin/env sh
set -eu

DB_CONTAINER="${DB_CONTAINER:-dacorrado_db}"
DB_NAME="${DB_NAME:-dacorrado}"
DB_USER="${DB_USER:-dacorrado}"
DB_PASS="${DB_PASS:-dacorrado1234}"

mysql_exec() {
  docker exec "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1"
}

mysql_exec "ALTER DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

TABLES="$(docker exec "$DB_CONTAINER" mysql -N -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT table_name FROM information_schema.tables WHERE table_schema = '$DB_NAME' AND table_type = 'BASE TABLE';")"
for table in $TABLES; do
  mysql_exec "ALTER TABLE \`$table\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
done

echo "UTF-8/utf8mb4 conversion completed for database: $DB_NAME"

#!/bin/bash
cd /var/www/gastro-cms-production
docker compose -f docker-compose.production.yml exec -T db psql -U gastrocms -d gastro_cms_multi <<EOF
SELECT id, name, domain, subdomain, "isActive" FROM tenants;
EOF


module.exports = {
  apps: [{
    name: 'gastro-cms-root',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/gastro-cms-root',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: 'localhost'
    },
    error_file: '/var/www/gastro-cms-root/logs/error.log',
    out_file: '/var/www/gastro-cms-root/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};


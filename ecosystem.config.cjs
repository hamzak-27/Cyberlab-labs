module.exports = {
  apps: [{
    name: 'labs-backend',
    script: 'server.js',
    cwd: '/opt/cyberlabs/labs-backend',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5002,
      NODE_OPTIONS: '--env-file=.env.production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/cyberlabs/labs-backend-error.log',
    out_file: '/var/log/cyberlabs/labs-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}

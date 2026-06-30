// PM2 process manager — keeps Node running on VPS after reboot
// Usage: pm2 start ecosystem.config.cjs && pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'profile-website',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};

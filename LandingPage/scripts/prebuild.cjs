/* Unix: Berechtigungen für Deploy-Server; Windows: noop */
const { execSync } = require('child_process')
if (process.platform === 'win32') process.exit(0)
try {
  execSync('chmod -R 755 .', { stdio: 'inherit' })
} catch {
  process.exit(0)
}

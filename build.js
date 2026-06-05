const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your build message: ', (message) => {
  exec('ng build --configuration production', (err, stdout, stderr) => {
    const logMessage = `Build ${err ? 'failed' : 'completed successfully'} at ${new Date()}: ${message}\n`;
    fs.appendFileSync('build_log.txt', logMessage);

    if (err) {
      console.error(`Build failed: ${stderr}`);
    } else {
      console.log(`Build completed successfully: ${stdout}`);
    }

    rl.close();
  });
});

const http = require('http');
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/login' && req.method === 'POST') {
    res.end(JSON.stringify({ error: 'Not configured - demo mode' }));
  } else {
    res.end(JSON.stringify({ status: 'ok', message: 'CallPilot API' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('CallPilot API running on port ' + PORT);
});

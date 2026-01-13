const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
    res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
    });
});

// API endpoints
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello from Antigravity CI/CD!',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/info', (req, res) => {
    res.json({
        app: 'Antigravity Sample App',
        version: process.env.APP_VERSION || '1.0.0',
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Antigravity Sample App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .endpoint {
            background: #f0f0f0;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Antigravity Sample Application</h1>
          <p>Welcome to the Antigravity CI/CD demo application!</p>
          
          <h2>Available Endpoints:</h2>
          <div class="endpoint">GET /health - Health check</div>
          <div class="endpoint">GET /ready - Readiness check</div>
          <div class="endpoint">GET /api/hello - Hello message</div>
          <div class="endpoint">GET /api/info - Application info</div>
          
          <p><strong>Version:</strong> ${process.env.APP_VERSION || '1.0.0'}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Antigravity app listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Version: ${process.env.APP_VERSION || '1.0.0'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

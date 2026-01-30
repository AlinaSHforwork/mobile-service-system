const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Allow frontend to make requests
app.use(cors());
app.use(express.json());

// Routing
// All requests to /api/auth/* are forwarded to Auth Service
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '', // прибираємо префікс /api/auth перед відправкою
    },
}));

// All requests to /api/orders/* are forwarded to Order Service
app.use('/api/orders', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:4002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/orders': '',
    },
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});

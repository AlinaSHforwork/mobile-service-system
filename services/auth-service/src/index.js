const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Connection to MongoDB / Підключення до БД
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Auth-Service connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test Route /Тестовий маршрут
app.get('/', (req, res) => {
    res.send('Auth Service Works! Ready for Login/Register.');
});

// ADD: Тут пізніше app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});

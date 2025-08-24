// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración de CORS Universal y Robusta ---
const allowedOrigins = [
    'https://frontend-production-f4b0.up.railway.app/', // Frontend en Producción
    'http://localhost:3000'                   // Frontend en Desarrollo Local
];

app.use(cors()); // <-- Usa la nueva configuración
app.use(express.json());

// --- Rate Limiting ---
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: `Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.`
});
app.use('/api', limiter);

// --- Conexión a la Base de Datos ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log(' ✅ MongoDB conectado exitosamente.'))
    .catch(err => console.error(' ❌ Error de conexión a MongoDB:', err));

// --- Rutas de la API ---
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/', (req, res) => {
    res.send('API del Sistema de Biblioteca CRA está funcionando!');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/import', require('./routes/importRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
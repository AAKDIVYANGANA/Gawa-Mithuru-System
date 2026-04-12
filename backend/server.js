const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cattle', require('./routes/cattleRoutes'));
app.use('/api/milk', require('./routes/milkRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/ai-requests', require('./routes/aiRequestRoutes'));
app.use('/api/advice', require('./routes/adviceRoutes'));
app.use('/api/ldo', require('./routes/ldoRoutes'));
app.use('/api/vaccinations', require('./routes/vaccinationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'GawaMithuru API is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  });
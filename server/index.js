const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3030'], // Update with your frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

const userRoutes = require('./routes/userRoutes');
const venderRoutes = require('./routes/venderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { seedSuperAdmin } = require('./Utils/seeder');

mongoose.connect('mongodb+srv://hydrohitchofficial:supersecretpassword@cluster0.5zm4ggk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
  seedSuperAdmin()
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

app.get('/', (req, res) => {
  res.json({ msg: "Running" });
});

app.use('/api/user', userRoutes);
app.use('/api/vender', venderRoutes);
// app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

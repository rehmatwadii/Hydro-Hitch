const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Update with your frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
}));
app.use(express.json());
app.use(cookieParser());

const userRoutes = require('./routes/userRoutes');
const venderRoutes = require('./routes/venderRoutes');
const adminRoutes = require('./routes/adminRoutes');

mongoose.connect('mongodb+srv://hydro-hitch:watertanker@cluster0.mgxncoy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

app.get('/app', (req, res) => {
  res.json({ msg: "Running" });
});

app.use('/api/user', userRoutes);
app.use('/api/vender', venderRoutes);
// app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

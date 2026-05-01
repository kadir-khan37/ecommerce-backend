const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/usermodel');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require("jsonwebtoken");

const app = express();
// if you make this project backend heavy when ever make .env and put db string and sensitive things into that
// Middleware
app.use(cors({
  origin:['http://localhost:5173',
  'https://kadir-shop.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// DB Connection
mongoose.connect('mongodb+srv://kk8045433_db_user:8iIIJ5OagyIu0sfM@cluster0.dubkmfv.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Test route
app.get('/', (req, res) => {
  res.send('Backend running');
});


// ================= SIGNUP =================
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    // Hash password
    const hashedpassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedpassword
    });

    // Remove password from response
    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      message: 'User registered successfully',
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ================= LOGIN =================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "No user with this email"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
        "secret_key",
      { expiresIn: "1d" }
    );

    // Remove password
    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});


// Server start
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
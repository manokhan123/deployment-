const dns = require("dns");
const env = require('env')
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
   process.env.MONGODB_CONNECTION 
  )
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });

// Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Model
const User = mongoose.model("User", userSchema);

// Home route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Register route
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
    });
  }
});

// Server
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

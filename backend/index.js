import express from "express";
import { connect } from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import path from "path"

import routes from "./routes/auth.routes.js";

const app = express();
dotenv.config();
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true,  // Allows cookies to be sent
}));
app.use(cookieParser());

// Collision data schema and model
import mongoose from "mongoose";
const collisionSchema = new mongoose.Schema({
  impact: String,
  temperature: Number,
  orientation: String,
  location: { lat: String, long: String },
  createdAt: { type: Date, default: Date.now },
});
const Collision = mongoose.model("Collision", collisionSchema);

// Define routes
app.use('/', routes);

app.post("/api/collisions", async (req, res) => {
  try {
    const { impact, temperature, orientation, location } = req.body;

    const collisionData = new Collision({ impact, temperature, orientation, location });

    await collisionData.save(); 

    res.status(201).json({ message: 'Collision data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving collision data.' });
  }

});

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  })
}

const PORT = 3000;
const server = app.listen(PORT, async () => {
  await connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
  console.log(`Server listening on port ${PORT}`);
});

// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Check for new collision data every second
let lastCheckedTime = new Date();

setInterval(async () => {
  try {
    // Query MongoDB for new collision data since the last checked time
    const newCollisions = await Collision.find({ createdAt: { $gt: lastCheckedTime } });

    if (newCollisions.length > 0) {
      console.log("New collision data found:", newCollisions);

      // Update lastCheckedTime to the latest data's timestamp
      lastCheckedTime = new Date();

      // Emit the new collision data to all connected clients
      io.emit("newCollisionData", newCollisions);
    }
  } catch (error) {
    console.error("Error checking for new collision data:", error);
  }
}, 1000); // Check every 1 second

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

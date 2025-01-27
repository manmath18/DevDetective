import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from a .env file

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI; // Use an environment variable for the connection string
if (!mongoURI) {
    console.error("MongoDB URI is not defined in the environment variables.");
    process.exit(1);
}

mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Define Schema and Model
const searchSchema = new mongoose.Schema({
    username: { type: String, required: true },
    searchedAt: { type: Date, default: Date.now },
});

const Search = mongoose.model("Search", searchSchema);

// Routes

// Get all search history
app.get("/api/search-history", async (req, res) => {
    try {
        const history = await Search.find().sort({ searchedAt: -1 });
        res.json(history);
    } catch (err) {
        console.error("Error fetching search history:", err);
        res.status(500).json({ error: "Failed to fetch search history" });
    }
});

// Save a new search
app.post("/api/search", async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }
    try {
        const newSearch = new Search({ username });
        await newSearch.save();
        res.status(201).json({ message: "Search saved successfully", search: newSearch });
    } catch (err) {
        console.error("Error saving search:", err);
        res.status(500).json({ error: "Failed to save search" });
    }
});

// Health check route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 4904;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

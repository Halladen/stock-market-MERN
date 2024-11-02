const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://mydb:ZJnpeekjHJA5RljK@cluster0.z21zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to mongodb database
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedToPology: true,
  })
  .then(() => console.log("connected to mongodb"))
  .catch((error) => console.log(error));

// create db schema
const stockSchema = new mongoose.Schema({
  company: String,
  description: String,
  initial_price: Number,
  price_2002: Number,
  price_2007: Number,
  symbol: String,
});

// create db document
const Stock = mongoose.model("Stock", stockSchema);
const Watchlist = mongoose.model("watchlist", stockSchema);

app.get("/api/stocks", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/watchlist", async (req, res) => {
  try {
    const watchlist = await Watchlist.find();

    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/watchlist", async (req, res) => {
  try {
    const {
      company,
      description,
      initial_price,
      price_2002,
      price_2007,
      symbol,
    } = req.body;

    const findItem = await Watchlist.findOne({ symbol: symbol });
    if (findItem) {
      return res.json({ message: "stock already in watchlist" });
    }

    const newStock = new Watchlist({
      company,
      description,
      initial_price,
      price_2002,
      price_2007,
      symbol,
    });

    await newStock.save();

    res.json({ message: "Stock added to watchlist successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/delete", async (req, res) => {
  try {
    const { symbol } = req.body;
    const deleteWatchlist = await Watchlist.deleteOne({ symbol: symbol });
    res.json({ message: "Stock removed from Watchlist successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log("app listening on port " + PORT + "...");
});

import Path from "node:path";
import Express from "express";
import { generateHTML } from "./generateHTML.mjs";
import { generateIMG } from "./generateIMG.mjs";

// Constants
const PORT = process.env.PORT || 3000;
const RATIO = 0.7;
const HEIGHT = 1800;
const WIDTH = HEIGHT * RATIO;

// Server
const app = Express();

// Static
app.use(Express.static("static"));

// HTML Rendering
app.get("/html/:month", async (req, res) => {
  try {
    const { month } = req.params;
    const html = await generateHTML(month, WIDTH, HEIGHT);
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Image Rendering
app.get("/img/:month", async (req, res) => {
  try {
    const { month } = req.params;
    const htmlURL = `${req.protocol}://${req.get("host")}/html/${month}`;
    const filePath = await generateIMG(month, WIDTH, HEIGHT, htmlURL);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Return existing images
app.get("/calendar/:month", async (req, res) => {
  try {
    const { month } = req.params;
    const filePath = Path.resolve(`./renders/${month}.jpg`);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// ...Listen
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

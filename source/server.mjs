import Path from "node:path";
import Express from "express";
import { Settings, DateTime } from "luxon";
import { CALENDAR } from "./calendarFeed.mjs";
import { fetchCalendarXLSX } from "./fetchCalendarXLSX.mjs";
import { generateCalendarHTML } from "./generateCalendarHTML.mjs";
import { generateCalendarIMG } from "./generateCalendarIMG.mjs";
import { generateIndexHTML } from "./generateIndexHTML.mjs";


// Constants
const PORT = process.env.PORT || 3000;
const RATIO = 0.7;
const HEIGHT = 1800;
const WIDTH = HEIGHT * RATIO;

// Set the Luxon locale to Swedish
Settings.defaultLocale = "sv";

// Function that gets the month from the request object or the current month if not specified
const getMonth = (req) => {
  const { month } = req.params;
  if (month) {
    return month;
  }
  else {
    return DateTime.now().toFormat("yyyy-MM")
  }
}

// Server
const app = Express();

// Static Files
app.use(Express.static("static"));

// Index rendering
app.get("/", async (_, res) => {
  try {
    const workbook = await fetchCalendarXLSX();
    const html = await generateIndexHTML(workbook);
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Calendar iCal feed 
app.get("/ical", async (_, res) => {
  try {
    res.writeHead(200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="uddebo-kalendern.ics"'
    });
    res.end(CALENDAR.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


// Calendar HTML Rendering
app.get(["/html/:month", "/html/"], async (req, res) => {
  try {
    const month = getMonth(req);
    const workbook = await fetchCalendarXLSX();
    const html = await generateCalendarHTML(workbook, month, WIDTH, HEIGHT, "calendar");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Calendar Image Rendering
app.get(["/img/:month", "/calendar/:month", "/img/", "/calendar/"], async (req, res) => {
  try {
    const month = getMonth(req);
    const htmlURL = `${req.protocol}://${req.get("host")}/html/${month}`;
    const filePath = await generateCalendarIMG(month, WIDTH, HEIGHT, htmlURL);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Clean Calendar HTML Rendering
app.get(["/clean/html/:month", "/clean/html/"], async (req, res) => {
  try {
    const month = getMonth(req);
    const workbook = await fetchCalendarXLSX();
    const html = await generateCalendarHTML(workbook, month, WIDTH, HEIGHT, "cleancalendar");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Clean Calendar Image Rendering
app.get(["/clean/img/:month", "/clean/calendar/:month", "/clean/img", "/clean/calendar"], async (req, res) => {
  try {
    const month = getMonth(req);
    const htmlURL = `${req.protocol}://${req.get("host")}/cleanhtml/${month}`;
    const filePath = await generateCalendarIMG(month, WIDTH, HEIGHT, htmlURL);
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Return existing images
app.get(["/cached/","/cached/:month"], async (req, res) => {
  try {
    const month = getMonth(req);
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

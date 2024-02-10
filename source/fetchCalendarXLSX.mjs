import ExcelJS from "exceljs";
import { DateTime, Interval } from "luxon";
import FS from "node:fs";
import Path from "node:path";
import Stream from "node:stream";
import StreamPromises from "node:stream/promises";
import { updateCalendarFeed } from "./calendarFeed.mjs";

/** Tracker for when the xlsx data was updated from google spreadsheets */
let FETCH_TIME;

/** Time in seconds to wait between updating source xlsx data */
const WAIT_TIME_SECONDS = 15;

/** Path to cached xlsx */
const XLSX_CACHE_PATH = "data.xlsx";

/** The URL to fetch xlsx data from */
const XLSX_URL =
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vQpvU93dSYZdotPAKR93y9DriX4CFGp2PUbBjyfdM77x5178IrUHbP5FwnbNnRt0aWUzukAs7Fgn2zB/pub?output=xlsx";

/** Returns the parsed XLSX workbook from either the source or the cache */
export async function fetchCalendarXLSX() {
	// Keep track of the last fetch time and stop concurrent and to early xlsx fetches
	if (FETCH_TIME) {
		let secondsSinceUpdated = Interval.fromDateTimes(
			FETCH_TIME,
			DateTime.now()
		).length("seconds");

		// Read and return the workbook directly if cached and timely
		if (secondsSinceUpdated <= WAIT_TIME_SECONDS) {
			return readXLSXFromCache();
		}
	}

	// Download the xlsx data
	console.log("Fetching XSLX from source");
	const stream = FS.createWriteStream(Path.resolve(XLSX_CACHE_PATH));
	const { body } = await fetch(XLSX_URL);

	// Write the xlsx to file
	await StreamPromises.finished(Stream.Readable.fromWeb(body).pipe(stream));
	
	// Read the xlsx data from file
	const workbook = await readXLSXFromCache();
	
	// Update the calendar feed
	await updateCalendarFeed(workbook);
	
	// Update the last fetch time
	FETCH_TIME = DateTime.now();
	
	// Return the workbook
	return workbook;
}

/** Reads the XLSX data on file and returns it as a workbook */
async function readXLSXFromCache() {
	console.log("Reading the xlsx data");
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(Path.resolve(XLSX_CACHE_PATH));

	// Return the workbook
	return workbook;
}

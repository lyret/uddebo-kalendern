import ICal, { ICalEventBusyStatus } from "ical-generator";
import { DateTime } from "luxon";
import { getEventsFromWorksheet } from "./getEventsFromWorksheet.mjs";
// import { EventDocument } from "@models/event";
// import { EventGroupDocument } from "@models/eventGroup";

/** The calendar feed */
export const CALENDAR = ICal({ name: "Uddebo" });

export async function updateCalendarFeed(workbook) {
	console.log("Updating the calendar feed");

	// Clear the calendar
	CALENDAR.clear();

	// Find all added years / months in the workbook
	workbook.eachSheet(function (worksheet) {
		try {
			if (worksheet.state == "visible" && worksheet.name) {
				
				// Get the year / month from the worksheet
				// const dt = DateTime.fromISO(worksheet.name);
				// const year = dt.get("year");
				// const month = dt.get("month");
				
				// Add all events from each worksheet
				for (const event of getEventsFromWorksheet(worksheet)) {
					CALENDAR.createEvent({
						start: event.start,
						end: event.end,
						allDay: true,
						summary: event.title,
						description: "",
						location: "",
						url: "",
						busystatus: ICalEventBusyStatus.FREE,
					});	
				}
			}
		} catch (err) {
			console.error("Failed to add events from", worksheet.name);
			return;
		}
	});
}

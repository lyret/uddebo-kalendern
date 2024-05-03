import Liquid from "liquidjs";
import { getEventsFromWorksheet } from "./getEventsFromWorksheet.mjs";

export async function generateCalendarHTML(workbook, sheetName, width, height, template) {
	console.log("Generating html from the sheet", sheetName);
	const worksheet = workbook.getWorksheet(sheetName);

	if (!worksheet) {
		throw new Error(`No worksheet with the name ${sheetName}`);
	}

  // Events
	const events = getEventsFromWorksheet(worksheet);

	// Retrive footer text
	const footerCell = worksheet.findCell(1, 6);
	const footerText = footerCell ? footerCell.value : "";

	// Retrieve the image
	let imageSrc = "";
	const images = worksheet.getImages();
	if (images && images.length) {
		const image = workbook.model.media.find(
			(m) => m.index === images[0].imageId
		);
		imageSrc =
			`data:image/${image.extension};base64,` + image.buffer.toString("base64");
	}

	// Render the calendar template and return the resulting html
	const engine = new Liquid.Liquid();
	const tpl = await engine.parseFile(`./templates/${template}.liquid`);

	const html = await engine.render(tpl, {
		events: JSON.stringify(events),
		imageSrc,
		footerText,
		month: sheetName,
		width,
		height,
	});
	return html;
}

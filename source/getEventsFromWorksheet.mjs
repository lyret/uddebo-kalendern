
export function getEventsFromWorksheet(worksheet) {
// Events
  let events = [];
  worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
	if (rowNumber < 5) {
	  return;
	}
	let event = {
	  title: row.getCell(3).value,
	  start: row.getCell(1).value,
	};
	if (row.getCell(2).value) {
	  const end = new Date(row.getCell(2).value);
	  end.setDate(end.getDate() + 1);
	  event.end = end;
	}
	if (row.getCell(3).font?.color?.argb) {
	  let color = row.getCell(3).font.color.argb.slice(2, 8);
	  event.textColor = color;
	  event.borderColor = color;
	}
	if (row.getCell(3).fill?.bgColor) {
	  let color = row.getCell(3).fill.bgColor.argb.slice(2, 8);
	  event.backgroundColor = color;
	  event.borderColor = color;
	}
	events.push(event);
  });
  
  // Return the events
  return events
}
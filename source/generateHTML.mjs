import ExcelJS from "exceljs";
import Liquid from "liquidjs";

export async function generateHTML(month, width, height) {
  console.log("Fetching sheet data for", month);

  // Fetch input data
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpvU93dSYZdotPAKR93y9DriX4CFGp2PUbBjyfdM77x5178IrUHbP5FwnbNnRt0aWUzukAs7Fgn2zB/pub?output=xlsx"
  );
  const data = await res.arrayBuffer();

  // Process the workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Viktor Lyresten";
  await workbook.xlsx.load(data);

  const worksheet = workbook.getWorksheet(month);

  if (!worksheet) {
    throw new Error(`No worksheet with the name ${month}`);
  }

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

  // Render the template and return the resulting html
  const engine = new Liquid.Liquid();
  const tpl = await engine.parseFile("./source/template.liquid");

  const html = await engine.render(tpl, {
    events: JSON.stringify(events),
    imageSrc,
    footerText,
    month,
    width,
    height,
  });
  return html;
}

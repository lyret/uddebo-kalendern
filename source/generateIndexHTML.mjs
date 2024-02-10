import Liquid from "liquidjs";
import { DateTime } from "luxon";

export async function generateIndexHTML(workbook) {
  console.log("Generating index page");
  
  
  // Generate links for the index page
  let sheets = [];
  workbook.eachSheet(function(worksheet) {
    try { 
      if (worksheet.state == "visible" && worksheet.name) {
        const dt = DateTime.fromISO(worksheet.name);
        sheets.push({ name: dt.toLocaleString({ month: 'long', year: 'numeric' }), url: worksheet.name });
      }
    }
    catch(err) {
      return;
    }
  });

  // Render the index template and return the resulting html
  const engine = new Liquid.Liquid();
  const tpl = await engine.parseFile("./templates/index.liquid");

  const html = await engine.render(tpl, {
    sheets,
  });
  return html;
}

function render(events, month, footerText, options = {}) {
	const calendarEl = document.getElementById("calendar");
	const articleEl = document.getElementById("article");
	const contentEl = document.getElementById("content");
	const coverEl = document.getElementById("cover");
	const coverImgEl = document.getElementById("coverImg");
	const rootEl = document.querySelector(":root");

	// Calendar
	new FullCalendar.Calendar(calendarEl, {
		events,
		locale: "sv",
		firstDay: 1,
		height: "auto",
		expandRows: true,
		weekNumbers: false,
		fixedWeekCount: false,
		showNonCurrentDates: false,
		dayHeaderFormat: { weekday: "long" },
		headerToolbar: {
			start: "",
			center: "title",
			end: "",
		},
		defaultAllDay: true,
		nextDayThreshold: "00:00:00",
		displayEventTime: false,
		displayEventEnd: false,
		eventTextColor: "#000",
		eventBackgroundColor: "#fff",
		eventBorderColor: "#000",
		nowIndicator: false,
		initialDate: `${month}-01`,
		initialView: "dayGridMonth",
	}).render();

	// Find the first disabled cell and insert the footer text
	const firstDisabledDay =
		document.querySelector(".fc-day-future + .fc-day-disabled") ||
		document.querySelector(".fc-day-disabled");

	if (firstDisabledDay && footerText) {
		const followingDisabledDays = Array.from(
			document.getElementsByClassName("fc-day-disabled")
		).filter((el) => {
			const pos = el.compareDocumentPosition(firstDisabledDay);
			console.log(el, pos);
			return pos == 2;
		});
		firstDisabledDay.setAttribute("colspan", followingDisabledDays.length + 1);
		followingDisabledDays.forEach((el) => el.remove());

		const eventsContainer = firstDisabledDay.querySelector(
			".fc-daygrid-day-events"
		);
		footerText.split("\n").forEach((line) => {
			const event = document.createElement("p");
			event.innerHTML = line;
			event.classList.add("fc-event-footer");
			eventsContainer.appendChild(event);
		});
	}

	// Set the image cover size
	if (options.image) {
		const height = articleEl.offsetHeight - contentEl.offsetHeight + 40;
		coverEl.style.setProperty("max-height", `${height}px`);

		// Wait for the image to load
		new Promise((resolve) => {
			resolve();
			if (coverEl.complete) {
				resolve();
			} else {
				coverEl.addEventListener("load", function () {
					resolve();
				});
			}
		})
			// Set the background color variable from the image
			.then(() => {
				const colorThief = new BackgroundColorTheif();
				const [r, g, b] = colorThief.getBackGroundColor(coverImgEl);
				rootEl.style.setProperty("--page-color", `rgb(${r},${g},${b})`);
			})
			// Signal Pupeteer that we are done
			.then(() => {
				articleEl.id = "done";
			});
	}
  else {
    articleEl.id = "done";
  }
}

/**
 * Copyright (c) 2017 NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import ChartInternal from "./ChartInternal";
import CLASS from "../config/classes";
import {isValue, extend, isFunction} from "./util";

extend(ChartInternal.prototype, {
	initEvent() {
		const $$ = this;

		$$.eventRectHeight = 8;
		$$.event = $$.main.append("g")
			.attr("class", CLASS.events);
	},

	updateEvent(duration) {
		const $$ = this;
		const config = $$.config;

		// hide if arc type
		$$.event.style("visibility", $$.hasArcType() ? "hidden" : "visible");
		$$.mainEvent = $$.main.select(`.${CLASS.events}`)
			.selectAll(`.${CLASS.event}`)
			.data(config.events);

		$$.mainEvent.exit()
			.transition()
			.duration(duration)
			.style("opacity", "0")
			.remove();

		const group = $$.mainEvent.enter()
			.append("g")
			.style("fill-opacity", "0");

		group.append("rect");
		group.append($$.renderEventIcon);

		// Add event handlers
		group.on("mousemove", function(d) {
			$$.showTooltip([
				$$.addName({
					id: d.id,
					value: "event", // Required for tooltip to show up.
					d: d,
					x: d.start // Required for tooltip position.
				})
			], this);
		}).on("mouseout", () => $$.hideTooltip());
		isFunction($$.config.event_onclick) && group.on("click", $$.config.event_onclick);

		$$.mainEvent = group.merge($$.mainEvent)
			.attr("class", $$.classChartEvent.bind($$))
			.attr("fill", $$.color);
	},

	renderEventIcon(d) {
		let element;

		if ("icon" in d) {
			element = document.createElementNS("http://www.w3.org/2000/svg", "image");
			element.setAttribute("x", -10);
			element.setAttribute("y", -12);
			element.setAttribute("width", 20);
			element.setAttribute("height", 20);
			element.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", d.icon);
		} else if ("text" in d) {
			element = document.createElementNS("http://www.w3.org/2000/svg", "text");

			element.innerHTML = d.text;
			element.setAttribute("y", 3);
		} else {
			// Dummy element.
			element = document.createElementNS("http://www.w3.org/2000/svg", "g");
		}

		element.setAttribute("class", CLASS.eventIcon);
		return element;
	},

	redrawEvent(withTransition) {
		const $$ = this;
		const x = $$.eventX.bind($$);
		const y = $$.eventY.bind($$);
		const w = $$.eventWidth.bind($$);
		const h = $$.eventHeight.bind($$);
		const events = (withTransition ? $$.mainEvent.transition() : $$.mainEvent);


		events.select("rect")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h);

		events.select(`.${CLASS.eventIcon}`)
			.attr("transform", d => `translate(${x(d)},${y(d) - 8})`);

		return [
			(withTransition ? events.transition() : events)
				.style("fill-opacity", d => (isValue(d.opacity) ? d.opacity : "0.4"))
		];
	},

	eventX(d) {
		const $$ = this;
		const config = $$.config;

		const xPos = config.axis_rotated ? 0 : (
			"start" in d ? $$.x(
				$$.isTimeSeries() ? $$.parseDate(d.start) : d.start
			) : 0
		);

		return xPos;
	},

	eventY(d) {
		const $$ = this;
		const config = $$.config;
		const yPos = config.axis_rotated ? (
			"start" in d ? $$.x(
				$$.isTimeSeries() ? $$.parseDate(d.start) : d.start
			) : $$.height
		) : $$.height;

		return yPos;
	},

	eventWidth(d) {
		const $$ = this;
		const config = $$.config;
		const start = $$.eventX(d);
		const end = config.axis_rotated ?
			$$.eventRectHeight : "end" in d ?
				$$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) :
				$$.width;

		return end < start ? 0 : end - start;
	},

	eventHeight(d) {
		const $$ = this;
		const config = $$.config;
		const start = this.eventY(d);
		const end = config.axis_rotated ? (
			"end" in d ? $$.x(
				$$.isTimeSeries() ? $$.parseDate(d.end) : d.end
			) : $$.height + $$.eventRectHeight
		) : $$.height + $$.eventRectHeight;

		return end < start ? 0 : end - start;
	},
});

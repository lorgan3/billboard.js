/**
 * Copyright (c) 2017 NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
/* eslint-disable */
import util from "../assets/util";
import CLASS from "../../src/config/classes";

describe("TOOLTIP", function() {
	let chart;
	let chart2;
	let args = {
		data: {
			x: "x",
			columns: [
				['x', 2, 4, 6, 8, 10, 12],
				["data1", 30, 200, 100, 400, 150, 250],
				["data2", 50, 20, 10, 40, 15, 25],
				["data3", 150, 120, 110, 140, 115, 125]
			]
		},
		tooltip: {}
	};
	let args2 = {
		bindto: "#chart2",
		data: {
			x: "x",
			columns: [
				['x', 1, 3, 5, 7, 9, 11],
				["data1-2", 30, 200, 100, 400, 150, 250],
				["data2-2", 50, 20, 10, 40, 15, 25],
				["data3-2", 150, 120, 110, 140, 115, 125]
			]
		},
		tooltip: {}
	};

	const spy1 = sinon.spy();
	const spy2 = sinon.spy();

	// hover chart
	const hoverChart = (hoverChart, eventName = "mousemove") => {
		const eventRect = hoverChart.internal.main
			.select(`.${CLASS.eventRect}-2`)
			.node();

		util.fireEvent(eventRect, eventName, {
			clientX: 100,
			clientY: 100
		}, hoverChart);
	};

	// check for the tooltip's ordering
	const checkTooltip = (checkChart, expected) => {
		hoverChart(checkChart);

		const tooltips = d3.select(checkChart.element)
			.selectAll(`.${CLASS.tooltip} tr`)
			.nodes();

		if (expected) {
			for (let i = 1, el; (el = tooltips[i]); i++) {
				expect(el.className).to.be.equal(expected[i - 1]);
			}
		}
	};

	// check for the tooltip's ordering
	const checkLinkedTooltip = (chart1, chart2, expected) => {
		hoverChart(chart1);

		const tooltips = chart2.internal.tooltip
			.selectAll("tr")
			.nodes();

		if (expected) {
			for (let i = 1, el; (el = tooltips[i]); i++) {
				expect(el.className).to.be.equal(`${CLASS.tooltipName}-${expected[i - 1]}`);
			}
		}
	};

	const tooltipPos = {
		top: 37,
		left: 79
	};

	const tooltipPosition = function(data, width, height, element) {
		expect(data.length).to.be.equal(args.data.columns.length - 1);
		expect(data[0].index).to.be.equal(2);
		expect(data[0].value).to.be.equal(100);
		expect(/^data1(\-2)?$/.test(data[0].id)).to.be.true;
		expect(width).to.be.above(0);
		expect(height).to.be.above(0);

		expect(element).to.be.equal(this.main.select(`.${CLASS.eventRect}-2`).node());

		return tooltipPos;
	};

	const checkCallback = (checkChart, doHide) => {
		hoverChart(checkChart);
		doHide && hoverChart(checkChart, "mouseout");
	};

	beforeEach(() => {
		chart = util.generate(args);
	});

	describe("Tooltip callbacks", () => {
		before(() => {
			args.tooltip.onshow = () => {
				if (chart.internal.cache.callback_test === 0) {
					chart.internal.cache.callback_test++;
				}
			};
			args.tooltip.onshown = () => {
				if (chart.internal.cache.callback_test === 1) {
					chart.internal.cache.callback_test++;
				}
			};
			args.tooltip.onhide = () => {
				if (chart.internal.cache.callback_test === 2) {
					chart.internal.cache.callback_test++;
				}
			};
			args.tooltip.onhidden = () => {
				if (chart.internal.cache.callback_test === 3) {
					chart.internal.cache.callback_test++;
				}
			};
		});

		after(() => {
			args.tooltip.onshow = () => {};
			args.tooltip.onshown = () => {};
			args.tooltip.onhide = () => {};
			args.tooltip.onhidden = () => {};
		});

		it("chart tooltip onshow/onshown/onhide/onhidden functions should be called", () => {
			chart.internal.cache.callback_test = 0;
			checkCallback(chart, true);
			let test = chart.internal.cache.callback_test;
			expect(test).to.be.equal(4);
		});

		describe("show/shown should execute in proper order", () => {
			before(() => {
				chart.internal.cache.callback_test = 0;
				chart.internal.cache.callback_test2 = 0;
				args.tooltip.onshow = () => {
					chart.internal.cache.callback_test++;
				};
				args.tooltip.onshown = () => {
					chart.internal.cache.callback_test++;
					chart.internal.cache.callback_test2 = chart.internal.cache.callback_test;
				};
			});

			it("onshown should execute after onshow", () => {
				chart.internal.cache.callback_test = 0;
				checkCallback(chart, false);
				expect(chart.internal.cache.callback_test2).to.be.equal(2);
			});
		});

		describe("onhide/onhidden should execute in proper order", () => {
			before(() => {
				chart.internal.cache.callback_test = 0;
				args.tooltip.onshow = () => {};
				args.tooltip.onshown = () => {};
				args.tooltip.onhide = () => {
					chart.internal.cache.callback_test++;
				};
				args.tooltip.onhidden = () => {
					chart.internal.cache.callback_test++;
					chart.internal.cache.callback_test2 = chart.internal.cache.callback_test;

				};
			});

			it("onhidden should execute after onhide", () => {
				chart.internal.cache.callback_test = 0;
				checkCallback(chart, true);
				expect(chart.internal.cache.callback_test2).to.be.equal(2);
			});
		});
	});

	describe("tooltip position", () => {
		describe("without left margin", () => {
			it("should show tooltip on proper position", () => {
				hoverChart(chart);

				const tooltipContainer = chart.internal.tooltip;
				const top = Math.floor(+tooltipContainer.style("top").replace(/px/, ""));
				const left = Math.floor(+tooltipContainer.style("left").replace(/px/, ""));
				const tooltipPos = {
					top: 115,
					left: 280
				};

				expect(top).to.be.equal(tooltipPos.top);
				expect(left).to.be.above(tooltipPos.left);
			});
		});

		describe("with left margin", () => {
			before(() => {
				chart.element.style.marginLeft = "300px";
			});

			after(() => {
				// reset to not affect other tests
				chart.element.style.marginLeft = "";
			});

			it("should show tooltip on proper position", () => {
				hoverChart(chart);

				const tooltipContainer = d3.select(chart.element).select(`.${CLASS.tooltipContainer}`);
				const top = Math.floor(+tooltipContainer.style("top").replace(/px/, ""));
				const left = Math.floor(+tooltipContainer.style("left").replace(/px/, ""));
				const tooltipPos = {
					top: 115,
					left: 280
				};

				expect(top).to.be.equal(tooltipPos.top);
				expect(left).to.be.above(tooltipPos.left);
			});
		});
	});

	describe("tooltip positionFunction", () => {
		before(() => {
			args.tooltip = {
				position: tooltipPosition
			};
		});

		it("should be set to the coordinate where the function returned", () => {
			hoverChart(chart);

			const tooltipContainer = d3.select(chart.element).select(`.${CLASS.tooltipContainer}`);
			const top = Math.floor(+tooltipContainer.style("top").replace(/px/, ""));
			const left = Math.floor(+tooltipContainer.style("left").replace(/px/, ""));

			expect(top).to.be.equal(tooltipPos.top);
			expect(left).to.be.equal(tooltipPos.left);
		});
	});

	describe("tooltip order", () => {
		after(() => {
			/*delete args.data.type;
			delete args.data.groups;*/
		});

		it("should sort values in data display order", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data1`,
				`${CLASS.tooltipName}-data2`,
				`${CLASS.tooltipName}-data3`
			]);
		});

		it("set options tooltip.order=asc", () => {
			args.tooltip.order = "asc";
		});

		it("should sort values ascending order", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data2`,
				`${CLASS.tooltipName}-data1`,
				`${CLASS.tooltipName}-data3`
			]);
		});

		it("set options tooltip.order=desc", () => {
			args.tooltip.order = "desc";
		});

		it("set options tooltip.order=desc", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data3`,
				`${CLASS.tooltipName}-data1`,
				`${CLASS.tooltipName}-data2`
			]);
		});

		// check for stacking bar
		it("set options data.groups", () => {
			args.data.type = "bar";
			args.data.groups = [["data1", "data2", "data3"]];
			args.tooltip.order = args.data.order = "desc";
		});

		it("stacked bar: should sort values in descending order", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data3`,
				`${CLASS.tooltipName}-data1`,
				`${CLASS.tooltipName}-data2`
			]);
		});

		it("set options tooltip.order=asc", () => {
			args.tooltip.order = args.data.order = "asc";
		});

		it("stacked bar: should sort values in ascending order", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data2`,
				`${CLASS.tooltipName}-data1`,
				`${CLASS.tooltipName}-data3`
			]);
		});

		it("set options tooltip.order=null", () => {
			args.tooltip.order = args.data.order = null;
		});

		it("stacked bar: should be ordered in data input order", () => {
			checkTooltip(chart, [
				`${CLASS.tooltipName}-data3`,
				`${CLASS.tooltipName}-data2`,
				`${CLASS.tooltipName}-data1`
			]);
		});

		it("set options tooltip.order=function", () => {
			args.tooltip.order = sinon.spy(function(a, b) {
				return a.value - b.value;
			});
		});

		it("data.order function should be called", () => {
			checkTooltip(chart);
			expect(args.tooltip.order.called).to.be.true
		});
	});

	describe("linked tooltip", () => {
		beforeEach(() => {
			spy1.resetHistory();
			spy2.resetHistory();
		});

		it("set options tooltip.linked=false", () => {
			args.tooltip.linked = false;
			args2.tooltip.order = spy2;
		});

		it("second chart tooltip shouldn't be called", () => {
			hoverChart(chart);

			expect(args2.tooltip.order.called).to.be.false;
		});

		it("set options tooltip.linked=false", () => {
			args.tooltip.order = spy1;
			args2.tooltip.linked = args.tooltip.linked = {name: "some"};

			chart2 = util.generate(args2);
		});

		it("both charts should be called", () => {
			hoverChart(chart2);

			expect(args.tooltip.order.called).to.be.true;
			expect(args2.tooltip.order.called).to.be.true;
		});
	});

	describe("linked tooltip positionFunction", () => {
		before(() => {
			args2.tooltip.position = args.tooltip.position = tooltipPosition;
			chart2 = util.generate(args2);
		});

		it("linked tooltips should be set to the coordinate where the function returned", () => {
			hoverChart(chart);

			[chart, chart2].forEach(v => {
				const tooltipContainer = v.internal.tooltip;
				const top = parseInt(tooltipContainer.style("top"));
				const left = parseInt(tooltipContainer.style("left"));

				expect(top).to.be.equal(tooltipPos.top);
				expect(left).to.be.equal(tooltipPos.left);
			});
		});
	});

	describe("linked tooltip order", () => {
		before(() => {
			delete args.tooltip.position;
			delete args2.tooltip.position;
		});

		beforeEach(() => {
			chart2 = util.generate(args2);
		});

		it("chart 1 should sort values in data display order", () => {
			checkLinkedTooltip(chart, chart2, [
				"data1-2", "data2-2", "data3-2"
			]);
		});

		it("chart 2 should sort values in data display order", () => {
			checkLinkedTooltip(chart2, chart, [
				"data1", "data2", "data3"
			]);
		});

		it("linked charts set options tooltip.order=asc", () => {
			args2.tooltip.order = args.tooltip.order = "asc";
		});

		it("chart 1 should sort values ascending order", () => {
			checkLinkedTooltip(chart, chart2, [
				"data2-2", "data1-2", "data3-2"
			]);
		});

		it("chart 2 should sort values ascending order", () => {
			checkLinkedTooltip(chart2, chart, [
				"data2", "data1", "data3"
			]);
		});

		it("linked charts set options tooltip.order=desc", () => {
			args2.tooltip.order = args.tooltip.order = "desc";
		});

		it("chart 1 set options tooltip.order=desc", () => {
			checkLinkedTooltip(chart, chart2, [
				"data3-2", "data1-2", "data2-2"
			]);
		});

		it("chart 2 set options tooltip.order=desc", () => {
			checkLinkedTooltip(chart2, chart, [
				"data3", "data1", "data2"
			]);
		});

		// check for stacking bar
		it("linked charts  set options data.groups", () => {
			args.data.type = "bar";
			args.data.groups = [["data1", "data2", "data3"]];
			args.tooltip.order = args.data.order = "desc";

			args2.data.type = args.data.type;
			args2.data.groups = [["data1-2", "data2-2", "data3-2"]];
			args2.tooltip.order = args.tooltip.order;

		});

		it("chart 1 stacked bar: should sort values in descending order", () => {
			checkLinkedTooltip(chart, chart2, [
				"data3-2", "data1-2", "data2-2"
			]);
		});

		it("chart 2 stacked bar: should sort values in descending order", () => {
			checkLinkedTooltip(chart2, chart, [
				"data3", "data1", "data2"
			]);
		});

		it("linked charts  set options tooltip.order=asc", () => {
			args2.tooltip.order = args2.data.order = args.tooltip.order = args.data.order = "asc";
		});

		it("chart 1 stacked bar: should sort values in ascending order", () => {
			checkLinkedTooltip(chart, chart2, [
				"data2-2", "data1-2", "data3-2"
			]);
		});

		it("chart 2 stacked bar: should sort values in ascending order", () => {
			checkLinkedTooltip(chart2, chart, [
				"data2", "data1", "data3"
			]);
		});

		it("linked charts set options tooltip.order=null", () => {
			args2.tooltip.order = args2.data.order = args.tooltip.order = args.data.order = null;
		});

		it("chart 1 stacked bar: should be ordered in data input order", () => {
			checkLinkedTooltip(chart, chart2, [
				"data3-2", "data2-2", "data1-2"
			]);
		});

		it("chart 2 stacked bar: should be ordered in data input order", () => {
			checkLinkedTooltip(chart2, chart, [
				"data3", "data2", "data1"
			]);
		});

		it("linked charts set options tooltip.order=function", () => {
			args2.tooltip.order = args.tooltip.order = sinon.spy((a, b) =>  a.value - b.value);
		});

		it("chart 1 data.order function should be called", () => {
			checkLinkedTooltip(chart, chart2);
			expect(args.tooltip.order.called).to.be.true;
		});

		it("chart 2 data.order function should be called", () => {
			checkLinkedTooltip(chart2, chart);
			expect(args2.tooltip.order.called).to.be.true;
		});
	});

	describe("tooltip display at initialization", () => {
		before(() => {
			args = {
				data: {
					columns: [
						["data1", 30, 200, 100, 400, 150, 250],
						["data2", 50, 20, 10, 40, 15, 25],
						["data3", 150, 120, 110, 140, 115, 125]
					]
				},
				interaction: {
					inputType: {
						touch: true
					}
				},
				tooltip: {
					init: {
						show: true,
						x: 1,
						position: {
							left: "100px",
							top: "30px"
						}
					}
				}
			};
		});

		it("tooltip should be displayed", () => {
			const tooltip = chart.internal.tooltip;
			const pos = {
				left: tooltip.style("left"),
				top: tooltip.style("top")
			};

			expect(tooltip.style("display")).to.be.equal("block");

			expect(pos.left).to.be.equal(args.tooltip.init.position.left);
			expect(pos.top).to.be.equal(args.tooltip.init.position.top);
		});
	});
});

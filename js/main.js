const VIS_HT = window.innerHeight * .7, VIS_WID = window.innerWidth * .45; //~
const MAX_BOXES_PER_ROW = 20, MARGIN = 2.5;
let currRow = 1, BOX_HT; //~

var dataset = d3.csv('flavors_of_cacao.csv').get((dataset) => {
	console.log(dataset.length)

	BOX_HT = VIS_HT / (dataset.length / MAX_BOXES_PER_ROW);

	// data cleaning
	let removePercent = str => { return parseFloat(str.slice(0, -1)); }
	     console.log(dataset[0]['Company (Maker-if known)']);
	let uniqueCocoaValues = [... new Set(dataset.map(choc => removePercent(choc['Cocoa Percent'])))];

	// helper method to sort by cocoa
	let sortChocByCocoa = (c1, c2) => { return removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) } 

	var cocoaColorScale = d3.scaleLinear().domain([Math.min(...uniqueCocoaValues), Math.max(...uniqueCocoaValues)])//~
			.range(["#bc8f8f", "#48240a"]);

	// let sortChocByCocoa = (a,b) => { return parseFloat(b.Rating) - parseFloat(a.Rating) } 
	dataset.sort((a,b) => { return b.Rating - a.Rating });

	// 5 stars
	let fiveStar = dataset.filter(choc => {
		return (choc.Rating == 5);
	}).sort(sortChocByCocoa);

	// 4 stars
	let fourStar = dataset.filter(choc => {
		return (choc.Rating >= 4 && choc.Rating < 5);
	}).sort(sortChocByCocoa);

	console.log(fourStar.length)

	// 3 stars
	let threeStar = dataset.filter(choc => {
		return (choc.Rating >= 3 && choc.Rating < 4);
	}).sort(sortChocByCocoa);

	// 2 stars
	let twoStar = dataset.filter(choc => {
		return (choc.Rating >= 2 && choc.Rating < 1);
	}).sort(sortChocByCocoa);

	// 1 stars
	let oneStar = dataset.filter(choc => {
		return (choc.Rating >= 1 && choc.Rating < 2);
	}).sort(sortChocByCocoa);

	let all_chocolates = fourStar.concat(threeStar.concat(twoStar.concat(oneStar))); //~
	let sortedChcolates = dataset.sort((c1, c2) => { return c1.Rating - c2.Rating || removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) });
	console.log(sortedChcolates)
	console.log(sortedChcolates[0])
	console.log(sortedChcolates[1790])
	console.log(all_chocolates)
	console.log(all_chocolates[1360])

	let mouseToolTip = d3.select('#vis').append('div')
		.attr('class', 'mouseTooltip')
		.style('opacity', 0)
	
	// let sideToolTip = d3.select('#vis')
	// .append('div')
	// 	.attr('class', 'tooltip')
	// 	.style('opacity', 0)

	// container
	var svg = d3.select('#vis')
		.append('svg')
		.attr('height', VIS_HT)
		.attr('width', VIS_WID)
		.attr('border', 3)

	//~ border http://bl.ocks.org/AndrewStaroscik/5222370
	var borderPath = svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", VIS_HT)
		.attr("width", VIS_WID)
		.style("stroke", 'red')
		.style("fill", "none")
		.style("stroke-width", 1);
	//~

	let currWid = fourStar.length < MAX_BOXES_PER_ROW ? VIS_WID / fourStar.length : VIS_WID / MAX_BOXES_PER_ROW;
	svg.selectAll('rect')
		.data(all_chocolates)
		.enter()
		.append('rect')

		// debug
		.attr('stroke', '#180c01')//3f2000
		.attr('stroke-width', '1')
		
		.attr('y', (d, i) => {	
			return (i);// * currWid;//~
			// return (i % MAX_BOXES_PER_ROW) * currWid;
			// return ((i % MAX_BOXES_PER_ROW) * 50); 
			// return (i * all_chocolates.length / MAX_BOXES_PER_ROW) + (MARGIN * i); 
		})
		.attr('x', (d, i) => { return ((i % MAX_BOXES_PER_ROW) * MARGIN * BOX_HT); })// 
		.attr('width', currWid * 5)//_ => { return currWid; } //return (all_chocolates.length / MAX_BOXES_PER_ROW) * MARGIN; })
		.attr('height', BOX_HT * 2.2)
		.attr('fill', (d) => { return cocoaColorScale(removePercent(d['Cocoa Percent'])); })
		
		// tooltip
		.on('mouseover', d => {
			mouseToolTip.transition()
				.duration(250)//~
				.style('opacity', 1);

			mouseToolTip.html(`
			<span class="bold">Cocoa:</span> ${ d['Cocoa Percent'] }
			<br/>
			<span class="bold">Rating:</span> ${ d['Rating'] }/5
			<br/>
			<span class="bold">Company:</span> ${ d['Company (Maker-if known)'] } 
			<br/> 
			`
			)//~
				.style('left', `${ d3.event.pageX }px`)
				.style('top', `${ d3.event.pageY }px`);
				
				
			// sideToolTip.html(`Cocoa:  + ${ d['Cocoa Percent'] }`)
			// 	.style('left', `${ d3.event.pageX }px`)
			// 	.style('top', `${ d3.event.pageY }px`);
		})

		console.log(all_chocolates.length / MAX_BOXES_PER_ROW)
});
const VIS_HT = window.innerHeight * .7, VIS_WID = window.innerWidth * .45; //~
const MAX_BOXES_PER_ROW = 20, BOX_HT = 20, MARGIN = 2.5;
let currRow = 1;

var dataset = d3.csv('flavors_of_cacao.csv').get((dataset) => {
	// dataset.forEach(record => console.log('record'));
	// console.log(dataset[0]['Company (Maker-if known)']);
	// console.log(dataset[0]['Specific Bean Origin or Bar Name']);
	// console.log(dataset[0]['REF']);
	// console.log(dataset[0]['Review Date']);
	// console.log(dataset[0]['Rating']);
	// console.log(dataset[0]['Bean Type']);
	// console.log(dataset[0]['Broad Bean Origin']);
	// console.log(dataset[0]['Company Location']);
	console.log(dataset[0]['Rating']);
	let removePercent = str => { return parseFloat(str.slice(0, -1)); }

	// get unique cocoa vals ~ https://stackoverflow.com/a/35092559/1446598
	let uniqueCocoaValues = [... new Set(dataset.map(choc => removePercent(choc['Cocoa Percent'])))];
	console.log(uniqueCocoaValues)
	
	let sortChocByCocoa = (c1, c2) => { return removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) } 

	console.log((dataset))
	var cocoaColorScale = d3.scaleLinear().domain([Math.min(...uniqueCocoaValues), Math.max(...uniqueCocoaValues)])//~
			.range(["#bc8f8f", "#48240a"]);

	// let sortChocByCocoa = (a,b) => { return parseFloat(b.Rating) - parseFloat(a.Rating) } 
	dataset.sort((a,b) => { return b.Rating - a.Rating });
	let fiveStar = dataset.filter(choc => {
		return (choc.Rating == 5);
	});
	
	fiveStar.sort(sortChocByCocoa);
	let fourStar = dataset.filter(choc => {
		return (choc.Rating >= 4);
	});

	fourStar.sort(sortChocByCocoa);
	
	console.log(cocoaColorScale)

	let toolTip = d3.select('#vis').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)

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
		.data(fourStar)
		.enter()
		.append('rect')
		.attr('x', (d, i) => {	
			return (i);// * currWid;//~
			// return (i % MAX_BOXES_PER_ROW) * currWid;
			// return ((i % MAX_BOXES_PER_ROW) * 50); 
			// return (i * fourStar.length / MAX_BOXES_PER_ROW) + (MARGIN * i); 
		})
		.attr('y', (d, i) => { return ((i % MAX_BOXES_PER_ROW) * MARGIN * BOX_HT); })// 
		.attr('width', currWid * 5)//_ => { return currWid; } //return (fourStar.length / MAX_BOXES_PER_ROW) * MARGIN; })
		.attr('height', BOX_HT * 2.2)
		.attr('fill', (d) => { return cocoaColorScale(removePercent(d['Cocoa Percent'])); })
		
		// tooltip
		.on('mouseover', d => {
			toolTip.transition()
				.duration(250)//~
				.style('opacity', 1);

			toolTip.html(`Cocoa:  + ${ d['Cocoa Percent'] }`)
				.style('left', `${ d3.event.pageX }px`)
				.style('top', `${ d3.event.pageY }px`);

		})


		// svg.selectAll('rect')
		// .data(fiveStar)
		// .enter()
		// .append('rect')
		// .attr('x', (d, i) => { 		
		// 	return (i % MAX_BOXES_PER_ROW) * currWid;
		// 	// return ((i % MAX_BOXES_PER_ROW) * 50); 
		// 	// return (i * fiveStar.length / MAX_BOXES_PER_ROW) + (MARGIN * i); 
		// })
		// .attr('y', (d, i)=> { return ((i % MAX_BOXES_PER_ROW) * MARGIN * BOX_HT); })// 
		// .attr('width', _ => { return (fiveStar.length / MAX_BOXES_PER_ROW) * MARGIN; })
		// .attr('height', BOX_HT * 2)
		// .attr('fill', (d) => { return cocoaColorScale(removePercent(d['Cocoa Percent'])); 
		// 	// d['Cocoa Percent'] * 0.5 
		// })

		console.log(fourStar.length / MAX_BOXES_PER_ROW)
});
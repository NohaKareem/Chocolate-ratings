const VIS_HT = window.innerHeight * .7, VIS_WID = window.innerWidth * .45; //~
const MAX_BOXES_PER_ROW = 25, MARGIN = 2.5;
let box_ht, prevRows = 0;

var dataset = d3.csv('flavors_of_cacao.csv').get((dataset) => {
	var countryCodes = d3.csv('country_codes.csv').get((countryCodesData) => {
		console.log(countryCodesData)
		box_ht = (VIS_HT / (dataset.length / MAX_BOXES_PER_ROW) * 2); //~2.1
		console.log(dataset[0])
		// data cleaning
		let removePercent = str => { return parseFloat(str.slice(0, -1)); }
		let uniqueCocoaValues = [... new Set(dataset.map(choc => removePercent(choc['Cocoa Percent'])))];

		// helper methods 
		let sortChocByCocoa = (c1, c2) => { return removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) } 
		let sortedChcolates = dataset.sort((c1, c2) => { return c2.Rating - c1.Rating || removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) });
		let getCountryCode = countryName => countryCodesData.filter(country => {	
				return country.Name == countryName;
			})[0].Code.toLowerCase();

		var cocoaColorScale = d3.scaleLinear().domain([Math.min(...uniqueCocoaValues), Math.max(...uniqueCocoaValues)])
			.range(["#bc8f8f", "#48240a"]);

		// sort by rating
		dataset.sort((a,b) => { return b.Rating - a.Rating });

		
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
			.attr('height', VIS_HT * 2)
			.attr('width', VIS_WID)

		//~ border http://bl.ocks.org/AndrewStaroscik/5222370
		var borderPath = svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", VIS_HT * 2)
			.attr("width", VIS_WID)
			.style("stroke", 'red')
			.style("fill", "none")
			.style("stroke-width", 1);
		//~

		let currWid = VIS_WID / MAX_BOXES_PER_ROW;
		
		dispChocRatingBar = rating => {
			// let ratingDataset = dataset.filter(choc => {
			// 	return (choc.Rating >= rating && choc.Rating < rating + 1);
			// }).sort(sortChocByCocoa);

			console.log('prevRows', prevRows)

			svg.selectAll('rect')
			.data(rating)
			.enter()
			.append('rect')

			// debug
			.attr('stroke', '#180c01')
			.attr('stroke-width', '1')
			
			.attr('y', (d, i) => { return (parseInt(i / MAX_BOXES_PER_ROW) * box_ht) }) // + (prevRows * box_ht)
			.attr('x', (d, i) => { return ((i % MAX_BOXES_PER_ROW) * currWid); })
			.attr('width', currWid)
			.attr('height', box_ht)
			.attr('fill', (d) => { return cocoaColorScale(removePercent(d['Cocoa Percent'])); })
			
			// mouse tooltip
			.on('mouseover', d => {
				mouseToolTip.transition()
					.duration(250)
					.style('opacity', 1);

				mouseToolTip.html(`
					<span class="bold">Cocoa:</span> ${ d['Cocoa Percent'] }
					<br/>
					<span class="bold">Rating:</span> ${ d['Rating'] }/5
					<br/>
					<span class="bold">Company:</span> ${ d['Company (Maker-if known)'] } 
					<br/> 
					<span class="bold">Review Date:</span> ${ d['Review Date'] } 
					<br/> 
					<span class="bold">Bean Origin/Bar Name:</span> ${ d['Specific Bean Origin or Bar Name'] } 
					<br/> 
					${ d['Bean Type'].length > 1 ? `<span class="bold">Bean Type:</span>: ${ d['Bean Type'] }<br/>` : `` } 
					<span class="bold">Broad Bean Origin:</span> ${ d['Broad Bean Origin'] } 
					<br/> 
					<span class="bold">Company Location:</span> ${ d['Company Location'] }
					<img src="https://lipis.github.io/flag-icon-css/flags/4x3/${ getCountryCode(d['Company Location']) }.svg" alt=" ${ d['Company Location'] } flag" style="width:40px">
					<br/> 
					`)
					.style('left', `${ d3.event.pageX }px`)
					.style('top', `${ d3.event.pageY }px`);

				// sideToolTip.html(`Cocoa:  + ${ d['Cocoa Percent'] }`)
				// 	.style('left', `${ d3.event.pageX }px`)
				// 	.style('top', `${ d3.event.pageY }px`);
			});
			prevRows += svg.style('height');//ratingDataset.length;
			// console.log('ratingDdataset.length', ratingDataset.length * box_ht)
			console.log('svg ht', svg.style('height'))
		}

		// for(let i = 5; i > 0; i--) {
		// 	dispChocRatingBar(i);
		// }
		dispChocRatingBar(sortedChcolates);
		
		// container
		var flags = d3.select('.tooltip')
			.append('svg')
			.attr('height', 500)
			.attr('width', 500);

		// svg.selectAll('rect')
		// 	.data(countryCodes)
		// 	.enter()
		// 	.append('rect')
		// 	.attr('width', currWid * 15)
		// 	.attr('height', box_ht * 12.2)
		// 	.attr('y', _ => {
		// 		console.log('country')
		// 	});
	});
});
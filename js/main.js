const VIS_HT = window.innerHeight * .7, VIS_WID = window.innerWidth * .45; 
const MAX_BOXES_PER_ROW = 25, MARGIN = 2.5;
let box_ht, prevRows = 0;

var dataset = d3.csv('data/flavors_of_cacao.csv').get((dataset) => {
	var countryCodes = d3.csv('data/country_codes.csv').get((countryCodesData) => {
		box_ht = (VIS_HT / (dataset.length / MAX_BOXES_PER_ROW) * 2);

		// data cleaning (remove %, parse Cocoa Percent as float)
		let removePercent = str => { return parseFloat(str.slice(0, -1)); }

		// data cleaning (matching country names to those mentioned in chocolate dataset, for consistency)
		countryCodesData.find(country => country.Name == "United States").Name = "U.S.A.";
		countryCodesData.find(country => country.Name == "United Kingdom").Name = "U.K.";
		countryCodesData.find(country => country.Name == "Viet Nam").Name = "Vietnam";
		countryCodesData.find(country => country.Name == "Trinidad and Tobago").Name = "Trinidad, Tobago";
		countryCodesData.push({ Name: 'Hawaii', Code: 'US' });
		
		// account for typos
		countryCodesData.push({ Name: 'Domincan Republic', Code: 'DO' });
		countryCodesData.push({ Name: 'Cost Rica', Code: 'CR' });
		
		// helper methods
		// sort chocolates by cocoa 
		let sortChocByCocoa = (c1, c2) => { return removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) } 
		
		// sort chocolates by rating, then cocoa percent
		let sortedChcolates = dataset.sort((c1, c2) => { return c2.Rating - c1.Rating || removePercent(c2['Cocoa Percent']) - removePercent(c1['Cocoa Percent']) });
		
		// get country code from country name
		let getCountryCode = countryName => countryCodesData.filter(country => {
			// console.log('testing', countryName)	
				return (country.Name).toLowerCase().includes(countryName.toLowerCase());
			})[0].Code.toLowerCase();

		// render rating stars
		let renderStars = rating => {
			let starStr = "";
			for(let i = 0; i < parseInt(rating); i++) { 
				starStr += `<i class="fa fa-star" aria-hidden="true"></i>`;
			}
			
			// partial stars
			if(rating - parseInt(rating) > 0) starStr += `<i class="fa fa-star-half-o" aria-hidden="true"></i>`;
			
			// empty stars
			let emptyStars = 5 - Math.ceil(rating);
			for(let i = 0; i < emptyStars; i++) {
				starStr += `<i class="fa fa-star-o" aria-hidden="true"></i>`;
			}
			return starStr;
		}

		// print tooltip/info bar data
		let getTooltipData = d => {
				return `
				<span class="bold">Cocoa:</span> ${ d['Cocoa Percent'] }
				<br/>
				<span class="bold">Rating:</span> ${ d['Rating'] }/5
				${ renderStars(d['Rating']) }
				<br/>
				<span class="bold">Company:</span> ${ d['Company (Maker-if known)'] } 
				<br/> 
				<span class="bold">Review Date:</span> ${ d['Review Date'] } 
				<br/> 
				<span class="bold">Bean Origin/Bar Name:</span> ${ d['Specific Bean Origin or Bar Name'] } 
				<br/> 
				${ d['Bean Type'].length > 1 ? `<span class="bold">Bean Type:</span>: ${ d['Bean Type'] }<br/>` : `` } 
				<div class="flagRow">
					<span class="bold">Broad Bean Origin:</span> ${ d['Broad Bean Origin'] } 
					<img src="https://lipis.github.io/flag-icon-css/flags/4x3/${ getCountryCode(d['Broad Bean Origin']) }.svg" alt=" ${ d['Company Location'] } flag" style="width:40px">
				</div>
				<br/> 
				<div class="flagRow">
					<span class="bold">Company Location:</span> ${ d['Company Location'] }
					<img src="https://lipis.github.io/flag-icon-css/flags/4x3/${ getCountryCode(d['Company Location']) }.svg" alt=" ${ d['Company Location'] } flag" style="width:40px">
				</div>
				<br/>
				`;
		}

		// color scale
		let uniqueCocoaValues = [... new Set(dataset.map(choc => removePercent(choc['Cocoa Percent'])))];
		var cocoaColorScale = d3.scaleLinear().domain([Math.min(...uniqueCocoaValues), Math.max(...uniqueCocoaValues)])
			.range(["#bc8f8f", "#48240a"]);

		// tooltip
		let mouseToolTip = d3.select('#vis').append('div')
			.attr('class', 'mouseTooltip')
			.style('opacity', 0)
		
		// info bar
		let sideToolTip = d3.select('.tooltip')
			.append('div')
			.attr('class', 'clickInfo')
			.style('opacity', 0)

		let boxWid = VIS_WID / MAX_BOXES_PER_ROW;
		
		renderChocRatingBar = (rating, isFullDataset) => {
			let ratingDataset = rating;

			// generate partial datasets per ranking
			if (!isFullDataset) {
				ratingDataset = dataset.filter(choc => {
					return (choc.Rating >= rating && choc.Rating < rating + 1);
				}).sort(sortChocByCocoa);
			}

			// container
			let svg = d3.select('#vis')
				.append('svg')
				.attr('height', (ratingDataset.length / MAX_BOXES_PER_ROW) * box_ht + MARGIN * 10)
				.attr('width', VIS_WID);
			
			// if(!isFullDataset) {
			// 	let ratingLabels = 
			// 	svg.append('text')
			// 	// d3.select('#vis')
			// 	// .selectAll('text')
			// 	.data(rating)
			// 	.enter()
			// 	.attr('x', VIS_WID + MARGIN * 5)
			// 	.attr('y', (ratingDataset.length / MAX_BOXES_PER_ROW) * box_ht + MARGIN * 10 / 2)
			// 	.attr('font-size', '50px')
			// 	.attr('x', d=> {
			// 		console.log('in text')
			// 	})
			// 	// .append('text');
			// }

			svg.selectAll('rect')
				.data(ratingDataset)
				.enter()
				.append('rect')

				.attr('stroke', '#180c01')
				.attr('stroke-width', '1')
				
				.attr('y', (d, i) => { return (parseInt(i / MAX_BOXES_PER_ROW) * box_ht) }) 
				.attr('x', (d, i) => { return ((i % MAX_BOXES_PER_ROW) * boxWid); })
				.attr('width', boxWid)
				.attr('height', box_ht)
				.attr('fill', (d) => { return cocoaColorScale(removePercent(d['Cocoa Percent'])); })
				
				// mouse tooltip
				.on('mouseover', d => {
					mouseToolTip.transition()
						.duration(250)
						.style('opacity', 1);

					mouseToolTip.html(getTooltipData(d))
						.style('left', `${ d3.event.pageX }px`)
						.style('top', `${ d3.event.pageY }px`);
				})

				// side info bar
				.on('click', d => {
					sideToolTip.transition()
						.duration(250)
						.style('opacity', 1);

					sideToolTip.html(getTooltipData(d));
				});
		}

		// rating-segmented view
		// for(let i = 5; i > 0; i--) {
		// 	renderChocRatingBar(i, false);
		// }

		// full view
		renderChocRatingBar(sortedChcolates, true);
	});
});
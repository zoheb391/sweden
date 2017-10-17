let margin = { top: 20, bottom: 20, left: 20, right: 20 }
let width = 550 - margin.left - margin.right
let height = 600 - margin.top - margin.bottom

let customerTotal = d3.map()
let colorDomain= [85,150,200,300,500,1000,1500,2000,5000]
let color =  d3.scaleLinear()
                .domain(colorDomain)
                .range(d3.schemeYlGnBu[9])

let svg = d3.select('.map-holder')
    .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

let map = svg
    .append('g').attr('class', 'map')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// let legend = d3.select('svg')
//     .append('g')
//     .attr('class', 'legend')
//     .attr('transform', 'translate(500, 100)')
//     .selectAll('g')
//     .data(colorDomain)
//     .enter()

let descriptionBox = d3.select('.description-box-holder')

d3.queue()
    .defer(d3.json, 'sweden-counties.json')
    .defer(d3.csv, 'sweden-testimonials.csv')
    .defer(d3.csv, 'visma-stats.csv', function(d){ customerTotal.set(+d.ID, +d.customers)})
    .await(ready)

function ready(error, sweden, testimonialList){
    if (error) throw error;
    let projection = d3.geoAlbers()
        .rotate([-25, 0])
        .fitSize([ width, height ], topojson.feature(sweden, sweden.objects.SWE_adm1))

    let path = d3.geoPath().projection(projection)

    map
        .selectAll('path')
        .data(topojson.feature(sweden, sweden.objects.SWE_adm1).features)
        .enter()
        .append('path').attr('class', 'states')
            .attr('d', path)
            .attr('fill', d => color(customerTotal.get(d.properties.ID_1)))


    let points = svg
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('class', 'bubbles')
        .selectAll('circle')
        .data(testimonialList)
        .enter()
        .append('image').attr('class', 'pin')
            .attr('height', '20').attr('width', '20')
            .attr('href', 'media/pin.svg')
            .attr('x', d => extractCoordinates(d)['x_coordinate'] - 5)
            .attr('y', d => extractCoordinates(d)['y_coordinate'] - 7)
            .on('mouseover', handleMouseOn)
            .on('mouseout', handleMouseOut)


    function extractCoordinates({ Long, Lat }){
        let projectedValue = projection([Long, Lat])
        return {
            x_coordinate: projectedValue[0],
            y_coordinate: projectedValue[1]
        }
    }
}


function handleMouseOn(d){
    d3.select(this)
        .transition()
            .duration(300)
            .attr('width', '32').attr('height', '32')
    d3.select('.description-box-holder')
        .transition().duration(750)
            .style('opacity', '1')
    descriptionBox
        .html("")
        .append('h2')
            .html(d.Company)
            .select(function(){ return this.parentNode })
        .append('img')
            .attr('src', 'media/' + d.Image)
            .select(function(){ return this.parentNode })
        .append('p')
            .html(d.Testimonial)
}

function handleMouseOut(d){
    d3.select(this)
        .transition(300)
            .attr('width', '20').attr('height', '20')
    descriptionBox
        .transition().duration(750)
            .style('opacity', '0')
}

function handleChange(checkbox){
    let vertical = d3.selectAll('.' + checkbox.value)
        .transition(300)

    if(checkbox.checked){
        vertical
            .attr('display', 'block')
            .attr('r', '15')
            .attr('opacity', '0.5')
            .transition(200)
            .attr('r', '6')
            .attr('opacity', '1')

    } else {
        vertical
            .attr('r', '1')
            .attr('opacity', '0')
            .transition(200)
            .attr('display', 'none')

    }
}

// let tooltip = d3.select('body')
//     .append('div').attr('class', 'tooltip')
//         .style('opacity', '0')

// tooltip
//     .style('opacity', '1')
//     .html('<b>' + d.Company + '</p>')
// tooltip
//     .style('opacity', '0')
// .on('mouseover', function(d){
//     let parent = tooltip.select(function() {return this.parentNode })
//     parent
//         .transition(200)
//         .style('opacity', '1')
// })
// .on('mousemove', function(d){
//     let parent = tooltip.select(function() { return this.parentNode })
//     parent
//         .style('left', (d3.mouse(this)[0]) + 'px')
//         .style('top', (d3.mouse(this)[1]) + 'px')
// })
// .on('mouseout', function(d){
//     let parent = tooltip.select(function() { return this.parentNode })
//     parent
//         .transition(200)
//         .attr('display', 'none')
// })

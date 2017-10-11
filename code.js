let margin = { top: 50, bottom: 50, left: 50, right: 50 }
let width = 900 - margin.left - margin.right
let height = 750 - margin.top - margin.bottom

let households = d3.map()
let testDataset1 = [18.0201157,59.3381068]
let testDataset2 = [13.127785, 55.7067814]
let testDataset3 = [16.020304, 57.83742]


let svg = d3.select('body')
    .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

let g = svg
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', '0.4')

let tooltip = d3.select('body')
    .append('div')
        .attr('class', 'tooltip')
        .style('opacity', '0')
    .append('img')
        .attr('src', 'visma_logo.jpg')

d3.queue()
    .defer(d3.json, 'sweden-counties.json')
    .defer(d3.csv, 'sweden-stats.csv', function(d){
        households.set(d.ID, +d.households)
    })
    .await(ready)

function ready(error, sweden){
    if (error) throw error;
    let colorDomain = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000]

    let color =  d3.scaleThreshold()
                    .domain(colorDomain)
                    .range(d3.schemeYlOrRd[9])

    let projection = d3.geoAlbers()
        .rotate([-25, 0])
        .fitSize([ width, height ], topojson.feature(sweden, sweden.objects.SWE_adm1))

    let path = d3.geoPath().projection(projection)

    let map = g
        .selectAll('path')
        .data(topojson.feature(sweden, sweden.objects.SWE_adm1).features)
        .enter()
        .append('path')
            .attr('d', path)
        // .attr('fill', d => color(households.get(d.properties.ID_1)))

    let points = svg
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('class', 'bubbles')
        .selectAll('circle')
        .data([testDataset1, testDataset2, testDataset3])
        .enter()
        .append('circle')
            .each(function(d,i){
                if(i === 0 || i === 2){
                    d3.select(this)
                        .attr('class', 'retail')
                } else {
                    d3.select(this)
                        .attr('class', 'gas')
                }
            })
            .attr('cx', d => extractCoordinates(d)['x_coordinate'])
            .attr('cy', d => extractCoordinates(d)['y_coordinate'])
            .attr('r', 6)
            .attr('fill', 'red')
            .attr('display', 'none')
            .attr('opacity', '0')
            .on('mouseover', function(d){
                let parent = tooltip.select(function() {return this.parentNode })
                parent
                    .transition(200)
                    .style('opacity', '1')

            })
            .on('mousemove', function(d){
                let parent = tooltip.select(function() { return this.parentNode })
                parent
                    .style('left', (d3.mouse(this)[0]) + 'px')
                    .style('top', (d3.mouse(this)[1]) + 'px')
            })
            .on('mouseout', function(d){
                let parent = tooltip.select(function() { return this.parentNode })
                parent
                    .transition(200)
                    .attr('display', 'none')
            })


    function extractCoordinates(coordinates){
        let projectedValue = projection([coordinates[0], coordinates[1]])
        return {
            x_coordinate: projectedValue[0],
            y_coordinate: projectedValue[1]
        }
    }
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

const HTTP = new XMLHttpRequest();
const URL = ("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json");
HTTP.open("GET", URL);
HTTP.send();
const HTTP2 = new XMLHttpRequest();


let datasetJSON;
let educationDataset;

HTTP.onreadystatechange = function(){
  // HTTP2 = new XMLHttpRequest();
  const URL2 = ('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json');
  HTTP2.open("GET", URL2);
  HTTP2.send();
    if (this.readyState == 4 && this.status == 200) {
        datasetJSON = JSON.parse(HTTP.responseText);
        secondAJAX();
    } else {
        console.log("something went wrong");
    }
} 

function secondAJAX() {
  HTTP2.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
      educationDataset = JSON.parse(HTTP2.responseText);
      d3Commands();
    } else {
      console.log('Something went wrong with 2nd request');
    }
  }
}

function d3Commands() {
  
  let margin = { top: 30, left: 0, right: 0, bottom: 0, },
  height = 700 - margin.top - margin.bottom,
  width = 950 - margin.left - margin.right;
  
  let svg = d3.select('body')
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .attr('data-education', '')
    .attr('opacity', 0);

    // turns lat and long into drawable paths
  let path = d3.geoPath();

  let counties = topojson.feature(datasetJSON, datasetJSON.objects.counties).features;
  
  svg.append('g')
  .selectAll('path')
  .data(counties)
  .enter().append('path')
  .attr('class', 'county')
  .attr("transform", `translate(0,${margin.top})`)
  .attr('data-fips', (d, i) => {
    // console.log(d);
    return educationDataset[i].fips;
  })
  .attr('data-education', (d, i) => {
    return educationDataset[i].bachelorsOrHigher;
  })
  .attr('data-areaname', (d, i) => {
    return educationDataset[i].area_name;
  })
  .attr('data-state', (d, i) => {
    return educationDataset[i].state;
  })
  .attr('fill', (d, i) => determineColor(educationDataset[i].bachelorsOrHigher))
  .attr('d', path)
  .attr('stroke-width', 0.3)
  .attr('stroke', 'gray')
  .on('mouseover', function(d, i) {
      tooltip.transition()
        .duration(0)
        .attr('data-education', () => this.getAttribute('data-education'))
        .style('opacity', 0.9);
      tooltip.html( function() {
        // get result by matching fips with id
          var result = educationDataset.filter(function( obj ) {
            return obj.fips == d.id;
          });
          // if there is a result use it
          if(result[0]){
            return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
          }
          //could not find a matching fips id in the data
          return 0
        })
        .style('left', (d3.event.pageX) + 10 + 'px')
        .style('top', (d3.event.pageY) + 'px')
      })
    .on('mouseout', function(d, i) {
      tooltip.transition()
        .duration(200)
        .attr('data-education', '')
        .style('opacity', 0);
    });

  
  // get the data for states, access features
  let states = topojson.feature(datasetJSON, datasetJSON.objects.states).features;
  
  svg.append('g')
    .selectAll('path')
    .data(states)
    .enter().append('path')
    .attr('class', 'state')
    .attr("transform", `translate(0,${margin.top})`)
    .attr('d', path)
    .attr('stroke-width', 0.5)
    .attr('stroke', 'white');

    // LEGEND
  let legend = svg.append("g")
    .attr("class", "legend")
    .attr('id', 'legend')
    .attr("transform","translate(0,0)")
    .style("font-size","12px")
    .selectAll('g')
    .data([
       0,
       13,
       26,
       39,
       43,
    ])
    .enter().append('g');

  legend.append('rect')
    .attr('y', (d, i) => 70)
    .attr('x', (d, i) => (width / 1.655) + (i * 60))
    .attr('height', 10)
    .attr('width', 60)
    .attr('fill', (d, i) => determineColor(d))
    .attr('stroke-width', 1.5)
    .attr('stroke', 'black');

  legend.append('text')
    .attr('y', (d, i) => 93)
    .attr('x', (d, i) => (width / 1.65) + (i * 60))
    .style('fill', 'black')
    .attr('weight', 'bold')
    .attr('font-size', '10pt')
    .text((d) => '' + (d) + '%');

     // TITLE
  svg.append('text')
    .attr("y", (15))
    .attr("x", (width / 2))
    .style("text-anchor", "middle")
    .attr('id', "title")
    .attr('font-size', '28pt')
    .attr('font-weight', 'bold')
    .text("United States Educational Attainment");
  // DESCRIPTION
  svg.append('text')
    .attr("y", (35))
    .attr("x", (width / 2))
    .style("text-anchor", "middle")
    .attr('id', "description")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");
}

function determineColor(data) {
  if (data <= 0) {
    return 'rgb(237, 248, 251)';
  } else if (data <= 13 && data > 0){
    return 'rgb(180, 205, 226)';
  } else if (data <= 26 && data > 13){
    return 'rgb(141, 151, 196)';
  } else if (data <= 39 && data > 26){
    return 'rgb(135, 89, 165)';
  } else if (data > 39){
    return 'rgb(128, 24, 123)';
  } else {
    return 'rgb(255, 0, 0)';
  }
}
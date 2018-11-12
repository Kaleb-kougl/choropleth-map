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
        // console.log(datasetJSON);
        secondAJAX();
    } else {
        console.log("something went wrong");
    }
} 

function secondAJAX() {
  HTTP2.onreadystatechange = function(){
    // console.log(2)
    if (this.readyState == 4 && this.status == 200) {
      educationDataset = JSON.parse(HTTP2.responseText);
      // console.log('worked!');
      // console.log(educationDataset);
      d3Commands();
    } else {
      console.log('Something went wrong with 2nd request');
    }
  }
}

function d3Commands() {
  
  let margin = { top: 0, left: 0, right: 0, bottom: 0, },
  height = 600 - margin.top - margin.bottom,
  width = 950 - margin.left - margin.right;
  
  let svg = d3.select('body')
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .attr('data-education', '')
    .attr('opacity', 0);

    // turns lat and long into drawable paths
  let path = d3.geoPath();

  
  
  let counties = topojson.feature(datasetJSON, datasetJSON.objects.counties).features;
  // console.log(datasetJSON);
  
  // console.log(counties);
  
  svg.append('g')
  .attr('class', 'counties')
  .selectAll('path')
  .data(counties)
  .enter().append('path')
  .attr('data-fips', (d, i) => {
    // console.log(educationDataset[i].fips);
    return educationDataset[i].fips;
  })
  .attr('data-education', (d, i) => {
    // console.log(educationDataset[i].bachelorsOrHigher);
    // console.log(educationDataset)
    return educationDataset[i].bachelorsOrHigher;
  })
  .attr('class', 'counties')
  .attr('d', path)
  .attr('stroke-width', 0.3)
  .attr('stroke', 'gray')
  .attr('fill', (d, i) => determineColor(educationDataset[i].bachelorsOrHigher))
  .on('mouseover', function(d, i) {
      tooltip.transition()
        .duration(0)
        .attr('data-education', (d, i) => this.getAttribute('data-education'))
        .style('opacity', 0.9);
      tooltip.html((d, i) => `${educationDataset[i].area_name}, ${educationDataset[i].state} ${this.getAttribute('data-education')}%`)
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
  
  // console.log(states);
  
  svg.append('g')
    .attr('class', 'state')
    .selectAll('path')
    .data(states)
    .enter().append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('stroke-width', 0.5)
    .attr('stroke', 'white');
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
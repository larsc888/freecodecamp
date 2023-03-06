// SWEET24 Color Palette
const COLORS = [
    "#2c4941",
    "#66a650",
    "#b9d850",
    "#82dcd7",
    "#208cb2",
    "#253348",
    "#1d1b24",
    "#3a3a41",
    "#7a7576",
    "#b59a66",
    "#cec7b1",
    "#cbcdd0",
    "#d78b98",
    "#a13d77",
    "#6d2047",
    "#3c1c43",
    "#2c2228",
    "#5e3735",
    "#885a44",
    "#b8560f",
    "#dc9824",
    "#efcb84",
    "#e68556",
    "#c02931"
]

const VIDEO_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const KICK_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const MOVIE_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

function createTreeMap(url) {
    d3.json(url).then(json => {
        // Set Correct Title
        setCorrectTitle(url);

        // Delete Existing SVG
        d3.selectAll("svg").remove();
        d3.selectAll("#tooltip").remove();

        // Get Dataset
        const DATASET = json;

        // SVG Config
        const WIDTH  = 1200;
        const HEIGHT = 900;
        const PADDING = 30;

        // Create Tooltip
        let tooltip = d3.select('#treemap')
                        .append('div')
                        .attr('id', 'tooltip')
                        .style('opacity', 0);
                        
        // Create SVG Container
        const svg = d3.select("#treemap")
                    .append("svg")
                    .attr("width", WIDTH)
                    .attr("height", HEIGHT);

        // Convert data into a hierarchical structure
        let root = d3.hierarchy(DATASET)
                     .sum(d => d.value)
                     .sort((a, b) => b.value - a.value);

        // Initial Treemap for Total Area
        let treemap = d3.treemap()
                        .size([WIDTH, HEIGHT])
                        .padding(1);
        
        // Create node by inserting "root" data into treemap
        let nodes = treemap(root);

        // Get total value from data
        let categories = getCategories(nodes.leaves());        

        // Insert nodes into SVG
        let cell = svg.selectAll(".node")
                      .data(nodes.leaves())
                      .enter()
                      .append("g")
                      .attr("class", "node")
                      .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
        
        cell.append("rect")
            .attr("class", "tile")
            .attr("data-name", d => d.data.name)
            .attr("data-category", d => d.data.category)
            .attr("data-value", d => d.value)            
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("fill", d => getColor(d, categories))
            .on("mousemove", function (event, d) {
                tooltip.transition()
                       .duration(50)
                       .style('opacity', 1);

                tooltip.style('left', (event.pageX) - (PADDING * 12) + 'px')                                              
                       .style('top', event.pageY - (PADDING * 6) + 'px')
                       .style('color', "black")
                       .attr("data-value", d.data.value)
                       .html(`Name: ${d.data.name} <br />
                              Category: ${d.data.category} <br />
                              Value: ${d.data.value}`);
            })
            .on("mouseout", function (event, d) {
                tooltip.transition()
                       .duration(50)
                       .style('opacity', 0);
            });

        // Create Text
        let text = cell.append("text");

        text.selectAll('tspan')
            .data(d => {
                let textList = d.data.name.split(" ");
                textList = (textList.length > 4) ? textList.slice(0, 3) : textList;
                return textList;
            })
            .enter()
            .append('tspan')
            .style("font-size", "0.8em")
            .style('fill', 'white')
            .attr("x", 5)
            .attr("y", (d, i) => (15 * i) + 15)
            .text(d => d)

        // Create SVG Container
        const legendSVG = d3.select("#treemap")
                            .append("svg")
                            .attr("width", WIDTH)
                            .attr("height", HEIGHT - (PADDING * 8))
                            .attr("id", "legend");

        let legend = legendSVG.selectAll(".legend")
                              .data(categories)
                              .enter()
                              .append("g")
                              .attr("class", "legend")
                              .attr("id", d => d)
                              .attr("transform", "translate(300, 0)");
        // Insert Rect
        legend.append("rect")
              .attr("class", "legend-item")
              .attr("width", 20)
              .attr("height", 20)
              .attr("fill", (d, i) => COLORS[i])
              .attr("x", (d, i) => {
                  if (i <= 5 ) { return 0; }
                  else if (i > 5 && i <= 11) { return 200; }
                  else if (i > 6 && i <= 17) { return 400; }
                  else { return 600; }
              })
              .attr("y", (d, i) => {
                  if (i % 6 === 0 ) { return 0; }
                  if (i <= 5 ) { return i * 30; }
                  else if (i >= 6 && i < 12) {return (i - 6) * 30; }
                  else if (i >= 12 && i < 18) {return (i - 12) * 30; }
                  else { return (i - 18) * 30 }                                
              });
        // Insert Text
        legend.append("text")
              .text(d => d)
              .attr("x", (d, i) => {
                  if (i <= 5 ) { return 25; }
                  else if (i >= 6 && i < 12) { return 225; }
                  else if (i >= 12 && i < 18) { return 425; }
                  else { return 625; }
              })
              .attr("y", (d, i) => {
                  if (i % 6 === 0 ) { return 15; }
                  if (i <= 5 ) { return (i * 30) + 15; }
                  if (i >= 6 && i < 12) {return ((i - 6) * 30) + 15; }
                  else { return ((i - 12) * 30) + 15 }                                
              });              
                              
    }).catch(e => console.log(e));
}

function getCategories(dataset) {
    let categories = [];

    dataset.forEach((obj, i) => {
        console.log(obj.data.category);
        if (!categories.includes(obj.data.category)) {
            categories.push(obj.data.category);
        }
    });
    return categories;
}

function getColor(d, categories) {
    let idx = 0;
    categories.forEach((category, i) => {
        if (d.data.category === category) {
            idx = i;
        }
    });
    return COLORS[idx];    
}

function setCorrectTitle(url) {
    let title = "";
    let description = "";
    switch (url) {
        case VIDEO_URL:
            title = "Video Game Sales";
            description = "Top 100 Most Sold Video Games Grouped by Platform";
            break;
        case MOVIE_URL:
            title = "Movie Sales";
            description = "Top 100 Highest Grossing Movies Grouped By Genre";
            break;
        case KICK_URL:
            title = "Kickstarter Pledges";
            description = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";
            break;            
    }

    let titleDOM = document.getElementById("title");
    let descriptionDOM = document.getElementById("description");

    titleDOM.innerText = title;
    descriptionDOM.innerText = description;
}

// Initialize Initial URL 
createTreeMap(VIDEO_URL);


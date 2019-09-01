async function loadData() {
  return d3.csv('data/Amber Donor Flow Network - Sheet1.csv');
}

async function init() {
  let data = await loadData();
  
  // let categories = ['Education', 'Energy', 'Health', 'Land', 'Mesh', 'Water'];
  let categories = _.uniq(_.pluck(data, 'Category'));

  // Create the nodes
  let donorNodes = _.uniq(_.pluck(data, 'Donor')).map((name) => {
    return {
      name: name,
      type: 'donor'
    }
  });

  let recipientNodes = _.uniq(_.pluck(data, 'Recipient')).map((name) => {
    return {
      name: name,
      type: 'recipient'
    }
  });

  let categoryNodes = categories.map((category) => {
    return {
      name: category,
      type: 'category'
    };
  });

  let nodes = Array.prototype.concat(donorNodes, categoryNodes, recipientNodes);

  // Create the links between nodes
  let links = [];
  for (let row of data) {
    links.push({
      donor: row['Donor'],
      source: row['Donor'],
      target: row['Category'],
      value: row['Donation Amount']
    });

    links.push({
      donor: row['Donor'],
      source: row['Category'],
      target: row['Recipient'],
      value: row['Donation Amount']
    });
  }

  // Draw the sankey graphic (based on https://observablehq.com/@d3/sankey-diagram?collection=@d3/d3-sankey)
  let width = window.innerWidth;
  let height = window.innerHeight - 5;

  let svg = d3.select(document.body).append('svg')
    .attr('width', width)
    .attr('height', height);

  let paddingLeftRight = 240;
  let paddingTopBottom = 20;
  let sankey = d3.sankey()
    .nodeId((d) => d.name)
    // .nodeAlign()
    .nodeWidth(0)
    .nodePadding(50)
    .extent([[paddingLeftRight, paddingTopBottom], [width - paddingLeftRight, height - paddingTopBottom]]);

  // compute the layout
  sankey({ nodes, links });

  // draw the layout
  svg.selectAll('circle')
    .data(nodes)
    .join('circle')
      .attr('cx', d => d.x0)
      .attr('cy', d => d.y0 + (d.y1 - d.y0) / 2)
      .attr('r', d => (d.y1 - d.y0) / 2)
      .attr('fill', 'rgba(0,0,0,0.1)')
    .append('title')
      .text(d => `${d.name}\n${(d.value)}`);

  svg.append("g")
    .style("font", "16px sans-serif")
    .selectAll('text.donor')
    .data(nodes)
    .join('text')
      .attr('class', 'donor')
      .attr("x", d => {
        if (d.type === 'donor') {
          return d.x0 - 20;
        } else if (d.type === 'recipient') {
          return d.x1 + 6;
        } else {
          return d.x0;
        }
      })
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => {
        if (d.type === 'donor') {
          return 'end';
        } else if (d.type === 'recipient') {
          return 'start';
        } else if (d.type === 'category') {
          return 'middle';
        }
      })
      .text(d => d.name);


  let linkColor = (donor) => {
    if (donor === 'Malik') {
      return '#ce56ce'; // pink
    } else if (donor === 'Benny') {
      return '#f9ab1f'; // orange
    }
  };
  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .join("g")
      .style("mix-blend-mode", "multiply");

  link.append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .style("stroke", (d) => linkColor(d.donor))
    .style("stroke-width", d => Math.max(1, d.width));

  link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${(d.value)}`);
}

init();

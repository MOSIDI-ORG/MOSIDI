import * as d3 from 'd3';

export const createHistogram = (data, canvasId) => {
    // Set dimensions
    const margin = { top: 50, right: 10, bottom: 50, left: 60 };
    const width = 350 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(`#${canvasId}`).selectAll('*').remove();

    // Create dropdown for scale selection
    const dropdown = d3.select(`#${canvasId}`)
        .append('select')
        .attr('id', `${canvasId}-scale`)
        .style('margin-bottom', '10px');

    dropdown.selectAll('option')
        .data(['linear', 'logarithmic'])
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    // Set default selection to linear
    dropdown.property('value', 'linear');

    // Function to update the histogram based on the selected scale
    const updateHistogram = (scaleType) => {
        // Clear previous SVG
        d3.select(`#${canvasId}`).select('svg').remove();

        // Create SVG
        const svg = d3.select(`#${canvasId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create X Scale
        const x = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([0, width]);

        // Create histogram data
        const histogram = d3.histogram()
            .value(d => d)
            .domain(x.domain())
            .thresholds(x.ticks(10));

        const bins = histogram(data);

        // Create Y Scale (Linear or Log)
        const y = (scaleType === 'logarithmic' ? d3.scaleLog() : d3.scaleLinear())
            .domain([1, d3.max(bins, d => d.length)]) // Start from 1 to avoid log(0)
            .nice()
            .range([height, 0]);

        // Add X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10))
            .attr('font-size', '12px')
            .call(g => g.selectAll('.domain').attr('stroke-width', 1.5));

        // Add Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5, ".1s"))
            .attr('font-size', '12px')
            .call(g => g.selectAll('.domain').attr('stroke-width', 1.5));

        // Add Bars
        const bar = svg.selectAll('.bar')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`);

        bar.append('rect')
            .attr('x', 1)
            .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr('height', d => height - y(d.length))
            .attr('fill', 'steelblue')
            .attr('rx', 4) // Rounded corners
            .attr('ry', 4)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .attr('fill', 'dodgerblue'); // Hover effect
                tooltip.style('opacity', 1)
                    .html(`Value Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br>Count: ${d.length}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .attr('fill', 'steelblue');
                tooltip.style('opacity', 0);
            });

        // Add Tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('opacity', 0)
            .style('background', 'rgba(0, 0, 0, 0.7)')
            .style('color', '#fff')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('font-size', '12px');

        // Add Axes Labels
        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 18)
            .attr('fill', '#000')
            .text('Value Range')
            .style('font-size', '12px');

        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 15)
            .attr('fill', '#000')
            .text('Frequency')
            .style('font-size', '12px');
    };

    // Initial rendering with default scale (linear)
    updateHistogram('linear');

    // Handle dropdown change
    dropdown.on('change', function () {
        const scaleType = d3.select(this).property('value');
        updateHistogram(scaleType);
    });
};

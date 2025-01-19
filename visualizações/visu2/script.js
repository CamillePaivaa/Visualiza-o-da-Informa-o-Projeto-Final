d3.csv("/data/dataset_limpo.csv").then((data) => {
  data.forEach((d) => {
    d.Height = +d.Height;
    d.Weight = +d.Weight;
    d.Year = +d.Year;
  });

  const years = Array.from(new Set(data.map((d) => d.Year))).sort();

  const dropdown = d3.select("#year-dropdown");
  dropdown
    .selectAll("option")
    .data(years)
    .join("option")
    .text((d) => d)
    .attr("value", (d) => d);

  const initialYear = years[0];
  updateScatterplot(initialYear);

  dropdown.on("change", function () {
    const selectedYear = +this.value;
    updateScatterplot(selectedYear);
  });

  function updateScatterplot(selectedYear) {
    const filteredData = data.filter((d) => d.Year === selectedYear);

    const maxHeight = d3.max(filteredData, (d) => d.Height);
    const maxWeight = d3.max(filteredData, (d) => d.Weight);
    const minHeight = d3.min(filteredData, (d) => d.Height);
    const minWeight = d3.min(filteredData, (d) => d.Weight);

    const svg = d3.select(".scatterplot");
    const width = 950;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([d3.min(filteredData, (d) => d.Weight) - 5, maxWeight + 5])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(filteredData, (d) => d.Height) - 5, maxHeight + 5])
      .range([height - margin.bottom, margin.top]);

    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const circles = svg.selectAll(".circle").data(filteredData);

    circles
      .join("circle")
      .attr("class", "circle")
      .attr("cx", (d) => x(d.Weight))
      .attr("cy", (d) => y(d.Height))
      .attr("r", 5)
      .attr("fill", (d) =>
        d.Height === maxHeight || d.Weight === maxWeight
          ? "red"
          : d.Height === minHeight || d.Weight === minWeight
          ? "blue"
          : "steelblue"
      )
      .attr("stroke", "black")
      .on("mouseover", function (event, d) {
        d3.select(".tooltip")
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .html(
            `<b>${d.Name}</b><br>
            País: ${d.Team}<br>
            Esporte: ${d.Sport}<br>
            Altura: ${d.Height} cm<br>
            Peso: ${d.Weight} kg`
          );
      })
      .on("mouseout", function () {
        d3.select(".tooltip").style("opacity", 0);
      });

    svg.selectAll(".legend").remove();
    addLegend(svg, width, margin);

    const duplicates = filteredData.filter(
      (d, i, arr) =>
        arr.findIndex(
          (item) => item.Height === d.Height && item.Weight === d.Weight
        ) !== i
    );
    console.log("Esportes com atletas de mesmo peso/altura:", duplicates);
  }

  function addLegend(svg, width, margin) {
    const legendData = [
      { color: "red", label: "Maior Altura/Peso" },
      { color: "blue", label: "Menor Altura/Peso" },
      { color: "steelblue", label: "Demais Atletas" },
    ];

    const legend = svg.append("g").attr("class", "legend");

    legend
      .selectAll("g")
      .data(legendData)
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(${width - margin.right - 150}, ${20 + i * 20})`
      )
      .each(function (d) {
        d3.select(this)
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", d.color)
          .attr("stroke", "black");

        d3.select(this)
          .append("text")
          .attr("x", 10)
          .attr("y", 5)
          .text(d.label)
          .attr("fill", "black")
          .attr("font-size", "12px");
      });
  }
});

const width = 900;
const height = 600;
const margin = { top: 70, right: 20, bottom: 40, left: 60 };

const svg = d3
  .select(".scatterplot")
  .attr("width", width)
  .attr("height", height);

const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

const xAxis = svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`);

const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", height - margin.bottom + 30)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("Total de Atletas");

svg
  .append("text")
  .attr("x", -height / 2)
  .attr("y", margin.left - 40)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("Total de Medalhas");

function loadData() {
  d3.csv("/data/dataset_limpo.csv").then((data) => {
    data.forEach((d) => {
      d.Year = +d.Year;
      d.TotalAthletes = +d.TotalAthletes || 0;
      d.TotalMedals = +d.TotalMedals || 0;
    });

    const groupedData = d3.groups(
      data,
      (d) => d.Team,
      (d) => d.Year
    );
    const stats = groupedData.flatMap(([team, years]) => {
      return years.map(([year, records]) => {
        return {
          Team: team,
          Year: +year,
          TotalAthletes: records.length,
          TotalMedals: records.filter((d) => d.Medal !== "No Medal").length,
        };
      });
    });

    xScale.domain([0, d3.max(stats, (d) => d.TotalAthletes)]);
    yScale.domain([0, d3.max(stats, (d) => d.TotalMedals)]);

    xAxis.call(d3.axisBottom(xScale));
    yAxis.call(d3.axisLeft(yScale));

    let circles = svg
      .selectAll("circle")
      .data(stats, (d) => d.Team + d.Year)
      .enter()
      .append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    const tooltip = d3.select(".tooltip");

    circles.on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Ano: ${d.Year}<br>País: ${d.Team}<br>Atletas: ${d.TotalAthletes}<br>Medalhas: ${d.TotalMedals}`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    });

    circles.on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

    const yearText = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("class", "year-title")
      .style("font-size", "20px");

    function animateScatterplot() {
      let currentYearIndex = 0;
      const years = Array.from(new Set(stats.map((d) => d.Year))).sort();

      const interval = setInterval(function () {
        if (currentYearIndex >= years.length) {
          circles.transition().duration(1000).style("opacity", 0);
          setTimeout(() => {
            circles
              .attr("cx", xScale(0))
              .attr("cy", yScale(0))
              .transition()
              .duration(1000)
              .style("opacity", 1);

            currentYearIndex = 0;
            yearText.text(`Ano: ${years[currentYearIndex]}`);
          }, 2000);
          return;
        }

        const yearData = stats.filter(
          (d) => d.Year === years[currentYearIndex]
        );

        circles
          .data(yearData, (d) => d.Team + d.Year)
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("cx", (d) => xScale(d.TotalAthletes))
          .attr("cy", (d) => yScale(d.TotalMedals));

        yearText.text(`Ano: ${years[currentYearIndex]}`);

        currentYearIndex++;
      }, 1000);
    }

    animateScatterplot();
  });
}

loadData();

d3.csv("/data/dataset_limpo.csv").then((data) => {
  const medalData = d3.group(
    data,
    (d) => d.Sport,
    (d) => d.Team
  );
  const athleteData = d3.group(data, (d) => d.Team);

  const sports = Array.from(medalData.keys());

  const dropdown = d3.select("#sport-dropdown");
  dropdown
    .selectAll("option")
    .data(sports)
    .join("option")
    .text((d) => d)
    .attr("value", (d) => d);

  const initialSport = sports[0];
  updateChart(initialSport);

  dropdown.on("change", function () {
    const selectedSport = this.value;
    updateChart(selectedSport);
  });

  function updateChart(selectedSport) {
    const countryMedals = Array.from(
      medalData.get(selectedSport) || [],
      ([team, records]) => ({
        country: team,
        count: records.length,
      })
    );

    const svg = d3.select(".bar-chart");
    const width = 950;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 100, left: 50 };

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(countryMedals.map((d) => d.country))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(countryMedals, (d) => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const bars = svg.selectAll(".bar").data(countryMedals);

    bars
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.country))
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count))
      .attr("width", x.bandwidth())
      .on("click", function (event, d) {
        updateAthleteList(d.country);
      });

    const tooltip = d3.select(".tooltip");
    bars
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .text(`${d.country}: ${d.count} medalhas`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  }

  function updateAthleteList(country) {
    const athletes = athleteData.get(country) || [];
    const list = d3.select("#athlete-list");
    const maxInitialAthletes = 25;

    function displayAthletes(limit) {
      list.selectAll("li").remove();
      list
        .selectAll("li")
        .data(athletes.slice(0, limit))
        .join("li")
        .text((d) => `${d.Name} (${d.Medal})`);
    }

    displayAthletes(maxInitialAthletes);

    d3.select("#view-more-btn").remove();

    if (athletes.length > maxInitialAthletes) {
      d3.select("#athlete-container")
        .append("button")
        .attr("id", "view-more-btn")
        .text("Ver mais")
        .on("click", function () {
          displayAthletes(athletes.length);
          d3.select(this).remove();
        });
    }
  }
});

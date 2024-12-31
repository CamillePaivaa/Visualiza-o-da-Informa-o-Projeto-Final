// Definindo as dimensões do gráfico
const width = 900;
const height = 600;
const margin = { top: 70, right: 20, bottom: 40, left: 60 };

// Criação do SVG dentro do contêiner da scatterplot
const svg = d3
  .select(".scatterplot")
  .attr("width", width)
  .attr("height", height);

// Definindo a escala para o eixo X (Total de atletas) e Y (Total de medalhas)
const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Definindo os eixos X e Y
const xAxis = svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`);

const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

// Função para carregar e processar os dados
function loadData() {
  d3.csv("/data/dataset_limpo.csv").then((data) => {
    // Preprocessamento: Filtra dados relevantes e converte para números
    data.forEach((d) => {
      d.Year = +d.Year;
      d.TotalAthletes = +d.TotalAthletes || 0;
      d.TotalMedals = +d.TotalMedals || 0;
    });

    // Agrupando dados por país e ano e calculando as estatísticas de interesse
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

    // Define os limites das escalas (com base nos dados)
    xScale.domain([0, d3.max(stats, (d) => d.TotalAthletes)]);
    yScale.domain([0, d3.max(stats, (d) => d.TotalMedals)]);

    // Criando os eixos
    xAxis.call(d3.axisBottom(xScale));
    yAxis.call(d3.axisLeft(yScale));

    // Criando os pontos do gráfico (scatterplot)
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

    // Criando a tooltip
    const tooltip = d3.select(".tooltip");

    // Adicionando interação de tooltip
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

    // Adicionando o texto do ano
    const yearText = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("class", "year-title")
      .style("font-size", "20px");

    // Função para animar o gráfico ao longo dos anos
    function animateScatterplot() {
      let currentYearIndex = 0;
      const years = Array.from(new Set(stats.map((d) => d.Year))).sort();

      // Função de animação para mover as bolinhas
      const interval = setInterval(function () {
        if (currentYearIndex >= years.length) {
          currentYearIndex = 0; // Reinicia a animação quando atingir o final
        }

        const yearData = stats.filter(
          (d) => d.Year === years[currentYearIndex]
        );

        // Atualiza a posição dos círculos para o ano atual
        circles
          .data(yearData, (d) => d.Team + d.Year)
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("cx", (d) => xScale(d.TotalAthletes))
          .attr("cy", (d) => yScale(d.TotalMedals));

        // Atualiza o texto do ano
        yearText.text(`Ano: ${years[currentYearIndex]}`);

        currentYearIndex++;
      }, 2000); // Atualiza a posição a cada 2 segundos
    }

    // Iniciar a animação
    animateScatterplot();
  });
}

// Carregar os dados e iniciar o gráfico
loadData();

"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface AnimalDatum {
  name: string;
  speed: number;
  diet: "carnivore" | "herbivore" | "omnivore";
}

const dietColors = {
  carnivore: "#ef4444", // red
  herbivore: "#22c55e", // green
  omnivore: "#3b82f6", // blue
};

export default function AnimalSpeedGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Load and process data
    d3.csv("/Matthew_Chin - Cleaned Animal Data").then((data) => {
      const processedData: AnimalDatum[] = data.map((d) => ({
        name: d.name || "",
        speed: +d.speed || 0,
        diet: (d.diet as "carnivore" | "herbivore" | "omnivore") || "omnivore",
      }));

      // Sort by speed for better visualization
      processedData.sort((a, b) => b.speed - a.speed);

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(processedData.map((d) => d.name))
        .range([0, innerWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(processedData, (d) => d.speed) || 0])
        .range([innerHeight, 0]);

      // Create axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      g.append("g").call(d3.axisLeft(yScale));

      // Add axis labels
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - innerHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Speed (km/h)");

      g.append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 5})`)
        .style("text-anchor", "middle")
        .text("Animal Species");

      // Create bars
      g.selectAll(".bar")
        .data(processedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.name) || 0)
        .attr("width", xScale.bandwidth())
        .attr("y", (d) => yScale(d.speed))
        .attr("height", (d) => innerHeight - yScale(d.speed))
        .attr("fill", (d) => dietColors[d.diet])
        .attr("opacity", 0.8);

      // Add value labels on bars
      g.selectAll(".bar-label")
        .data(processedData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.speed) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text((d) => d.speed);

      // Create legend
      const legend = g.append("g").attr("transform", `translate(${innerWidth - 150}, 20)`);

      const dietTypes = Object.keys(dietColors) as Array<keyof typeof dietColors>;

      dietTypes.forEach((diet, i) => {
        const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

        legendRow
          .append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", dietColors[diet])
          .attr("opacity", 0.8);

        legendRow
          .append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font-size", "14px")
          .text(diet.charAt(0).toUpperCase() + diet.slice(1));
      });
    });
  }, []);

  return (
    <div className="w-full">
      <h3 className="mb-4 text-xl font-semibold">Animal Speed vs Diet Visualization</h3>
      <div className="flex justify-center">
        <svg ref={svgRef} className="rounded-lg border bg-white"></svg>
      </div>
    </div>
  );
}

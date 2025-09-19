/* eslint-disable */
"use client";
import { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Define the interface for animal data
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
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV data
  useEffect(() => {
    csv("/sample_animals.csv").then((data) => {
      const processedData: AnimalDatum[] = data.map((d) => ({
        name: d.name || "",
        speed: +(d.speed || 0),
        diet: (d.diet as "carnivore" | "herbivore" | "omnivore") || "omnivore",
      }));
      setAnimalData(processedData);
    });
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort data by speed for better visualization
    const sortedData = [...animalData].sort((a, b) => b.speed - a.speed);

    // Create scales
    const xScale = scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = scaleLinear()
      .domain([0, max(sortedData, (d) => d.speed) || 0])
      .range([innerHeight, 0]);

    const colorScale = scaleOrdinal()
      .domain(["carnivore", "herbivore", "omnivore"])
      .range([dietColors.carnivore, dietColors.herbivore, dietColors.omnivore]);

    // Create axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g").call(axisLeft(yScale));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Speed (km/h)");

    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Animal Species");

    // Create bars
    g.selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.speed))
      .attr("height", (d) => innerHeight - yScale(d.speed))
      .attr("fill", (d) => colorScale(d.diet) as string)
      .attr("opacity", 0.8);

    // Add value labels on bars
    g.selectAll(".bar-label")
      .data(sortedData)
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
    const legend = g
      .append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);

    const dietTypes = ["carnivore", "herbivore", "omnivore"] as const;

    dietTypes.forEach((diet, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(diet) as string)
        .attr("opacity", 0.8);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "14px")
        .text(diet.charAt(0).toUpperCase() + diet.slice(1));
    });
  }, [animalData]);

  return (
    <div className="w-full">
      <div ref={graphRef} className="border rounded-lg bg-white p-4"></div>
    </div>
  );
}

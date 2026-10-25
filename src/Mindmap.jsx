import { useEffect, useRef } from "react";
import * as d3 from "d3";

// radial d3 mindmap, adapted from https://github.com/razbakov/mindmap
// data shape: { name, children?: [ ...same shape ] }
// click a filled node to expand/collapse it, drag to pan, scroll to zoom

// const branchColors = ["#6179A9", "#2a9d8f", "#e76f51", "#c9a227", "#6a994e", "#9b5de5", "#d6577a", "#4d96ff"];
const branchColors = ["#6678A5"];
const duration = 500;
const nodeRadius = 10;
const depthSpacing = 160;

function radialPoint(x, y) {
  const angle = ((x - 90) / 180) * Math.PI;
  return [y * Math.cos(angle), y * Math.sin(angle)];
}

function branchColor(d) {
  // the top-level ancestor (depth 1) decides the color of the whole branch
  let n = d;
  while (n && n.depth > 1) n = n.parent;
  if (!n || n.depth === 0) return branchColors[0];
  return branchColors[n.parent.children.indexOf(n) % branchColors.length];
}

function toggle(d) {
  if (d.children) { d._children = d.children; d.children = null; }
  else if (d._children) { d.children = d._children; d._children = null; }
}

function expandAll(d) {
  if (d._children) { d.children = d._children; d._children = null; }
  if (d.children) d.children.forEach(expandAll);
}

function collapseBelow(d, depth) {
  if (d.depth >= depth && d.children) { d._children = d.children; d.children = null; }
  (d.children || d._children || []).forEach((c) => collapseBelow(c, depth));
}

export default function Mindmap({ data, height = 800, initialDepth = 2, onNodeClick }) {
  const svgRef = useRef(null);
  const api = useRef({});

  useEffect(() => {
    if (!data) return;
    const svgEl = svgRef.current;
    const width = svgEl.clientWidth;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    const g = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (e) => g.attr("transform", e.transform));
    const fit = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85);
    svg.call(zoom).on("dblclick.zoom", null);
    svg.call(zoom.transform, fit);

    let uid = 0;
    const root = d3.hierarchy(data);
    root.descendants().forEach((d) => { d.id = ++uid; });
    root.x0 = 0; root.y0 = 0;
    collapseBelow(root, initialDepth);

    const tree = d3.tree()
      .size([360, 1])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const link = d3.linkRadial()
      .angle((d) => (d.x / 180) * Math.PI)
      .radius((d) => d.y);

    function update(source) {
      tree(root);
      const nodes = root.descendants();
      const links = root.links();
      nodes.forEach((d) => { d.y = d.depth * depthSpacing; });

      // ---- nodes ----
      const node = g.selectAll("g.mm-node").data(nodes, (d) => d.id);

      const nodeEnter = node.enter().append("g")
        .attr("class", "mm-node")
        .attr("transform", () => `translate(${radialPoint(source.x0, source.y0)})`)
        .on("click", (e, d) => { toggle(d); update(d); });

      nodeEnter.append("circle").attr("r", 0);
      nodeEnter.append("text")
        .attr("dy", "0.35em")
        .text((d) => d.data.name)
        .on("click", (e, d) => {
          if (!onNodeClick) return;
          e.stopPropagation();
          onNodeClick(d.data);
        });

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate.transition().duration(duration)
        .attr("transform", (d) => d.depth === 0 ? "translate(0,0)" : `translate(${radialPoint(d.x, d.y)})`);

      nodeUpdate.select("circle")
        .attr("r", (d) => nodeRadius)
        .style("fill", (d) => d.depth === 0 || d._children ? branchColor(d) : "white")
        .style("stroke", branchColor)
        .style("stroke-width", (d) => 1 )
        .style("cursor", (d) => d.children || d._children ? "pointer" : "grab");

      nodeUpdate.select("text")
        .attr("x", (d) => d.depth === 0 ? 0 : d.x < 180 ? 12 : -12)
        .attr("text-anchor", (d) => d.depth === 0 ? "middle" : d.x < 180 ? "start" : "end")
        .attr("transform", (d) => d.depth === 0 ? "translate(0,-20)" : "")
        .style("fill", (d) => d.depth === 0 ? "#CE5A5E" : branchColor(d))
        .style("font-size", (d) => d.depth === 0 ? "20px" : "18px")
        .style("font-weight", (d) => "400")
        .style("cursor", onNodeClick ? "pointer" : "grab");

      const nodeExit = node.exit().transition().duration(duration)
        .attr("transform", () => `translate(${radialPoint(source.x, source.y)})`)
        .remove();
      nodeExit.select("circle").attr("r", 0);
      nodeExit.select("text").style("fill-opacity", 0);

      // ---- links ----
      const path = g.selectAll("path.mm-link").data(links, (d) => d.target.id);

      const pathEnter = path.enter().insert("path", "g")
        .attr("class", "mm-link")
        .attr("d", () => {
          const o = { x: source.x0, y: source.y0 };
          return link({ source: o, target: o });
        });

      pathEnter.merge(path).transition().duration(duration)
        .attr("d", link)
        .style("stroke", (d) => branchColor(d.target))
        .style("stroke-opacity", (d) => d.target.depth <= 1 ? 0.6 : 0.4)
        .style("stroke-width", (d) => /*d.target.depth*/ "1.5px");

      path.exit().transition().duration(duration)
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return link({ source: o, target: o });
        })
        .remove();

      nodes.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });
    }

    update(root);

    api.current = {
      fit: () => svg.transition().duration(750).call(zoom.transform, fit),
      expand: () => { expandAll(root); update(root); },
      collapse: () => { collapseBelow(root, 1); update(root); },
    };

    return () => { svg.selectAll("*").remove(); svg.on(".zoom", null); };
  }, [data, height, initialDepth, onNodeClick]);

  return (
    <div className="mindmap" style={{ height }}>
      <div className="mindmap-controls">
        {/*<button onClick={() => api.current.fit?.()}>Fit</button>*/}
        {/*<button onClick={() => api.current.expand?.()}>Expand all</button>*/}
        {/*<button onClick={() => api.current.collapse?.()}>Collapse</button>*/}
      </div>
      <svg ref={svgRef} className="mindmap-svg" />
    </div>
  );
}

import * as d3 from 'd3';
import React, { useRef, useEffect, useCallback } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function BarChart({ width, height, data }) {
  const svgRef = useRef(null);
  // const [dataSvg, setDataSvg] = useState(null);

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black');
  }, []);

  useEffect(() => {
    draw();
  }, [data]);

  const draw = () => {
    const svg = d3.select(svgRef.current);
    const selection = svg.selectAll('rect').data(data);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, height - 100]);

    selection
      .transition()
      .duration(300)
      .attr('height', (d) => yScale(d))
      .attr('y', (d) => height - yScale(d));

    selection
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 45)
      .attr('y', (d) => height)
      .attr('width', 40)
      .attr('height', 0)
      .attr('fill', 'orange')
      .transition()
      .duration(300)
      .attr('height', (d) => yScale(d))
      .attr('y', (d) => height - yScale(d));

    selection
      .exit()
      .transition()
      .duration(300)
      .attr('y', (d) => height)
      .attr('height', 0)
      .remove();
  };

  const getPdf = useCallback(() => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      console.log('svgData', svgData);

      const docDefinition = {
        content: [
          'SVG nodes behave similar to images by supporting width/height or fit',
          'It is however not yet possible to use svg files or to have a library of svgs in the document definition',
          '\n',
          'Note that before you can use SVG nodes you must install svg-to-pdfkit as it is not included with pdfmake to keep bundle size down',
          {
            svg: svgData,
            width: 600,
            height: 400,
          },
          'If you specify width, svg will scale proportionally',
          {
            svg: svgData,
            width: 200,
          },
          'You can also fit the svg inside a rectangle',
          {
            svg: svgData,
            fit: [100, 100],
          },
        ],
      };

      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      const pdfGenerator = pdfMake.createPdf(docDefinition);
      pdfGenerator.getDataUrl((dataUrl) => {
        //const targetElement = document.querySelector('#embedContainer');
        const frame = document.getElementById('idChartIframe');
        console.log('frame', frame);
        frame.setAttribute('src', dataUrl);
        console.log('frame after', frame);
      });
    }
  }, [svgRef.current]);

  return (
    <div>
      <div id="ChartContainer" className="chart">
        <svg ref={svgRef} style={{ display: 'none' }}></svg>
      </div>
      <div>
        <iframe
          id="idChartIframe"
          height={800}
          width={600}
          src="about:blank"
          title="W3Schools Free Online Web Tutorials"
        ></iframe>
      </div>
      <div>
        <button onClick={getPdf}>Display Pdf with D3.js</button>
      </div>
    </div>
  );
}

export default BarChart;

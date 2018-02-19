import { select } from 'd3-selection';
import { geoMercator, geoPath } from 'd3-geo';
import { tile as d3tile } from 'd3-tile';
import { queue } from 'd3-queue';
import { json as d3json } from 'd3-request';

import { rdclClassify, rdclLvOrderCompare } from './styles/rdclClassify';

import './styles/rdcl.css';

const pi = Math.PI;
const tau = 2 * pi;

const size = {
  width: window.innerWidth,
  height: window.innerHeight
};

const svg = select('body')
  .append('svg')
  .attr('width', size.width)
  .attr('height', size.height);

const loader = svg.append('circle')
                  .attr('id', 'loader')
                  .attr('cx', size.width / 2)
                  .attr('cy', size.height / 2)
                  .attr('r', 14)
                  .attr('fill', 'none');

const view = {
  center: [140.459518, 36.369604],
  zoom: 14.5,
  tile: 16
};

const overlay = {
  center: [],
  flag: false,
};

if (window.location.hash !== '') {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('&');

  for (let i = 0; i < parts.length; i++) {
    const prop = parts[i].split('=');
    switch (prop[0]) {
      case 'map':
        const [z, x, y] = prop[1].split('/');

        view.zoom = parseFloat(z);
        view.center = [parseFloat(x), parseFloat(y)];
        break;
      case 'overlay':
        overlay.flag = true;
        if (prop[1] !== undefined) {
          overlay.center = prop[1].split('/').map(d => parseFloat(d));
        } else {
          overlay.center = view.center;
        }
        break;
    }
  }
}

const mag = Math.pow(2, view.tile - view.zoom);

const projection = geoMercator()
  .center(view.center)
  .scale(256 * Math.pow(2, view.zoom) / tau)
  .translate([size.width / 2, size.height / 2]);

const path = geoPath().projection(projection);

const tile = d3tile().size([size.width * mag, size.height * mag]);

const tiles = tile
  .scale(projection.scale() * tau * mag)
  .translate(projection([0, 0]).map(v => v * mag))();

const q = queue();

console.log(tiles);


for (let i = 0; i < tiles.length; i++) {
  const { x, y, z } = tiles[i];
  console.log(x, y, z);

  q.defer(
    d3json,
    `https://cyberjapandata.gsi.go.jp/xyz/experimental_rdcl/${z}/${x}/${y}.geojson`
  );
}

q.awaitAll((error, data) => {
  if (error) throw error;
  loader.style('display', 'none');
  const g = svg
    .selectAll('.file')
    .data(data.filter(datum => datum !== undefined))
    .enter()
    .append('g')
    .attr('class', 'file');

  g
    .selectAll('path')
    .data(d => d.features.sort(rdclLvOrderCompare))
    .enter()
    .append('path')
    .attr('class', v => rdclClassify(v))
    .attr('d', path);

  if (overlay.flag) {
    svg
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', projection(overlay.center)[0])
      .attr('cy', projection(overlay.center)[1])
      .attr('r', 5)
      .attr('fill', 'red')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
  }
});

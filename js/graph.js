// Визуализация сети ученых с помощью D3.js

class ScholarNetwork {
  constructor(containerId, scholars, connections) {
    this.container = d3.select(containerId);
    this.scholars = scholars;
    this.connections = connections;
    this.width = 0;
    this.height = 0;
    this.simulation = null;
    this.svg = null;
    this.g = null;
    this.nodes = null;
    this.links = null;
    this.tooltip = d3.select('#tooltip');

    this.init();
  }

  init() {
    this.setupDimensions();
    this.setupSVG();
    this.setupSimulation();
    this.render();
    this.setupResize();
  }

  setupDimensions() {
    const container = this.container.node();
    this.width = container.clientWidth || 800;
    this.height = container.clientHeight || 600;
  }

  setupSVG() {
    this.svg = this.container
      .attr('width', this.width)
      .attr('height', this.height);

    // Группа для зума и панорамирования
    this.g = this.svg.append('g');

    // Настройка зума
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Маркер стрелки для направленных связей
    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Добавляем легенду
    this.addLegend();
  }

  addLegend() {
    const legend = this.svg.append('g')
      .attr('class', 'legend-svg')
      .attr('transform', `translate(20, ${this.height - 130})`);

    const legendBg = legend.append('rect')
      .attr('width', 150)
      .attr('height', 120)
      .attr('fill', 'white')
      .attr('stroke', '#d4c5b0')
      .attr('rx', 8);

    const items = [
      { label: 'Супруги', class: 'spouse', color: '#e74c3c' },
      { label: 'Соавторы', class: 'coauthor', color: '#3498db' },
      { label: 'Близкая дружба', class: 'friendship', color: '#27ae60', dashed: true },
      { label: 'Коллеги', class: 'collaboration', color: '#999' }
    ];

    legend.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2c3e50')
      .text('Типы связей:');

    items.forEach((item, i) => {
      const y = 40 + i * 20;

      legend.append('line')
        .attr('x1', 10)
        .attr('y1', y)
        .attr('x2', 40)
        .attr('y2', y)
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dashed ? '5,3' : 'none');

      legend.append('text')
        .attr('x', 50)
        .attr('y', y + 4)
        .attr('font-size', '11px')
        .attr('fill', '#333')
        .text(item.label);
    });
  }

  setupSimulation() {
    // Создаем данные для узлов
    const nodes = this.scholars.map(s => ({
      id: s.id,
      name: s.name,
      shortName: this.getShortName(s.name),
      initials: this.getInitials(s.name),
      years: s.years,
      shortBio: s.shortBio,
      ...s
    }));

    // Создаем данные для связей
    const links = this.connections.map(c => ({
      source: c.source,
      target: c.target,
      type: c.type,
      label: c.label
    }));

    // Настраиваем силовую модель
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(150)
        .strength(0.5))
      .force('charge', d3.forceManyBody()
        .strength(-400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(50));

    this.nodesData = nodes;
    this.linksData = links;
  }

  getShortName(fullName) {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }
    return fullName;
  }

  getInitials(fullName) {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return fullName.substring(0, 2);
  }

  render() {
    // Отрисовка связей
    this.links = this.g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.linksData)
      .enter()
      .append('line')
      .attr('class', d => `link ${d.type}`)
      .attr('stroke-width', d => {
        if (d.type === 'spouse' || d.type === 'coauthor') return 2.5;
        if (d.type === 'friendship') return 2;
        return 1.5;
      });

    // Отрисовка узлов
    this.nodes = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(this.nodesData)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(this.drag())
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mousemove', (event, d) => this.moveTooltip(event))
      .on('mouseout', () => this.hideTooltip())
      .on('click', (event, d) => this.showPanel(d));

    // Круги узлов
    this.nodes.append('circle')
      .attr('r', d => d.id === 'lotman' ? 28 : 22);

    // Инициалы внутри кругов
    this.nodes.append('text')
      .attr('class', 'initials')
      .attr('dy', '0.35em')
      .text(d => d.initials);

    // Подписи под узлами
    this.nodes.append('text')
      .attr('class', 'label')
      .attr('dy', 40)
      .text(d => d.shortName);

    // Обновление позиций
    this.simulation.on('tick', () => {
      this.links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      this.nodes
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  drag() {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  showTooltip(event, d) {
    this.tooltip.classed('hidden', false);
    this.tooltip.select('.tooltip-name').text(d.name);
    this.tooltip.select('.tooltip-years').text(d.years);
    this.tooltip.select('.tooltip-bio').text(d.shortBio);
    this.moveTooltip(event);
  }

  moveTooltip(event) {
    const tooltipNode = this.tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;

    let x = event.pageX + 15;
    let y = event.pageY + 15;

    // Проверяем, не выходит ли за правый край
    if (x + tooltipWidth > window.innerWidth) {
      x = event.pageX - tooltipWidth - 15;
    }

    // Проверяем, не выходит ли за нижний край
    if (y + tooltipHeight > window.innerHeight) {
      y = event.pageY - tooltipHeight - 15;
    }

    this.tooltip
      .style('left', x + 'px')
      .style('top', y + 'px');
  }

  hideTooltip() {
    this.tooltip.classed('hidden', true);
  }

  showPanel(d) {
    // Находим полные данные учёного
    const scholar = this.scholars.find(s => s.id === d.id);
    if (scholar) {
      window.showScholarPanel(scholar);
    }
  }

  highlightNode(scholarId) {
    this.nodes.classed('highlighted', d => d.id === scholarId);
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.setupDimensions();
      this.svg
        .attr('width', this.width)
        .attr('height', this.height);
      this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
      this.simulation.alpha(0.3).restart();
    });
  }
}

// Инициализация при загрузке страницы
let network = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof scholars !== 'undefined' && typeof connections !== 'undefined') {
    network = new ScholarNetwork('#network-graph', scholars, connections);
  }
});

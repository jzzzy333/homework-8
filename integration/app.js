// 校园信息中心 · app.js
// 骨架阶段 + 自习室筛选（复用作业五）+ 统计图表（复用作业六）

console.log('[app.js] Bootstrap + ECharts + 自定义 CSS 已就绪');

/* ===== 自习室数据（写死，演示用） ===== */
const rooms = [
  { id: 1, name: 'A101', floor: 1, capacity: 60,  used: 45,  open: true  },
  { id: 2, name: 'A201', floor: 2, capacity: 80,  used: 70,  open: true  },
  { id: 3, name: 'A301', floor: 3, capacity: 50,  used: 0,   open: false },
  { id: 4, name: 'B102', floor: 1, capacity: 40,  used: 20,  open: true  },
  { id: 5, name: 'B202', floor: 2, capacity: 100, used: 0,   open: false }
];

/* ===== 复用作业五筛选模式：currentFilter 状态 + 事件委托 ===== */
const roomFilter = { floor: 'all', open: 'all' };

const roomList = document.querySelector('#room-list');

const renderRooms = () => {
  roomList.innerHTML = '';
  const shown = rooms.filter(r =>
    (roomFilter.floor === 'all' || r.floor === parseInt(roomFilter.floor)) &&
    (roomFilter.open === 'all' || String(r.open) === roomFilter.open)
  );
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'room-empty';
    li.textContent = '没有符合条件的自习室';
    roomList.appendChild(li);
    return;
  }
  shown.forEach(r => {
    const pct = r.capacity ? Math.round(r.used / r.capacity * 100) : 0;
    const li = document.createElement('li');
    li.className = 'room-item' + (r.open ? '' : ' closed');
    li.innerHTML = `
      <div class="room-name">
        ${r.name}
        <span class="badge ${r.open ? 'bg-success' : 'bg-secondary'}">
          ${r.open ? '开放' : '关闭'}
        </span>
      </div>
      <div class="room-meta">
        ${r.floor}F · 容量 ${r.capacity} · 当前 ${r.used} 人 · 使用率 ${pct}%
      </div>
      <div class="room-bar">
        <div class="room-bar-inner" style="width:${pct}%"></div>
      </div>
    `;
    roomList.appendChild(li);
  });
};

// 事件委托：所有 .btn-group[data-filter-key] 下的按钮共用一个监听
document.querySelectorAll('[data-filter-key]').forEach(group => {
  group.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const key = group.dataset.filterKey;
    roomFilter[key] = e.target.dataset.filter;
    // 切换 active 按钮高亮
    group.querySelectorAll('button').forEach(b =>
      b.classList.toggle('active', b === e.target)
    );
    renderRooms();
  });
});

renderRooms();

/* ===== 复用作业六统计图表：fetch data.json + ECharts setOption ===== */
let barChart = null;

const loadStats = async () => {
  const statusEl = document.querySelector('#stats-status');
  const sourceEl = document.querySelector('#stats-source');
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    statusEl.textContent = '';
    sourceEl.textContent = `数据来源：${data.source}（${data.title}）`;
    renderBarChart(data);
  } catch (err) {
    statusEl.textContent = '加载失败：' + err.message;
  }
};

const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: data.title, subtext: '单位：' + data.unit, left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { data: data.rooms, name: '自习室' },
    yAxis: { name: data.unit },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
});

loadStats();

/* ===== 骨架阶段：滚动时高亮 navbar 中当前所在区块的链接 ===== */
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('main section');

const onScroll = () => {
  let currentId = '';
  const offset = 100;
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - offset) {
      currentId = sec.id;
    }
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href.endsWith('#' + currentId));
  });
};

window.addEventListener('scroll', onScroll);
onScroll();

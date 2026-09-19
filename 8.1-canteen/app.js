// 作业 8.1 · 云大干饭指南（骨架版）
// 四模块规划：页面(index.html) + 样式(style.css) + 交互(app.js 后续检查点) + 数据(data.json/图表 后续检查点)

console.log('[app] 骨架加载完成：页面 ✓ 样式 ✓ （交互与数据模块待后续检查点接入）');

/* ===== 滚动时高亮当前区块的导航链接（骨架自带，不属于功能实现） ===== */
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('main section');

const onScroll = () => {
  let currentId = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) currentId = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === '#' + currentId);
  });
};

window.addEventListener('scroll', onScroll);
onScroll();

/* ===== 后续检查点接入位置（占位说明，当前未实现） =====
   1. 交互模块：#food-filter 筛选（复用作业五 currentFilter + 事件委托）
   2. 交互模块：#recommend 表单（校验 + localStorage 持久化）
   3. 数据模块：fetch data.json + 内置兜底 + 合并"我的推荐"
   4. 可视化模块：ECharts 各食堂推荐热度柱状图（与榜单共用 state） */

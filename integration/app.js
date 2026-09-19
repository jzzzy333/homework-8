// 校园信息中心 · app.js
// 当前为骨架阶段：日志确认 Bootstrap 加载 + 滚动高亮当前 nav-link

console.log('[app.js] Bootstrap + 自定义 CSS 已就绪，骨架加载完成。');

// 滚动时高亮 navbar 中当前所在区块的链接
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('main section');

const onScroll = () => {
  let currentId = '';
  const offset = 100; // 提前切换到下一项，避免贴边时来回跳
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
onScroll(); // 初次执行一次

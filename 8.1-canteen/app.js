// 作业 8.1 · 云大干饭指南
// 已接入：数据模块（fetch + 兜底 + localStorage）+ 交互模块（我来推荐表单，5 分制打分）
// 待接入：数据可视化（#chart，将直接消费这里的 score 字段）

console.log('[app] 模块加载开始…');

/* ===== 数据层 ===== */

// 内置兜底：断网 / fetch 失败时使用（内容与 data.json 一致，评分统一 5 分）
const SEED = [
  { id: 1, shop: '贵阳水煮菜',       dish: '水煮菜砂锅', canteen: '楠苑', floor: '一楼', score: 5, note: '就是得快点吃，不然肉会在砂锅里闷老' },
  { id: 2, shop: '硕阳小吃',         dish: '辣子鸡',     canteen: '楠苑', floor: '二楼', score: 5, note: '辣子鸡有锅气' },
  { id: 3, shop: '承包食堂（三楼）', dish: '家常小炒',   canteen: '楠苑', floor: '三楼', score: 5, note: '菜价普遍比一楼贵，但胜在人少排队快' },
  { id: 4, shop: '承包食堂（一楼）', dish: '家常小炒',   canteen: '梓园', floor: '一楼', score: 5, note: '便宜又好吃' },
  { id: 5, shop: '小锅猪肚鸡',       dish: '猪肚鸡',     canteen: '梓园', floor: '二楼', score: 5, note: '同学口口相传的暖胃首选' },
  { id: 6, shop: '傣味菠萝饭',       dish: '菠萝饭',     canteen: '梓园', floor: '二楼', score: 5, note: '酸甜开胃，一到饭点就排队' }
];

const STORE_KEY = 'canteen-recs-mine';
const state = { items: [], source: '' };

const loadMine = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    // 兼容守卫：只保留符合新数据结构的记录
    return Array.isArray(arr) ? arr.filter(m => m && m.shop && m.dish) : [];
  } catch (e) {
    return [];
  }
};

const saveMine = (mine) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(mine));
  } catch (e) {
    console.warn('[app] localStorage 不可用，推荐仅本次会话有效');
  }
};

// 初始化：fetch data.json（断网/失败 → SEED 兜底），再合并「我的推荐」
const initData = async () => {
  let base = SEED;
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (Array.isArray(data.items) && data.items.length > 0) {
      base = data.items;
      state.source = data.source || 'data.json';
    } else {
      state.source = 'data.json（items 为空，空数据用例）';
    }
    console.log('[app] 数据模块：data.json 加载成功，条目数 =', base.length);
  } catch (err) {
    state.source = '内置兜底数据（fetch 失败：' + err.message + '）';
    console.warn('[app] 数据模块：fetch 失败，启用内置兜底 →', err.message);
  }
  const mine = loadMine();
  state.items = [...base, ...mine];
  console.log('[app] 数据合并完成：初始', base.length, '条 + 我的推荐', mine.length, '条');
};

/* ===== 视图层：推荐榜单 ===== */

const foodGrid = document.querySelector('#food-grid');
const foodEmpty = document.querySelector('#food-empty');

const starsOf = (score) => '★'.repeat(score) + '☆'.repeat(5 - score);

let showAll = false;
const toggleAllBtn = document.querySelector('#toggle-all');

// 最新提交在前：我的推荐按提交时间倒序，其后是初始榜单
const sortedItems = () => [
  ...state.items.filter(it => it.mine).reverse(),
  ...state.items.filter(it => !it.mine)
];

const renderFoods = () => {
  const list = sortedItems();
  const shown = showAll ? list : list.slice(0, 3); // 默认只看最新 3 条
  foodGrid.innerHTML = '';
  foodEmpty.classList.toggle('d-none', list.length > 0);
  toggleAllBtn.classList.toggle('d-none', list.length <= 3);
  toggleAllBtn.textContent = showAll
    ? '收起，只看最新 3 条'
    : `查看全部（共 ${list.length} 家）`;

  shown.forEach(it => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';
    const card = document.createElement('article');
    card.className = 'food-card';
    card.innerHTML = `
      <h3></h3>
      <div class="food-meta"></div>
      <p class="food-dish"></p>
      <p class="food-note"></p>
      <div class="food-score"></div>
    `;
    card.querySelector('h3').textContent = it.shop;
    if (it.mine) {
      const b = document.createElement('span');
      b.className = 'badge badge-mine';
      b.textContent = '我的推荐';
      card.querySelector('h3').appendChild(b);
    }
    card.querySelector('.food-meta').textContent =
      [it.canteen + '食堂', it.floor].filter(Boolean).join(' · ');
    card.querySelector('.food-dish').textContent = '推荐菜品：' + it.dish;
    card.querySelector('.food-note').textContent = it.note || '（这位同学很神秘，没有留下理由）';
    const score = Math.min(5, Math.max(1, it.score || 0));
    const scoreEl = card.querySelector('.food-score');
    scoreEl.innerHTML = '<span class="stars"></span><span class="score-num"></span>';
    scoreEl.querySelector('.stars').textContent = starsOf(score);
    scoreEl.querySelector('.score-num').textContent = ' ' + score + '/5';
    col.appendChild(card);
    foodGrid.appendChild(col);
  });
};

/* ===== 交互层：我来推荐表单 ===== */

const form = document.querySelector('#rec-form');
const formTip = document.querySelector('#form-tip');

const setTip = (text, ok) => {
  formTip.textContent = text;
  formTip.className = 'form-tip ' + (ok ? 'ok' : 'err');
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const shop = document.querySelector('#shop').value.trim();
  const dish = document.querySelector('#dish').value.trim();
  const canteen = document.querySelector('#canteen').value;
  const score = parseInt(document.querySelector('#score').value, 10);
  const note = document.querySelector('#note').value.trim();

  if (shop === '') { setTip('店家名字不能为空', false); return; }
  if (dish === '') { setTip('推荐菜品不能为空', false); return; }
  if (canteen === '') { setTip('请选择食堂', false); return; }
  if (isNaN(score) || score < 1 || score > 5) { setTip('请给出 1-5 的评分', false); return; }

  const item = { id: 'm' + Date.now(), shop, dish, canteen, floor: '', score, note, mine: true };
  const mine = loadMine();
  mine.push(item);
  saveMine(mine);
  state.items.push(item);

  form.reset();
  setTip('提交成功！评分 ' + score + ' 分已计入榜单', true);
  renderFoods();
  console.log('[app] 交互模块：新推荐已入列 →', shop, '·', dish, '·', score + '分');
});

document.querySelector('#clear-mine').addEventListener('click', () => {
  saveMine([]);
  state.items = state.items.filter(it => !it.mine);
  renderFoods();
  console.log('[app] 已清除我的推荐，剩余', state.items.length, '条');
});

// 查看 / 收起全部
toggleAllBtn.addEventListener('click', () => {
  showAll = !showAll;
  renderFoods();
});

/* ===== 模块四：店家评分查询（搜不到 → 跳转我来推荐并预填） ===== */

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchResult = document.querySelector('#search-result');

const renderHit = (it) => {
  const hit = document.createElement('div');
  hit.className = 'search-hit';
  const head = document.createElement('div');
  head.className = 'd-flex align-items-center gap-2';
  const shop = document.createElement('span');
  shop.className = 'shop';
  shop.textContent = it.shop;
  if (it.mine) {
    const b = document.createElement('span');
    b.className = 'badge badge-mine';
    b.textContent = '我的推荐';
    head.appendChild(shop);
    head.appendChild(b);
  } else {
    head.appendChild(shop);
  }
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = [it.canteen + '食堂', it.floor, '推荐菜品：' + it.dish].filter(Boolean).join(' · ');
  const stars = document.createElement('div');
  stars.className = 'stars';
  stars.textContent = starsOf(it.score) + ' ' + it.score + '/5';
  hit.appendChild(head);
  hit.appendChild(meta);
  hit.appendChild(stars);
  return hit;
};

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  searchResult.innerHTML = '';
  if (q === '') {
    searchResult.appendChild(Object.assign(document.createElement('p'), {
      className: 'text-muted mb-0',
      textContent: '请先输入店家名字'
    }));
    return;
  }
  const matches = state.items.filter(it =>
    it.shop.includes(q) || (it.dish && it.dish.includes(q))
  );
  console.log('[app] 店家查询：「' + q + '」命中', matches.length, '条');
  if (matches.length === 0) {
    const tip = Object.assign(document.createElement('p'), {
      className: 'text-muted mb-2',
      textContent: `没有找到「${q}」的评分记录。`
    });
    const goAdd = document.createElement('button');
    goAdd.id = 'go-add';
    goAdd.className = 'btn btn-warning btn-sm';
    goAdd.textContent = '找不到店家？我来添加';
    goAdd.addEventListener('click', () => {
      document.querySelector('#shop').value = q;                 // 预填店家名
      document.querySelector('#recommend').scrollIntoView({ behavior: 'smooth' });
      document.querySelector('#shop').focus();
      setTip('店家名已帮你填好，补上菜品和评分就完成添加', true);
    });
    searchResult.appendChild(tip);
    searchResult.appendChild(goAdd);
    return;
  }
  matches.forEach(it => searchResult.appendChild(renderHit(it)));
});

/* ===== 导航滚动高亮（骨架自带） ===== */
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

/* ===== 启动 ===== */
initData().then(() => {
  renderFoods();
  onScroll();
  console.log('[app] 已接入模块：页面 ✓ 样式 ✓ 交互 ✓ 数据 ✓（可视化待接入，score 字段已就绪）');
  window.__foodApp = { state, renderFoods }; // 调试句柄：供空数据等用例实测
});

/* DRESS LAB: care room interface prototype.
   Icon category dock and illustrated tool shelf. Tool taps only mark preview state;
   no existing doll, hairstyle, makeup, wardrobe, or save data is modified. */
(() => {
  'use strict';

  const stage = document.querySelector('.center-stage');
  if (!stage || document.querySelector('.care-room-ui')) return;

  const categories = ['facial', 'hair', 'relax'];
  const definitions = {
    facial: {name: '페이셜', icon: 'face', catalog: '메이크업',
      initial: [['pump', '클렌저'], ['sponge', '클렌징 스펀지'], ['jar', '페이스 팩']],
      repeat: [['remover', '메이크업 리무버'], ['cotton', '코튼 패드'], ['serum', '기초 케어']]},
    hair: {name: '헤어', icon: 'hair', catalog: '헤어',
      initial: [['comb', '빗'], ['pump', '샴푸'], ['dryer', '드라이어']],
      repeat: [['spray', '스타일링 정리'], ['pump', '샴푸'], ['brush', '스타일링 브러시']]},
    relax: {name: '릴랙세이션', icon: 'leaf', catalog: null,
      initial: [['towel', '따뜻한 타월'], ['oil', '마사지 오일'], ['stones', '온열 스톤']],
      repeat: [['candle', '아로마'], ['oil', '마사지 오일'], ['towel', '타월']]}
  };

  // Lightweight inline SVG props stand in for future illustrated tool assets.
  const paths = {
    face: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.1M15 10h.1M8.5 15c2 1.8 5 1.8 7 0"/>',
    hair: '<path d="M5 14c-1-7 2-10 7-10s8 3 7 10M5 13c.2 4 1 6 4 8M19 13c-.2 4-1 6-4 8M5 12c4.2-.6 6-2.5 9-6 .8 3 2.5 5 5 6"/>',
    leaf: '<path d="M20 4C10 4 4 7.5 4 15a5 5 0 0 0 5 5c7.5 0 11-6 11-16ZM4 20c3.5-6 7.5-9.5 13-12"/>',
    pump: '<path d="M9 5V3h6v2M8 5h9M13 3h5v2M8 9h8M7 9h10v11H7zM10 13h4M12 12v5"/>',
    sponge: '<path d="M4.5 13c0-4.5 3.4-7 7.5-7s7.5 2.5 7.5 7-3 6-7.5 6-7.5-1.5-7.5-6Z"/><circle cx="9" cy="12" r=".7"/><circle cx="14.5" cy="14" r=".7"/><circle cx="12.7" cy="9.5" r=".7"/>',
    jar: '<path d="M5 8h14v12H5zM4 5.5h16V8H4zM9 13h6M10 16h4"/>',
    remover: '<path d="M10 4h4M11 4V2h2v2M9 7V5h6v2M7 10c0-1.6 1-3 2.5-3h5C16 7 17 8.4 17 10v10H7zM10 15l2-3 2 3c0 1.5-4 1.5-4 0Z"/>',
    cotton: '<circle cx="10" cy="12" r="6.5"/><circle cx="15.5" cy="14" r="5.3"/><path d="M8 10c1-1 2-1 3-.3"/>',
    serum: '<path d="M10 4h4M11 4V2h2v2M10 5h4v3l-1 2M9 10h6l2 10H7zM12 12c2 3 2 4 0 5-2-1-2-2 0-5Z"/>',
    comb: '<path d="M3 7h18v4H3zM5 11v8M8 11v8M11 11v8M14 11v8M17 11v8M20 11v8"/>',
    dryer: '<path d="M4 9h11a4 4 0 0 1 0 8H9l-2 4H5l2-6M4 9v6h4M15 10l4-2v10l-4-2M4 12h4"/>',
    spray: '<path d="M9 8h6M10 5h4v3M10 4h7l2 2M8 9h8l1 11H7zM20 7h2M20 10h2"/>',
    brush: '<path d="M5 9c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5ZM10 14l7 7M6 6l7 6M7 4l8 8"/>',
    towel: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M8 13h8M8 16h5"/>',
    oil: '<path d="M10 4V2h4v2M8 6h8v3H8zM7 9h10v11H7zM12 12c2.5 3 2.5 4.5 0 5.5-2.5-1-2.5-2.5 0-5.5Z"/>',
    stones: '<ellipse cx="12" cy="18" rx="9" ry="3"/><ellipse cx="12" cy="13" rx="7" ry="3"/><ellipse cx="12" cy="8" rx="5" ry="3"/>',
    candle: '<path d="M6 10h12v11H6zM6 14h12M12 10C9 7 12 6 12 3c3 3 3 5 0 7Z"/>',
    book: '<path d="M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1M12 6c3-2 6-2 10-1v14c-4-1-7-1-10 1M12 6v14"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>'
  };
  const icon = (name, className = '') =>
    '<svg class="' + className + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (paths[name] || paths.leaf) + '</svg>';

  // Phase progression is private, per-category, and only used to preview the two
  // different tool assortments. A tool must be selected once for the demo to count it.
  const emptyUsed = () => ({facial: [], hair: [], relax: []});
  const state = {
    category: 'facial',
    hasVisited: false,
    repeatUnlocked: {facial: false, hair: false, relax: false},
    initialUsed: emptyUsed(),
    repeatUsed: emptyUsed()
  };

  const root = document.createElement('section');
  root.className = 'care-room-ui';
  root.setAttribute('aria-label', '케어룸 인터페이스 시안');
  root.innerHTML = [
    '<div class="care-header">',
    '  <div class="care-category-tabs" role="tablist" aria-label="케어 카테고리">',
    categories.map(key =>
      '<button type="button" role="tab" id="care-tab-' + key +
      '" aria-controls="care-shelf" data-category="' + key + '" aria-selected="false">' +
        icon(definitions[key].icon, 'care-tab-symbol') +
        '<span>' + definitions[key].name + '</span></button>'
    ).join(''),
    '  </div>',
    '</div>',
    '<div class="care-shelf" id="care-shelf" role="tabpanel" aria-labelledby="care-tab-facial">',
    '  <div class="care-shelf-shadow" aria-hidden="true"></div>',
    '  <div class="care-shelf-board" aria-hidden="true"></div>',
    '  <div class="care-tools" data-care-tools role="group" aria-label="케어 도구 시연"></div>',
    '  <button type="button" class="care-catalog-trigger" data-care-catalog hidden aria-label="스타일 카탈로그 열기" title="스타일 카탈로그 열기">' +
       icon('book') + '</button>',
    '  <div class="care-shelf-front" aria-hidden="true"></div>',
    '  <span class="care-visually-hidden" data-care-status aria-live="polite"></span>',
    '</div>'
  ].join('');
  stage.append(root);

  const dialog = document.createElement('dialog');
  dialog.className = 'care-catalog-dialog';
  dialog.setAttribute('aria-label', '스타일 카탈로그 미리보기');
  dialog.innerHTML = [
    '<div class="care-catalog-head"><div><small>BEAUTY LOOKBOOK</small>',
    '<h2 data-catalog-title>카탈로그</h2></div>',
    '<button type="button" aria-label="카탈로그 닫기" data-catalog-close>' + icon('close') + '</button></div>',
    '<div class="care-catalog-grid" aria-label="카탈로그 이미지 자리">',
    '<div class="care-catalog-page" aria-label="첫 번째 스타일 이미지 미등록"></div>',
    '<div class="care-catalog-page" aria-label="두 번째 스타일 이미지 미등록"></div>',
    '</div>'
  ].join('');
  document.body.append(dialog);

  const tabs = [...root.querySelectorAll('[data-category]')];
  const tools = root.querySelector('[data-care-tools]');
  const shelf = root.querySelector('#care-shelf');
  const catalog = root.querySelector('[data-care-catalog]');
  const status = root.querySelector('[data-care-status]');

  const getPhase = category => state.repeatUnlocked[category] ? 'repeat' : 'initial';
  const getUsed = (category, phase) =>
    phase === 'initial' ? state.initialUsed[category] : state.repeatUsed[category];

  function render() {
    const category = state.category;
    const phase = getPhase(category);
    const definition = definitions[category];
    const selected = getUsed(category, phase);
    const assortment = definition[phase];

    tabs.forEach(button => {
      const active = button.dataset.category === category;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    root.dataset.carePhase = phase;
    shelf.setAttribute('aria-labelledby', 'care-tab-' + category);
    shelf.setAttribute('aria-label',
      definition.name + ' · ' + (phase === 'initial' ? '첫 방문 상태 개선' : '재방문 케어'));

    tools.innerHTML = assortment.map(([kind, label], index) => {
      const used = selected.includes(index);
      return '<button type="button" class="care-tool' + (used ? ' is-used' : '') +
        '" data-care-tool="' + index + '" data-kind="' + kind +
        '" aria-pressed="' + String(used) + '" aria-label="' + label + ' · ' +
        (used ? '시연 선택됨' : '시연용 도구') + '">' +
        '<span class="care-tool-art">' + icon(kind) + '</span>' +
        '<span class="care-tool-base" aria-hidden="true"></span></button>';
    }).join('');
    catalog.hidden = !definition.catalog || selected.length !== assortment.length;
    if (!catalog.hidden) catalog.setAttribute('aria-label', definition.catalog + ' 카탈로그 열기');
    status.textContent = definition.name +
      (phase === 'initial' ? ' 첫 방문 관리' : ' 재방문 관리') +
      ' · 도구 ' + selected.length + '개 선택됨. ' +
      (selected.length === assortment.length ? '시연 완료.' : '실제 관리 기능은 아직 없다.');
  }

  function selectTool(index) {
    const category = state.category;
    const phase = getPhase(category);
    const selected = getUsed(category, phase);
    if (!Number.isInteger(index) || index < 0 || index >= definitions[category][phase].length) return;
    if (!selected.includes(index)) selected.push(index);
    render();
  }

  function resetPreview() {
    state.hasVisited = false;
    state.repeatUnlocked = {facial: false, hair: false, relax: false};
    state.initialUsed = emptyUsed();
    state.repeatUsed = emptyUsed();
    render();
  }

  function selectCategory(category, focusTab = false) {
    if (!definitions[category]) return;
    state.category = category;
    render();
    if (focusTab) root.querySelector('#care-tab-' + category)?.focus();
  }

  function showCatalog() {
    const category = state.category;
    const phase = getPhase(category);
    const definition = definitions[category];
    if (!definition.catalog || getUsed(category, phase).length !== definition[phase].length) return;
    dialog.querySelector('[data-catalog-title]').textContent = definition.catalog + ' 카탈로그';
    if (!dialog.open) dialog.showModal();
  }

  // The existing four-room navigation remains responsible for changing rooms.
  // Only the invisible prototype state is updated on a return to the care room.
  let previousRoom = document.body.dataset.room || '';
  function syncRoom() {
    const room = document.body.dataset.room || '';
    if (room === previousRoom) return;
    if (room === 'care') {
      if (state.hasVisited) {
        for (const category of categories) {
          if (state.initialUsed[category].length === definitions[category].initial.length) {
            state.repeatUnlocked[category] = true;
            state.repeatUsed[category] = [];
          }
        }
      }
      state.hasVisited = true;
      render();
    } else if (dialog.open) {
      dialog.close();
    }
    previousRoom = room;
  }

  root.addEventListener('click', event => {
    const tab = event.target.closest('[data-category]');
    if (tab) { selectCategory(tab.dataset.category); return; }
    const tool = event.target.closest('[data-care-tool]');
    if (tool) { selectTool(Number(tool.dataset.careTool)); return; }
    if (event.target.closest('[data-care-catalog]')) showCatalog();
  });
  root.querySelector('[role="tablist"]').addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const index = categories.indexOf(state.category);
    selectCategory(categories[(index + offset + categories.length) % categories.length], true);
    event.preventDefault();
  });
  dialog.querySelector('[data-catalog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  new MutationObserver(syncRoom).observe(document.body, {attributes: true, attributeFilter: ['data-room']});
  if (previousRoom === 'care') state.hasVisited = true;
  render();

  window.__dressCarePrototype = {
    get snapshot() {
      const counts = (phase) => Object.fromEntries(categories.map(category =>
        [category, getUsed(category, phase).length]));
      return {
        category: state.category,
        phase: getPhase(state.category),
        initialProgress: counts('initial'),
        repeatProgress: counts('repeat'),
        repeatUnlocked: {...state.repeatUnlocked}
      };
    },
    selectCategory,
    resetPreview
  };
})();

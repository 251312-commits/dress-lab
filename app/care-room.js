/* DRESS LAB care-room interface scaffold.
   No care effects, beauty changes, or persistent gameplay data are applied.
   The step/completion buttons are UI previews only. */
(() => {
  'use strict';

  const stage = document.querySelector('.center-stage');
  if (!stage || document.querySelector('.care-room-ui')) return;

  const categories = ['facial', 'hair', 'relax'];
  const definitions = {
    facial: {
      name: '페이셜', english: 'FACIAL CARE', catalog: '메이크업',
      initial: {
        title: '첫 방문 · 피부 상태 개선',
        description: '처음에는 피부를 관리하는 과정을 진행한다.',
        steps: ['상태 확인', '케어 도구 사용', '피부 관리 마무리']
      },
      repeat: {
        title: '재방문 · 메이크업 변경 준비',
        description: '현재 메이크업을 유지하다가, 케어를 시작하면 제거하는 흐름이다.',
        steps: ['현재 메이크업 확인', '메이크업 제거', '다음 스타일 준비']
      }
    },
    hair: {
      name: '헤어', english: 'HAIR CARE', catalog: '헤어',
      initial: {
        title: '첫 방문 · 모발 상태 개선',
        description: '처음에는 엉킴과 모발 상태를 관리하는 과정을 진행한다.',
        steps: ['상태 확인', '헤어 케어 도구 사용', '모발 관리 마무리']
      },
      repeat: {
        title: '재방문 · 헤어스타일 변경 준비',
        description: '기존 헤어스타일을 유지하다가, 케어를 시작하면 정리하는 흐름이다.',
        steps: ['현재 스타일 확인', '기존 세팅 정리', '다음 스타일 준비']
      }
    },
    relax: {
      name: '릴랙세이션', english: 'RELAXATION', catalog: null,
      initial: {
        title: '첫 방문 · 컨디션 관리',
        description: '처음 방문했을 때의 휴식과 관리 과정을 위한 자리다.',
        steps: ['컨디션 확인', '릴랙세이션 케어', '휴식 마무리']
      },
      repeat: {
        title: '재방문 · 자유로운 휴식',
        description: '외형 변경 없이도 언제든 다시 이용할 수 있는 관리다.',
        steps: ['케어 선택', '릴랙세이션 케어', '휴식 마무리']
      }
    }
  };

  // Prototype-only in-memory flags. Never mutate the existing doll/canvas.
  const state = {
    category: 'facial',
    hasVisited: false,
    repeatUnlocked: {facial: false, hair: false, relax: false},
    initialProgress: {facial: 0, hair: 0, relax: 0},
    repeatProgress: {facial: 0, hair: 0, relax: 0}
  };

  const root = document.createElement('section');
  root.className = 'care-room-ui';
  root.setAttribute('aria-label', '케어룸 UI 시안');
  root.innerHTML = [
    '<div class="care-header">',
    '  <div class="care-header-line"><span>CARE ROOM</span><span>INTERFACE PREVIEW</span></div>',
    '  <div class="care-category-tabs" role="tablist" aria-label="케어 카테고리">',
    categories.map(key =>
      '    <button type="button" role="tab" id="care-tab-' + key +
      '" aria-controls="care-panel" data-category="' + key +
      '" aria-selected="false">' + definitions[key].name + '</button>'
    ).join(''),
    '  </div>',
    '</div>',
    '<div class="care-panel" id="care-panel" role="tabpanel" tabindex="0">',
    '  <div class="care-panel-top"><span class="care-phase" data-care-phase></span>',
    '    <button type="button" class="care-reset" data-care-reset title="시연 상태만 초기화">시연 초기화</button></div>',
    '  <span class="care-english" data-care-english></span>',
    '  <h2 data-care-title></h2>',
    '  <p class="care-description" data-care-description></p>',
    '  <ol class="care-steps" data-care-steps aria-label="케어 과정 미리보기"></ol>',
    '  <div class="care-tool-title">TOOL SLOTS <span>이미지 미등록</span></div>',
    '  <div class="care-tool-slots" aria-label="케어 도구 이미지 자리">',
    '    <span><i>+</i>도구 01</span><span><i>+</i>도구 02</span><span><i>+</i>도구 03</span>',
    '  </div>',
    '  <div class="care-panel-actions">',
    '    <button type="button" class="care-step-button" data-care-next>단계 시연</button>',
    '    <button type="button" class="care-catalog-button" data-care-catalog hidden>카탈로그 보기</button>',
    '  </div>',
    '  <p class="care-hint" data-care-hint aria-live="polite"></p>',
    '  <p class="care-disclaimer">UI 시안 · 실제 케어 및 외모 변경 기능은 아직 없음</p>',
    '</div>'
  ].join('');
  stage.append(root);

  const dialog = document.createElement('dialog');
  dialog.className = 'care-catalog-dialog';
  dialog.setAttribute('aria-label', '스타일 카탈로그 미리보기');
  dialog.innerHTML = [
    '<div class="care-catalog-head"><div><small>BEAUTY LOOKBOOK · PREVIEW</small>',
    '<h2 data-catalog-title>카탈로그</h2></div>',
    '<button type="button" aria-label="카탈로그 닫기" data-catalog-close>×</button></div>',
    '<p>선택 카드와 썸네일이 들어갈 자리다. 현재 캐릭터의 메이크업과 헤어스타일은 변경되지 않는다.</p>',
    '<div class="care-catalog-grid">',
    '<div><span>IMAGE 01</span><strong>STYLE 01</strong><small>이미지 준비 중</small></div>',
    '<div><span>IMAGE 02</span><strong>STYLE 02</strong><small>이미지 준비 중</small></div>',
    '</div>'
  ].join('');
  document.body.append(dialog);

  const tabButtons = [...root.querySelectorAll('[data-category]')];
  const phaseLabel = root.querySelector('[data-care-phase]');
  const title = root.querySelector('[data-care-title]');
  const description = root.querySelector('[data-care-description]');
  const stepsList = root.querySelector('[data-care-steps]');
  const next = root.querySelector('[data-care-next]');
  const catalog = root.querySelector('[data-care-catalog]');
  const hint = root.querySelector('[data-care-hint]');
  const panel = root.querySelector('#care-panel');

  const getPhase = category => state.repeatUnlocked[category] ? 'repeat' : 'initial';
  const getProgress = (category, phase) =>
    phase === 'initial' ? state.initialProgress[category] : state.repeatProgress[category];
  const getTotal = (category, phase) => definitions[category][phase].steps.length;

  function render() {
    const category = state.category;
    const definition = definitions[category];
    const phase = getPhase(category);
    const plan = definition[phase];
    const progress = getProgress(category, phase);
    const finished = progress >= plan.steps.length;

    tabButtons.forEach(button => {
      const active = button.dataset.category === category;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'care-tab-' + category);
    root.dataset.carePhase = phase;
    phaseLabel.textContent = phase === 'initial' ? '01 · 상태 개선' : '02 · 재방문 케어';
    root.querySelector('[data-care-english]').textContent = definition.english;
    title.textContent = plan.title;
    description.textContent = plan.description;
    stepsList.innerHTML = plan.steps.map((step, i) =>
      '<li class="' + (i < progress ? 'is-done' : i === progress ? 'is-current' : '') +
      '"><span>' + String(i + 1).padStart(2, '0') + '</span>' + step + '</li>'
    ).join('');

    next.disabled = finished;
    next.textContent = finished ? '시연 완료' : '다음 단계 시연 · ' + (progress + 1) + '/' + plan.steps.length;
    catalog.hidden = !definition.catalog || !finished;
    if (definition.catalog) catalog.textContent = definition.catalog + ' 카탈로그 미리보기';

    hint.textContent = finished
      ? phase === 'initial'
        ? '첫 케어 시연 완료. 다른 방에 다녀오면 이 카테고리는 재방문 케어로 전환된다.'
        : '재방문 케어 시연 완료. 외형은 그대로 유지된다.'
      : phase === 'initial'
        ? '최초 1회 상태 개선 흐름을 시연하는 중이다.'
        : '외형은 유지된다. 아래 버튼은 실제 제거·스타일링을 실행하지 않는다.';
  }

  function advancePreview() {
    const category = state.category;
    const phase = getPhase(category);
    const progress = phase === 'initial' ? state.initialProgress : state.repeatProgress;
    const total = getTotal(category, phase);
    if (progress[category] < total) progress[category] += 1;
    render();
  }

  function resetPreview() {
    state.hasVisited = false;
    for (const category of categories) {
      state.repeatUnlocked[category] = false;
      state.initialProgress[category] = 0;
      state.repeatProgress[category] = 0;
    }
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
    if (!definitions[category].catalog || getProgress(category, getPhase(category)) < getTotal(category, getPhase(category))) return;
    dialog.querySelector('[data-catalog-title]').textContent = definitions[category].catalog + ' 카탈로그';
    if (!dialog.open) dialog.showModal();
  }

  // Existing navigation owns the current room; observe its data-room attribute.
  // No event handlers or state in the wardrobe/hair renderers are replaced.
  let previousRoom = document.body.dataset.room || '';
  function syncRoom() {
    const room = document.body.dataset.room || '';
    if (room === previousRoom) return;
    if (room === 'care') {
      if (state.hasVisited) {
        for (const category of categories) {
          if (state.initialProgress[category] >= getTotal(category, 'initial')) {
            state.repeatUnlocked[category] = true;
            state.repeatProgress[category] = 0;
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
    if (event.target.closest('[data-care-next]')) advancePreview();
    if (event.target.closest('[data-care-reset]')) resetPreview();
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
  if (previousRoom === 'care') {
    state.hasVisited = true;
  }
  render();

  // Diagnostic API only. Flags are preview state and are not gameplay/save data.
  window.__dressCarePrototype = {
    get snapshot() {
      return {
        category: state.category,
        phase: getPhase(state.category),
        initialProgress: {...state.initialProgress},
        repeatProgress: {...state.repeatProgress},
        repeatUnlocked: {...state.repeatUnlocked}
      };
    },
    selectCategory,
    resetPreview
  };
})();

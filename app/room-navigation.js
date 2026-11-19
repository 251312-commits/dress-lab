/* DRESS LAB: four-room UI prototype.
   Loads after the legacy engine; no wardrobe, drawing or save behavior is replaced. */
(() => {
  'use strict';
  const shell = document.querySelector('.app-shell');
  const stage = document.querySelector('.center-stage');
  const bed = stage?.querySelector('.canvas-bed');
  const doll = bed?.querySelector('#view');
  if (!shell || !stage || !bed || !doll || document.querySelector('.room-dock')) return;

  const icons = {
    reception: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/>',
    care: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 8l11 11M8 16L19 5M12 12l7-7"/>',
    mirror: '<rect x="6" y="3" width="12" height="17" rx="6"/><path d="M10 20h4M12 20v2M9 7l1-1M21 5v4M19 7h4"/>',
    wardrobe: '<path d="M12 6a2 2 0 1 1 2 2v2l7 6a2 2 0 0 1-1.3 3H4.3A2 2 0 0 1 3 16l7-6"/><path d="M10 10l2 1 2-1"/>'
  };
  const rooms = [
    {
      id:'reception', title:'접수실', en:'RECEPTION', subtitle:'처음 이야기가 시작되는 곳',
      description:'클라이언트 파일과 첫 만남은 이곳에 들어올 예정', tool:''
    },
    {
      id:'care', title:'케어룸', en:'CARE ROOM', subtitle:'정돈과 기본 관리를 하는 곳',
      description:'현재는 머리카락 조절을 먼저 사용할 수 있음', tool:'헤어 관리'
    },
    {
      id:'mirror', title:'마법 거울실', en:'MAGIC MIRROR', subtitle:'모습을 자유롭게 바꾸는 곳',
      description:'체형 · 피부톤 · 눈을 편집할 수 있음', tool:'외형 편집'
    },
    {
      id:'wardrobe', title:'드레스룸', en:'DRESS ROOM', subtitle:'오늘의 스타일을 완성하는 곳',
      description:'기존 옷장과 의상 색상 편집이 연결됨', tool:'옷장 열기'
    }
  ];
  const icon = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+icons[name]+'</svg>';

  // One continuous four-panel background moves left or right. The doll stays centered.
  const world = document.createElement('div');
  world.className = 'room-world';
  world.setAttribute('aria-hidden','true');
  world.innerHTML = '<div class="room-track">'+rooms.map(room =>
    '<div class="room-scene room-scene--'+room.id+'"><div class="scene-arch"></div><div class="scene-accent"></div><div class="scene-furniture"></div></div>'
  ).join('')+'</div>';
  bed.insertBefore(world,doll);
  const track = world.querySelector('.room-track');

  const location = document.createElement('div');
  location.className = 'room-location';
  location.setAttribute('aria-live','polite');
  location.innerHTML = '<small></small><strong></strong><span></span>';
  stage.prepend(location);
  const note = document.createElement('div');
  note.className = 'room-note';
  stage.append(note);

  const toggle = document.createElement('button');
  toggle.className = 'room-tools-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span></span>';
  stage.append(toggle);

  const nav = document.createElement('nav');
  nav.className = 'room-dock';
  nav.setAttribute('aria-label','샵 방 이동');
  nav.innerHTML = rooms.map((room,i) =>
    '<button type="button" data-room-index="'+i+'" aria-pressed="false" aria-label="'+room.title+'로 이동">'+
       icon(room.id)+'<span>'+room.title+'</span>'+
    '</button>'
  ).join('');
  shell.append(nav);

  const backdrop = document.createElement('div');
  backdrop.className = 'room-tools-backdrop';
  backdrop.setAttribute('aria-hidden','true');
  shell.append(backdrop);

  for (const sidebar of document.querySelectorAll('.workspace > .sidebar')) {
    const close = document.createElement('button');
    close.className = 'room-panel-close';
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label','편집 도구 닫기');
    close.addEventListener('click', closeTools);
    sidebar.prepend(close);
  }

  let activeIndex = 0;
  let open = false;
  const buttons = [...nav.querySelectorAll('button[data-room-index]')];
  const isMobile = () => window.matchMedia('(max-width:860px)').matches;

  function closeTools() {
    open = false;
    document.body.classList.remove('room-tools-open');
    toggle.setAttribute('aria-expanded','false');
  }
  function openTools() {
    if (rooms[activeIndex].id === 'reception' || !isMobile()) return;
    open = true;
    document.body.classList.add('room-tools-open');
    toggle.setAttribute('aria-expanded','true');
  }
  function goToRoom(index) {
    if (!Number.isInteger(index) || index < 0 || index >= rooms.length) return;
    activeIndex = index;
    const room = rooms[index];
    document.body.dataset.room = room.id;
    track.style.transform = 'translate3d('+(-index*25)+'%,0,0)';
    location.querySelector('small').textContent = 'SHOP  ·  '+String(index+1).padStart(2,'0')+' / 04';
    location.querySelector('strong').textContent = room.title;
    location.querySelector('span').textContent = room.subtitle;
    note.textContent = room.description;
    toggle.querySelector('span').textContent = room.tool;
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
    closeTools();

    // Reuse the existing edit tabs; no parallel editor state is introduced.
    if (room.id === 'care') document.getElementById('tab-hair')?.click();
    if (room.id === 'mirror') document.getElementById('tab-body')?.click();
  }

  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-room-index]');
    if (button) goToRoom(Number(button.dataset.roomIndex));
  });
  toggle.addEventListener('click', () => open ? closeTools() : openTools());
  backdrop.addEventListener('click', closeTools);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) closeTools();
  });
  window.addEventListener('resize', () => { if (!isMobile()) closeTools(); });
  goToRoom(0);

  // Small inspectable API for verifying navigation without touching legacy global state.
  window.__dressRooms = {
    get current() { return rooms[activeIndex].id; },
    goTo: goToRoom,
    get toolsOpen() { return open; }
  };
})();

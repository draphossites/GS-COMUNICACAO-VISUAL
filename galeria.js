const portfolio = document.querySelector('#trabalhos');
const track = portfolio.querySelector('#fotos-trabalhos');
const projects = [...track.querySelectorAll('.project')];
const playbackButton = portfolio.querySelector('[data-playback]');
const announcement = portfolio.querySelector('[data-status]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let playing = !reducedMotion.matches;
let visible = false;
let hovered = false;
let timer;

function schedulePlayback() {
  clearTimeout(timer);
  if (playing && visible && !hovered && !document.hidden) {
    timer = setTimeout(() => {
      move(1);
      schedulePlayback();
    }, 5000);
  }
}

function setPlayback(enabled) {
  playing = enabled;
  playbackButton.textContent = enabled ? 'Pausar' : 'Reproduzir';
  playbackButton.setAttribute('aria-label', enabled ? 'Pausar carrossel' : 'Reproduzir carrossel');
  schedulePlayback();
}

function move(direction, announce = false) {
  const maxScroll = track.scrollWidth - track.clientWidth;
  const positions = [...new Set(projects.map(project => Math.min(project.offsetLeft, maxScroll)))];
  const current = positions.reduce((closest, position, index) => {
    return Math.abs(track.scrollLeft - position) < Math.abs(track.scrollLeft - positions[closest]) ? index : closest;
  }, 0);
  const next = (current + direction + positions.length) % positions.length;
  track.scrollTo({ left: positions[next], behavior: reducedMotion.matches ? 'auto' : 'smooth' });

  if (announce) {
    announcement.textContent = projects[next].querySelector('h3').textContent;
  }
}

function navigate(direction) {
  setPlayback(false);
  move(direction, true);
}

portfolio.querySelector('[data-previous]').addEventListener('click', () => navigate(-1));
portfolio.querySelector('[data-next]').addEventListener('click', () => navigate(1));
playbackButton.addEventListener('click', () => setPlayback(!playing));

track.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') {
    hovered = true;
    schedulePlayback();
  }
});
track.addEventListener('pointerleave', () => {
  hovered = false;
  schedulePlayback();
});
track.addEventListener('pointerdown', () => setPlayback(false));
track.addEventListener('focusin', () => setPlayback(false));
track.addEventListener('keydown', event => {
  if (event.target === track && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    navigate(event.key === 'ArrowRight' ? 1 : -1);
  }
});

document.addEventListener('visibilitychange', schedulePlayback);
reducedMotion.addEventListener('change', event => {
  if (event.matches) setPlayback(false);
});

new IntersectionObserver(([entry]) => {
  visible = entry.intersectionRatio >= 0.25;
  schedulePlayback();
}, { threshold: 0.25 }).observe(track);

setPlayback(playing);
portfolio.querySelector('[data-controls]').hidden = false;

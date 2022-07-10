const $ = function(selector) {
  try {
    const nodes = document.querySelectorAll(selector);
    return nodes.length > 1 ? nodes : nodes[0];
  } catch (e) {
    return null;
  }
};

Node.prototype.$ = function(selector) {
  try {
    const nodes = this.querySelectorAll(selector);
    return nodes.length > 1 ? nodes : nodes[0];
  } catch (e) {
    return null;
  }
};

Node.prototype.hasClass = function(cls) {
  const classList = this.classList;
  for (let i in classList) {
    if (classList[i] == cls) {
      return true;
    }
  }
  return false;
}

Node.prototype.addClass = function(cls) {
  if (Array.isArray(cls)) {
    for (let i in cls) {
      if (this.hasClass(cls[i])) { return this; }
      this.classList.add(cls[i]);
    }
    return this;
  }
  this.classList.add(cls);
  return this;
}

Node.prototype.removeClass = function(cls) {
  if (Array.isArray(cls)) {
    for (let i in cls) {
      if (!this.hasClass(cls[i])) { return this; }
      this.classList.remove(cls[i]);
    }
    return this;
  }
  this.classList.remove(cls);
  return this;
}

Node.prototype.toggleClass = function(cls) {
  if (Array.isArray(cls)) {
    for (let i in cls) {
      this.classList.toggle(cls[i]);
    }
    return this;
  }
  this.classList.toggle(cls);
  return this;
}

Node.prototype.css = function(css) {
  this.style.cssText = css;
  return this;
}

Node.prototype.addCSS = function(css) {
  this.style.cssText += css;
  return this;
}

Node.prototype.getAttr = function(name) {
  this.getAttribute(name);
  return this;
}

Node.prototype.setAttr = function(name, value) {
  this.setAttribute(name, value);
  return this;
}

Node.prototype.removeAttr = function(name, value) {
  this.removeAttribute(name);
  return this;
}

Node.prototype.exec = function(callback) {
  callback.call(this, 0);
  return this;
}

NodeList.prototype.exec = function(callback) {
  for (let [index, elem] of this.entries()) {
    callback.call(elem, index);
  }
  return this;
}

const createElement = tag => document.createElement(tag);

const cookie = {
  set: function(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toGMTString();
    document.cookie = `${name}=${value};${expires};path=/`;
  },
  get: function(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  },
  del: function(name) {
    this.set(name, null, -1);
  }
}

const debounce = function(callback, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    const [that, args] = [this, arguments];
    timeout = setTimeout(function() {
      callback.apply(that, args);
      clearTimeout(timeout);
      timeout = null;
    }, delay);
  }
}

const throttle = function(callback, delay) {
  let timer;
  return function() {
    if (timer) { return; }
    const [that, args] = [this, arguments];
    timer = setTimeout(function() {
      clearTimeout(timer);
      timer = null;
      callback.apply(that, args);
    }, delay);
  }
}

/*----------------*/

window.requestAnimationFrame =
  webkitRequestAnimationFrame ||
  requestAnimationFrame;
const container = $('#container');
const outerContainer = $('#outer_container');
const play = $('#play');
const play_1 = $('#play_1');
const file = $("#file");
const upload = $("#upload");
const current = $('#current');
const total = $('#total');
const speed = $('#speed');
const speedRate = $('#speed_rate');
const changeSpeed = $('#change_speed');
const fullscreen = $('#fullscreen');
const progress = $('#progress');
const dialog = $('#dialog');

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

const video = createElement('video');

/*----------------*/

const closeDialog = debounce(() => {
  dialog.innerHTML = '';
  dialog.addClass('hidden');
}, 1.5 * 1000);

const showText = str => {
  dialog.innerHTML = str;
  dialog.removeClass('hidden');
  closeDialog();
}

const setIconSize = size => {
  container.style.setProperty('--padding', size + 'rem');
  container.style.setProperty('--font-size', size * 1.67 + 'rem');
}

let isPlaying = false;
const startedPlaying = () => {
  $('#container>*:not(#play, .dialog, #canvas)')
    .exec(function() { this.addClass('hidden') });
  play.addClass('playing');
  play_1.addClass('fa-pause');
  play_1.removeClass('fa-play');
  isPlaying = true;
}
const stoppedPlaying = () => {
  $('#container>*:not(#play, .dialog, #canvas)')
    .exec(function() { this.removeClass('hidden') });
  play.removeClass('playing');
  play_1.addClass('fa-play');
  play_1.removeClass('fa-pause');
  isPlaying = false;
}

const loadFile = event => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', async e => {
    const buffer = e.target.result;
    const blob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
    video.src = window.URL.createObjectURL(blob);
    await video.load();
  });
}

const drawFrame = () => {
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
}

const captureFrame = () => {
  if (!isPlaying) return;
  drawFrame();
  requestAnimationFrame(captureFrame);
}

const resize = () => {
  const cw = document.documentElement.clientWidth;
  const ch = document.documentElement.clientHeight;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const isLoaded = video.readyState !== 0;

  setIconSize(Math.max(Math.min(0.75, cw / ch)), 0.6);

  if (cw > ch) {
    const w = ch / (isLoaded ? (vh / vw) : (9 / 16));
    const h = ch;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`;
  } else {
    const w = cw * 0.95;
    const h = cw / (isLoaded ? (vw / vh) : (16 / 9)) * 0.95;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`;
  }

  if (isLoaded) {
    if (cw > ch && vw / vh > 16 / 9) {
      container.style.setProperty('--margin', `calc(var(--padding) + (${canvas.style.width} - ${ch / 9 * 16}px) / 2`);
    } else {
      container.style.setProperty('--margin', `var(--padding)`);
    }

    canvas.width = vw;
    canvas.height = vh;
    drawFrame();
  }
}

const updateTime = time => {
  if (video.readyState === 0) return;
  if (video.currentTime + time <= 0) {
    video.currentTime = 0;
  } else if (video.currentTime + time >= video.duration) {
    video.currentTime = video.duration
  } else {
    video.currentTime += time;
  };
  showText(`${time >= 0 ? `+${time}` : time}秒`);
}

const setSpeedRate = value => {
  if (video.readyState === 0) return;
  video.playbackRate = parseFloat(value);
}

const addSpeedRate = value => {
  speedRate.innerText = (speedRate.innerText * 10 + value * 10) / 10;
  if (speedRate.innerText < 0.25) speedRate.innerText = 0.25;
  if (speedRate.innerText > 2) speedRate.innerText = 2;
  setSpeedRate(speedRate.innerText);
}

/*----------------*/

window.addEventListener("load", resize);
window.addEventListener("resize", resize);
document.addEventListener("fullscreenchange", event => {
  if (document.fullscreenElement === null) {
    showText('已退出全屏模式');
  } else {
    showText('已进入全屏模式');
  }
});
progress.addEventListener('change', event => {
  if (progress.disabled === true) return;
  const past = video.currentTime;
  video.currentTime = progress.value / 100 * video.duration;
  const passed = (video.currentTime - past).toFixed(3);
  showText(`${passed >= 0 ? `+${passed}` : passed}秒`);
});
canvas.addEventListener('touchmove', event => {
  event.preventDefault();
});
video.addEventListener('loadstart', event => {
  stoppedPlaying();
  resize();
  progress.disabled = true;
  current.innerText = '-';
  total.innerText = '-';
});
video.addEventListener('loadeddata', event => {
  progress.disabled = false;
  const time = video.duration;
  const minute = Math.floor(time / 60).toString();
  const second = (time % 60).toFixed(3);
  current.innerText = '00:00';
  total.innerText = `${minute.padStart(2, '0')}:${second.padStart(6, '0')}`;
  video.currentTime = 0;
});
video.addEventListener("resize", resize);
video.addEventListener('play', event => {
  startedPlaying();
  captureFrame();
  progress.disabled = false;
});
video.addEventListener('timeupdate', event => {
  const time = video.currentTime;
  progress.value = Math.floor(100 * (time / video.duration));
  const minute = Math.floor(time / 60).toString();
  const second = (time % 60).toFixed(3);
  current.innerText = `${minute.padStart(2, '0')}:${second.padStart(6, '0')}`;
  drawFrame();
});
video.addEventListener('pause', event => {
  stoppedPlaying();
});
video.addEventListener('ended', event => {
  stoppedPlaying();
  progress.disabled = true;
});

/*----------------*/

play.addEventListener('click', async event => {
  if (video.readyState === 0) return;
  if (isPlaying) {
    return await video.pause();
  }
  return await video.play();
});
file.addEventListener('change', loadFile);
speed.addEventListener('click', event => {
  changeSpeed.toggleClass('hidden');
});
fullscreen.addEventListener('click', event => {
  if (document.fullscreenElement === null) {
    outerContainer.requestFullscreen()
      .catch(err => {
        showText('请求全屏失败');
      });
  } else {
    document.exitFullscreen();
  }
});

$('#backward_1').addEventListener('click', event => {
  updateTime(-1);
});
$('#backward').addEventListener('click', event => {
  updateTime(-0.1);
});
$('#forward').addEventListener('click', event => {
  updateTime(0.1);
});
$('#forward_1').addEventListener('click', event => {
  updateTime(1);
});

$('#sub_1').addEventListener('click', event => {
  addSpeedRate(-0.5);
});
$('#sub').addEventListener('click', event => {
  addSpeedRate(-0.1);
});
$('#add').addEventListener('click', event => {
  addSpeedRate(+0.1);
});
$('#add_1').addEventListener('click', event => {
  addSpeedRate(+0.5);
});
$('#reset').addEventListener('click', event => {
  speedRate.innerText = '1';
  setSpeedRate(1);
});
$('#close').addEventListener('click', event => {
  changeSpeed.addClass('hidden');
});
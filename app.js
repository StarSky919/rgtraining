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
      if (this.hasClass(cls[i])) { continue; }
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
      if (!this.hasClass(cls[i])) { continue; }
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

const getScrollTop = function() {
  return document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
}

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

const formatTime = time => {
  const minute = Math.floor(time / 60).toString();
  const second = (time % 60).toFixed(3);
  return `${minute.padStart(2, '0')}:${second.padStart(6, '0')}`
}

/*----------------*/

window.AudioContext =
  AudioContext ||
  webkitAudioContext ||
  mozAudioContext ||
  msAudioContext;
window.requestAnimationFrame =
  requestAnimationFrame ||
  webkitRequestAnimationFrame;
const message = $('#message');
const container = $('#container');
const outerContainer = $('#outer_container');
const play = $('#play');
const play_1 = $('#play_1');
const mute = $('#mute');
const mute_1 = $('#mute_1');
const videoFile = $("#video_file");
const upload = $("#upload");
const current = $('#current');
const total = $('#total');
const speed = $('#speed');
const speedRate = $('#speed_rate');
const changeSpeed = $('#change_speed');
const videoEnded = $('#video_ended');
const fullscreen = $('#fullscreen');
const fullscreen_1 = $('#fullscreen_1');
const looper = $('#looper');
const selectLoop = $('#select_loop');
const loopStart = $('#loop_start');
const loopEnd = $('#loop_end');
const progress = $('#progress');
const dialog = $('#dialog');

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

const video = createElement('video');

const audioContext = new window.AudioContext();
let audioBuffer;
let audioSource;

let isPlaying = false;
let isEnded = true;

const loop = {
  start: 0,
  end: 0
};

/*----------------*/

const hitsound = $('#hitsound');
const selectHitsound = $('#select_hitsound');
const clearHitsound = $('#clear_hitsound');
const speedStep = $('#speed_step_input');
const uiOffset = $('#ui_offset_input');

const speedStepMap = [0.01, 0.05, 0.1, 0.2];
const settings = {
  speedStep: 0.1,
  uiOffset: parseInt(cookie.get('ui_offset')) || uiOffset.value
}

/*----------------*/

const closeDialog = (() => {
  let timeout;
  return delay => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      dialog.innerText = '';
      dialog.addClass('hidden');
      clearTimeout(timeout);
      timeout = null;
    }, delay * 1000);
  }
})();

const showText = (str, delay = 1.5) => {
  dialog.innerText = str;
  dialog.removeClass('hidden');
  closeDialog(delay);
}

const setIconSize = size => {
  container.style.setProperty('--padding', size * 0.85 + 'em');
  container.style.setProperty('--font-size', size * 1.65 + 'rem');
}

const showUI = () => {
  const nodeList = $('#container:not(.setting_loop)>*:not(.always)');
  nodeList ? nodeList.exec(function() { this.removeClass('hidden') }) : false;
}

const hideUI = () => {
  const nodeList = $('#container:not(.setting_loop)>*:not(.always)');
  nodeList ? nodeList.exec(function() { this.addClass('hidden') }) : false;
}

const preparePlaying = () => {
  showUI();
  container.removeClass('playing');
  play_1.addClass('fa-play');
  play_1.removeClass('fa-pause');
  play_1.removeClass('fa-undo');
  isPlaying = false;
  isEnded = false;
}
const startedPlaying = () => {
  hideUI();
  container.addClass('playing');
  play_1.addClass('fa-pause');
  play_1.removeClass('fa-play');
  play_1.removeClass('fa-undo');
  isPlaying = true;
  isEnded = false;
}
const stoppedPlaying = () => {
  showUI();
  container.removeClass('playing');
  play_1.addClass('fa-play');
  play_1.removeClass('fa-pause');
  isPlaying = false;
}
const endedPlaying = () => {
  showUI();
  container.removeClass('playing');
  play_1.addClass('fa-undo');
  play_1.removeClass('fa-pause');
  isPlaying = false;
  isEnded = true;
}

const loadFile = event => {
  const file = event.target.files[0];
  if (!file.name.endsWith('.mp4')) {
    message.innerText = '目前只支持MP4格式的视频';
    return;
  }
  message.innerText = '当前文件：\n' + file.name;
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

const judgePos = (x, y) => {
  const sWidth = speed.offsetWidth;
  const sHeight = speed.offsetHeight;
  const sLeft = speed.offsetLeft;
  const sTop = speed.offsetTop;
  const cWidth = Math.min(outerContainer.offsetWidth, container.offsetWidth);
  const cHeight = Math.min(outerContainer.offsetHeight, container.offsetWidth);
  const cLeft = container.offsetLeft;
  const cTop = container.offsetTop;
  let left, top;
  if (x && y) {
    y = y + getScrollTop();
    left = x < cLeft ? 0 : (x + sWidth > cLeft + cWidth ? cWidth - sWidth : x - cLeft);
    top = y < cTop ? 0 : (y + sHeight > cTop + cHeight ? cHeight - sHeight : y - cTop);
    speed.removeClass('transformed');
  } else if (!speed.hasClass('transformed')) {
    left = sLeft - cLeft + sWidth > cWidth ? cWidth - sWidth : sLeft;
    top = sTop + sHeight > cHeight ? cHeight - sHeight : sTop;
  }
  typeof left === 'number' ? speed.style.left = left + 'px' : false;
  typeof top === 'number' ? speed.style.top = top + 'px' : false;
}

const resize = () => {
  const cw = document.documentElement.clientWidth;
  const ch = document.documentElement.clientHeight;
  const cAspectRatio = cw / ch;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const vAspectRatio = vw / vh;
  const isLoaded = video.readyState !== 0;

  setIconSize(Math.sqrt(cw / 1000));

  const situation_1 = (ratio = 1) => {
    const w = cw * ratio;
    const h = cw / (isLoaded ? (vw / vh) : (16 / 9)) * ratio;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`;
  }

  const situation_2 = () => {
    const w = ch / (isLoaded ? (vh / vw) : (9 / 16));
    const h = ch;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`;
  }

  if (cAspectRatio > 1) {
    if (vAspectRatio > cAspectRatio) {
      situation_1();
    } else {
      situation_2();
    }
  } else {
    situation_1(0.95);
  }

  if (isLoaded) {
    if (cw > ch && vAspectRatio > 16 / 9) {
      container.style.setProperty('--margin',
        `calc(var(--padding) + (${canvas.style.width} - ${ch / 9 * 16}px) / 2 * ${settings.uiOffset / 100}`);
    } else {
      container.style.setProperty('--margin', `var(--padding)`);
    }
    canvas.width = vw;
    canvas.height = vh;
    drawFrame();
  }

  judgePos();
}

const updateTime = (() => {
  let time = 0;
  let timeout;
  return value => {
    if (video.readyState === 0 || isEnded) return;
    time += value;
    current.innerText = `${formatTime(video.currentTime + time)}`;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      if (video.currentTime + time <= 0) {
        video.currentTime = 0;
      } else if (video.currentTime + time >= video.duration) {
        video.currentTime = video.duration
      } else {
        video.currentTime += time;
      }
      clearTimeout(timeout);
      time = 0;
      timeout = null;
    }, 0.5 * 1000);
  }
})();

const setSpeedRate = value => {
  if (video.readyState === 0) return;
  video.playbackRate = parseFloat(value);
}

const addSpeedRate = value => {
  speedRate.innerText = Math.floor(speedRate.innerText * 100 + value * 100) / 100;
  if (speedRate.innerText < 0.2) speedRate.innerText = 0.2;
  if (speedRate.innerText > 2) speedRate.innerText = 2;
  setSpeedRate(speedRate.innerText);
}

const setLoop = time => {
  if (video.readyState === 0) return;
  loopStart.innerText = formatTime(loop.start = Math.min(time, loop.end));
  loopEnd.innerText = formatTime(loop.end = Math.max(time, loop.end));
}

const resetLoop = () => {
  loop.start = loop.end = 0;
  loopStart.innerText = loopEnd.innerText = '00:00.000';
}

const stopSelectLoop = async () => {
  container.removeClass('setting_loop');
  selectLoop.addClass('hidden');
  isPlaying ? hideUI() : await video.play();
}

const toggleSelectLoop = () => {
  if (selectLoop.hasClass('hidden')) {
    container.addClass('setting_loop');
    selectLoop.removeClass('hidden');
  } else {
    stopSelectLoop();
  }
}

const decodeSound = arrayBuffer =>
  new Promise((resolve, reject) => {
    audioContext.decodeAudioData(arrayBuffer, buffer => {
      resolve(buffer);
    }, err => {
      alert('音频解码失败');
      reject();
    });
  });

const loadHitsound = event => {
  const file = event.target.files[0];
  if (!['mp3', 'ogg', 'wav'].includes(file.name.slice(-3))) {
    alert('只支持MP3、OGG和WAV格式的音频');
    return;
  }
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', async e => {
    audioBuffer = await decodeSound(e.target.result);
    selectHitsound.innerText = file.name.length >= 8 ? file.name.slice(0, 5) + '...' : file.name;
  });
}

const playHitsound = () => {
  if (!audioBuffer) return;
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.start(0);
}

/*----------------*/

hitsound.addEventListener('click', event => {
  hitsound.value = null;
});
hitsound.addEventListener('change', loadHitsound);
clearHitsound.addEventListener('click', event => {
  audioBuffer = audioSource = null;
  selectHitsound.innerText = '选择';
});

const setSpeedStep = value => {
  value = (isNaN(+value) || !value) ? 1 : +value;
  const step = speedStepMap[value];
  settings.speedStep = $('#speed_step').innerText = step;
  cookie.set('speed_step', speedStep.value = value);
}

const setOffset = value => {
  const offset = (isNaN(+value) || !value) ? 100 : +value;
  uiOffset.value = $('#ui_offset').innerText = offset;
  cookie.set('ui_offset', settings.uiOffset = offset);
}

speedStep.addEventListener('input', event => {
  setSpeedStep(speedStep.value);
});
speedStep.addEventListener('change', event => {});
uiOffset.addEventListener('input', event => {
  setOffset(uiOffset.value);
});
uiOffset.addEventListener('change', event => {
  resize();
});

/*----------------*/

window.addEventListener("load", resize);
window.addEventListener("resize", resize);
document.addEventListener("fullscreenchange", event => {
  if (document.fullscreenElement === null) {
    outerContainer.removeClass('fullscreen');
    fullscreen_1.addClass('fa-expand');
    fullscreen_1.removeClass('fa-compress');
  } else {
    outerContainer.addClass('fullscreen');
    fullscreen_1.addClass('fa-compress');
    fullscreen_1.removeClass('fa-expand');
  }
});
progress.addEventListener('input', event => {
  const past = video.currentTime;
  const passed = progress.value / 100 * video.duration - past;
  current.innerText = `${formatTime(past + passed)}`;
});
progress.addEventListener('change', event => {
  video.currentTime = progress.value / 100 * video.duration;
});
canvas.addEventListener('touchstart', playHitsound);
canvas.addEventListener('touchmove', event => {
  event.preventDefault();
});
video.addEventListener("resize", resize);
video.addEventListener('loadstart', event => {
  endedPlaying();
  resize();
  resetLoop();
  progress.disabled = true;
  current.innerText = '-';
  total.innerText = '-';
  videoEnded.addClass('hidden');
});
video.addEventListener('loadeddata', event => {
  progress.disabled = false;
  const time = video.duration;
  current.innerText = '00:00';
  total.innerText = formatTime(time);
  video.currentTime = 0;
  addSpeedRate(0);
  preparePlaying();
});
video.addEventListener('play', event => {
  startedPlaying();
  captureFrame();
  progress.disabled = false;
  videoEnded.addClass('hidden');
});
video.addEventListener('timeupdate', event => {
  if (loop.start + loop.end > 0 && !container.hasClass('setting_loop')) {
    if (video.currentTime > loop.end) {
      video.currentTime = loop.start;
    } else if (video.currentTime < loop.start) {
      video.currentTime = loop.end;
    }
  }
  progress.value = Math.floor(100 * (video.currentTime / video.duration));
  current.innerText = formatTime(video.currentTime);
  drawFrame();
});
video.addEventListener('pause', event => {
  stoppedPlaying();
});
video.addEventListener('ended', event => {
  endedPlaying();
  progress.disabled = true;
  videoEnded.removeClass('hidden');
});

/*----------------*/

play.addEventListener('click', async event => {
  if (video.readyState === 0) return;
  if (isPlaying) {
    return await video.pause();
  }
  return await video.play();
});
mute.addEventListener('click', event => {
  if (video.readyState === 0) return;
  if (video.volume < 1) {
    video.volume = 1;
    mute_1.addClass('fa-volume-up');
    mute_1.removeClass('fa-volume-mute');
  } else {
    video.volume = 0;
    mute_1.addClass('fa-volume-mute');
    mute_1.removeClass('fa-volume-up');
  }
});
videoFile.addEventListener('click', event => {
  videoFile.value = null;
});
videoFile.addEventListener('change', loadFile);

speed.addEventListener('click', event => {
  changeSpeed.toggleClass('hidden');
  stopSelectLoop();
});

let longClickTimer;
speed.addEventListener('touchstart', event => {
  longClickTimer = setTimeout(() => {
    speed.addClass('transformed');
    clearTimeout(longClickTimer);
    longClickTimer = null;
  }, 0.5 * 1000);
});
speed.addEventListener('touchend', event => {
  if (longClickTimer) clearTimeout(longClickTimer);
});
speed.addEventListener('touchmove', event => {
  event.preventDefault();
  clearTimeout(longClickTimer);
  longClickTimer = null;
  judgePos(event.touches[0].clientX, event.touches[0].clientY);
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

looper.addEventListener('click', event => {
  if (video.readyState === 0) return;
  toggleSelectLoop();
  changeSpeed.addClass('hidden');
});

$('#replay').addEventListener('click', async event => {
  await video.play();
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
  addSpeedRate(settings.speedStep * -1);
});
$('#add').addEventListener('click', event => {
  addSpeedRate(settings.speedStep * 1);
});
$('#add_1').addEventListener('click', event => {
  addSpeedRate(+0.5);
});

$('#speed_rate_reset').addEventListener('click', event => {
  speedRate.innerText = '1';
  setSpeedRate(1);
});
$('#speed_rate_close').addEventListener('click', event => {
  changeSpeed.addClass('hidden');
});

$('#loop_add').addEventListener('click', event => {
  setLoop(video.currentTime);
});
$('#loop_reset').addEventListener('click', event => {
  resetLoop();
});
$('#loop_close').addEventListener('click', event => {
  stopSelectLoop();
});

/*----------------*/

$('#help_ui_offset').addEventListener('click', event => {
  alert('视频宽高比超过16:9时，左右两侧边距占宽度超出16:9部分的百分比。');
});

/*----------------*/

setSpeedStep(cookie.get('speed_step'));
setOffset(cookie.get('ui_offset'));

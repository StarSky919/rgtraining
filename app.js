if (navigator.userAgent.indexOf('Quark') >= 0) {
  alert('请使用其他浏览器，夸克无法加载选择的视频');
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
const fullscreen = $('#fullscreen');
const fullscreen_1 = $('#fullscreen_1');
const looper = $('#looper');
const selectLoop = $('#select_loop');
const selectLoopBox = $('#select_loop_box');
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
const timeStep = $('#time_step_input');
const speedStep = $('#speed_step_input');
const uiOffset = $('#ui_offset_input');

const timeStepMap = [0.05, 0.1, 0.2, 0.5];
const speedStepMap = [0.01, 0.05, 0.1, 0.2];
const settings = {
  timeStep: 0.1,
  speedStep: 0.1,
  uiOffset: parseInt(cookie.get('ui_offset')) || uiOffset.value
}

/*----------------*/

const showMessage = msg => message.innerText = msg;

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

const drawFrame = () => {
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
}

const startCapture = () => {
  if (!isPlaying) return;
  drawFrame();
  requestAnimationFrame(startCapture);
}

const loadFile = event => {
  const file = event.target.files[0];
  if (!file.name.endsWith('.mp4')) {
    showMessage('目前只支持MP4格式的视频');
    return;
  }
  showMessage('当前文件：\n' + file.name);
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', async e => {
    const buffer = e.target.result;
    const blob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
    video.src = window.URL.createObjectURL(blob);
    await video.load();
  });
}

const judgePos = (x, y) => {
  const sWidth = speed.offsetWidth;
  const sHeight = speed.offsetHeight;
  const sLeft = speed.offsetLeft;
  const sTop = speed.offsetTop;
  const cWidth = container.offsetWidth;
  const cHeight = container.offsetHeight;
  const cLeft = container.offsetLeft;
  const cTop = container.offsetTop;
  const xOffset = sWidth / 2;
  const yOffset = sHeight / 2;
  let left, top;
  if (x && y) {
    y = y + getScrollTop();
    left = x - xOffset < cLeft ? 0 : (x + sWidth - xOffset > cLeft + cWidth ? cWidth - sWidth : x - cLeft - xOffset);
    top = y - yOffset < cTop ? 0 : (y + sHeight - yOffset > cTop + cHeight ? cHeight - sHeight : y - cTop - yOffset);
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
    situation_1(0.85);
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
  let timer;
  return () => {
    if (timer) return;
    timer = setTimeout(() => {
      video.currentTime = progress.value / 1000 * video.duration;
      clearTimeout(timer);
      timer = null;
    }, 0.2 * 1000);
  }
})();

const updateTimeStep = (() => {
  let time = 0;
  let timeout;
  return value => {
    if (video.readyState === 0 || isEnded) return;
    time += value;
    current.innerText = `${formatTime(video.currentTime + time)}`;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (video.currentTime + time <= 0) {
        video.currentTime = 0;
      } else if (video.currentTime + time >= video.duration) {
        video.currentTime = video.duration;
      } else {
        video.currentTime += time;
      }
      clearTimeout(timeout);
      time = 0;
      timeout = null;
    }, 0.4 * 1000);
  }
})();

const setSpeedRate = value => {
  if (video.readyState === 0) return;
  video.playbackRate = parseFloat(value);
}

const addSpeedRate = value => {
  speedRate.innerText = Math.round(speedRate.innerText * 100 + value * 100) / 100;
  if (speedRate.innerText < 0.2) speedRate.innerText = 0.2;
  if (speedRate.innerText > 2) speedRate.innerText = 2;
  setSpeedRate(speedRate.innerText);
}

const setLoop = time => {
  if (video.readyState === 0) return;
  const currentItem = $('#select_loop_box .selected');
  const otherItem = $('#select_loop_box *:not(.selected)');
  if (currentItem.id === 'loop_start') {
    currentItem.innerText = formatTime(loop.start = Math.min(time, loop.end));
    otherItem.innerText = formatTime(loop.end = Math.max(time, loop.end));
  } else {
    currentItem.innerText = formatTime(loop.end = Math.max(time, loop.start));
    otherItem.innerText = formatTime(loop.start = Math.min(time, loop.start));
  }
}

const resetLoop = () => {
  loop.start = loop.end = 0;
  loopStart.innerText = loopEnd.innerText = '00:00.000';
}

const stopSelectLoop = async () => {
  container.removeClass('setting_loop');
  selectLoop.addClass('hidden');
  isPlaying ? hideUI() : false;
}

const toggleSelectLoop = () => {
  if (selectLoop.hasClass('hidden')) {
    container.addClass('setting_loop');
    selectLoop.removeClass('hidden');
  } else {
    stopSelectLoop();
  }
}

const sound = {
  decode: arrayBuffer =>
    new Promise((resolve, reject) => {
      audioContext.decodeAudioData(arrayBuffer, buffer => {
        resolve(buffer);
      }, err => {
        alert('音频解码失败');
        reject();
      });
    }),
  load: event => {
    const file = event.target.files[0];
    if (!['mp3', 'ogg', 'wav'].includes(file.name.slice(-3))) {
      alert('只支持MP3、OGG和WAV格式的音频');
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', async e => {
      audioBuffer = await sound.decode(e.target.result);
      selectHitsound.innerText = file.name.length >= 8 ? file.name.slice(0, 5) + '...' : file.name;
    });
  },
  play: () => {
    if (!audioBuffer) return;
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start(0);
  }
}

/*----------------*/

hitsound.addEventListener('click', event => {
  hitsound.value = null;
});
hitsound.addEventListener('change', sound.load);
clearHitsound.addEventListener('click', event => {
  audioBuffer = audioSource = null;
  selectHitsound.innerText = '选择';
});

const setTimeStep = value => {
  value = (isNaN(+value) || !value) ? 1 : +value;
  const step = timeStepMap[value];
  settings.timeStep = $('#time_step').innerText = step;
  cookie.set('time_step', timeStep.value = value);
}

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

timeStep.addEventListener('input', event => {
  setTimeStep(timeStep.value);
});
speedStep.addEventListener('input', event => {
  setSpeedStep(speedStep.value);
});
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
  const passed = progress.value / 1000 * video.duration - past;
  current.innerText = `${formatTime(past + passed)}`;
  updateTime();
});
progress.addEventListener('change', event => {
  updateTime();
});

video.addEventListener("resize", resize);
video.addEventListener('loadstart', event => {
  stoppedPlaying();
  resize();
  resetLoop();
  progress.disabled = true;
  current.innerText = '-';
  total.innerText = '-';
});
video.addEventListener('loadeddata', event => {
  progress.disabled = false;
  const time = video.duration;
  current.innerText = '00:00';
  total.innerText = formatTime(time);
  video.currentTime = 0;
  addSpeedRate(0);
  preparePlaying();
  drawFrame();
});
video.addEventListener('play', event => {
  startedPlaying();
  startCapture();
  progress.disabled = false;
});
video.addEventListener('timeupdate', event => {
  if (loop.start + loop.end > 0 && !container.hasClass('setting_loop')) {
    const start = Math.min(loop.start, loop.end);
    const end = Math.max(loop.start, loop.end);
    if (video.currentTime > end) {
      video.currentTime = start;
    } else if (video.currentTime < start) {
      video.currentTime = end;
    }
  }
  if (isPlaying) progress.value = Math.floor(1000 * (video.currentTime / video.duration)) || 0;
  current.innerText = formatTime(video.currentTime);
  drawFrame();
});
video.addEventListener('pause', event => {
  stoppedPlaying();
});
video.addEventListener('ended', event => {
  endedPlaying();
  progress.disabled = true;
});

canvas.addEventListener('touchstart', event => {
  sound.play();
}, { passive: false });
canvas.addEventListener('touchend', event => {}, { passive: false });
canvas.addEventListener('touchmove', event => {
  event.preventDefault();
}, { passive: false });

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
  if (container.hasClass('setting_loop')) stopSelectLoop();
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
    outerContainer.requestFullscreen({ navigationUI: 'hide' })
      .catch(err => {
        showText('请求全屏失败');
      });
  } else {
    document.exitFullscreen();
  }
});

looper.addEventListener('click', event => {
  if (video.readyState === 0) return;
  changeSpeed.addClass('hidden');
  toggleSelectLoop();
});
selectLoopBox.addEventListener('click', event => {
  const currentItem = $('#select_loop_box .selected');
  if (currentItem.id === 'loop_start') {
    loopStart.removeClass('selected');
    loopEnd.addClass('selected');
  } else {
    loopEnd.removeClass('selected');
    loopStart.addClass('selected');
  }
});

/*----------------*/

$('#backward_1').addEventListener('click', event => {
  updateTimeStep(-1);
});
$('#backward').addEventListener('click', event => {
  updateTimeStep(settings.timeStep * -1);
});
$('#forward').addEventListener('click', event => {
  updateTimeStep(settings.timeStep * 1);
});
$('#forward_1').addEventListener('click', event => {
  updateTimeStep(1);
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

setTimeStep(cookie.get('time_step'));
setSpeedStep(cookie.get('speed_step'));
setOffset(cookie.get('ui_offset'));
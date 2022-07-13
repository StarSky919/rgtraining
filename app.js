cookie.remove('time_step');
cookie.remove('speed_step');
cookie.remove('ui_offset');

/*----------------*/

const { settings, SettingItem } = (() => {
  const settings = new Datastore('$');
  const toggle = class {
    id;
    container;
    textBox;
    help;
    text;
    input;
    button;
    options;

    constructor(options) {
      if (typeof options !== 'object') throw new Error('Options required');
      this.container = options.container;
      this.id = options.container.id;
      this.options = options;
      this.#init();
      const checked = !!settings.get(this.id);
      this.checked = checked;
    }

    #init() {
      const { text, buttonText, help, valueMap, checked } = this.options;
      this.container.addClass('setting_box');

      const input = createElement('input');
      input.type = 'checkbox';
      input.id = this.id + '_input';
      this.input = input;

      const textBox = createElement('span');
      if (typeof help === 'string') {
        const _help = createElement('i');
        _help.style.marginRight = '0.2em';
        _help.addClass('fas', 'fa-question-circle');
        _help.addEventListener('click', event => alert(help));
        this.help = _help;
        textBox.appendChild(_help);
      }
      const _text = createElement('span');
      _text.id = this.id + '_text';
      _text.innerText = text.replace('$1', checked ? valueMap[1] : valueMap[0]);
      this.text = _text;
      textBox.appendChild(_text);
      this.textBox = textBox;

      const button = createElement('label');
      button.addClass('button');
      button.setAttribute('for', this.input.id);
      button.id = this.id + '_button';
      button.innerText = isNullish(buttonText) ? (checked ? valueMap[1] : valueMap[0]) : buttonText;
      this.button = button;

      this.input.addEventListener('click', event => {
        this.text.innerText = text.replace('$1', this.checked ? valueMap[1] : valueMap[0]);
        this.button.innerText = isNullish(buttonText) ? (this.checked ? valueMap[1] : valueMap[0]) : buttonText;
        settings.set(this.id, +this.checked, { expires: Time.week });
      });
    }

    onClick(callback) {
      this.input.addEventListener('click', callback.bind(this));
      return this;
    }

    get checked() {
      return this.input.checked;
    }

    set checked(value) {
      const checked = typeof value === 'boolean' ? value : !!this.options.valueMap.lastIndexOf(value);
      this.input.checked = checked;
      this.input.dispatchEvent(new Event('click'));
    }

    render() {
      this.container.innerHTML = '';
      this.container.appendChild(this.textBox);
      this.container.appendChild(this.input);
      this.container.appendChild(this.button);
      return this;
    }
  }
  const range = class {
    id;
    container;
    textBox;
    help;
    text;
    input;
    options;

    constructor(options) {
      if (typeof options !== 'object') throw new Error('Options required');
      if (!isNullish(options.valueMap)) options.valueMap = Array.unique(options.valueMap);
      this.container = options.container;
      this.id = options.container.id;
      this.options = options;
      this.#init();
      const value = settings.get(this.id);
      this.value = isNullish(value) ? settings.set(this.id, this.value, { fallback: this.value, expires: Time.week }) : parseFloat(value);
      this.input.dispatchEvent(new Event('input'));
    }

    #init() {
      const options = this.options;
      this.container.addClass('setting_box');

      const input = createElement('input');
      input.addClass('range');
      input.type = 'range';
      input.id = this.id + '_input';
      if (isNullish(options.valueMap)) {
        const { min, max, step } = options;
        Object.assign(input, { min, max, step });
      } else {
        const { valueMap } = options;
        Object.assign(input, { min: 0, max: valueMap.length - 1 });
      }
      this.input = input;
      if (options.value) this.value = options.value;

      const textBox = createElement('span');
      if (typeof options.help === 'string') {
        const help = createElement('i');
        help.style.marginRight = '0.2em';
        help.addClass('fas', 'fa-question-circle');
        help.addEventListener('click', event => alert(options.help));
        this.help = help;
        textBox.appendChild(help);
      }
      const text = createElement('span');
      text.id = this.id + '_text';
      text.innerText = options.text.replace('$1', this.value);
      this.text = text;
      textBox.appendChild(text);
      this.textBox = textBox;
      this.input.addEventListener('input', event => this.text.innerText =
        this.options.text.replace('$1', settings.set(this.id, this.value)));
    }

    onInput(callback) {
      this.input.addEventListener('input', callback.bind(this));
      return this;
    }

    onChange(callback) {
      this.input.addEventListener('change', callback.bind(this));
      return this;
    }

    get value() {
      const { valueMap } = this.options;
      if (isNullish(valueMap)) {
        return this.input.value;
      }
      return valueMap[this.input.value];
    }

    set value(value) {
      const { valueMap } = this.options;
      if (isNullish(valueMap)) {
        this.input.value = isNullish(value) ? this.input.min : value;
        return;
      }
      this.input.value = valueMap.lastIndexOf(isNullish(value) ? 0 : value);
    }

    render() {
      this.container.innerHTML = '';
      this.container.appendChild(this.textBox);
      this.container.appendChild(this.input);
      return this;
    }
  }

  return {
    settings,
    SettingItem: {
      toggle,
      range
    }
  }
})();

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
const pStyle = getComputedStyle(play);
const play_1 = $('#play_1');
const uiLock = $('#ui_lock');
const uiLock_1 = $('#ui_lock_1');
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
const selectLoop = $('#select_loop');
const loopStart = $('#loop_start');
const loopEnd = $('#loop_end');
const bookmarkBox = $('#bookmark_box');
const bookmarkList = $('#bookmark_list');
const progress = $('#progress');
const dialog = $('#dialog');

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const video = $('#video');
if (!settings.get('play_mode')) container.removeChild(video);
const cover = $('#cover');

const audioContext = new window.AudioContext();
let audioBuffer;
let audioSource;

const loop = {
  start: 0,
  end: 0
};
const bookmarks = new Datastore('&');
let uiLocked = false;

/*----------------*/

const showMessage = msg => message.innerText = msg;

const closeDialog = (() => {
  let timeout;
  return delay => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      dialog.addClass('hidden');
      clearTimeout(timeout);
      timeout = null;
    }, delay * Time.second);
  }
})();

const showDialog = (str, delay = 2) => {
  dialog.innerText = str;
  dialog.removeClass('hidden');
  closeDialog(delay);
}

const setIconSize = size => {
  outerContainer.style.setProperty('--padding', size * 0.85 + 'em');
  outerContainer.style.setProperty('--font-size', size * 1.65 + 'rem');
}

const setMargin = value => {
  outerContainer.style.setProperty('--margin', value);
}

const showUI = () => {
  const nodeList = $('#outer_container:not(.setting_loop)>*:not(.always)');
  if (!isNullish(nodeList)) nodeList.exec(function() { this.removeClass('hidden') });
}

const hideUI = () => {
  const nodeList = $('#outer_container:not(.setting_loop)>*:not(.always)');
  if (!isNullish(nodeList) && !uiLocked) nodeList.exec(function() { this.addClass('hidden') });
}

const preparePlaying = () => {
  showUI();
  outerContainer.removeClass('playing');
  play_1.addClass('fa-play');
  play_1.removeClass('fa-pause');
  play_1.removeClass('fa-undo');
}
const startedPlaying = () => {
  hideUI();
  outerContainer.addClass('playing');
  play_1.addClass('fa-pause');
  play_1.removeClass('fa-play');
  play_1.removeClass('fa-undo');
}
const stoppedPlaying = () => {
  showUI();
  outerContainer.removeClass('playing');
  play_1.addClass('fa-play');
  play_1.removeClass('fa-pause');
}
const endedPlaying = () => {
  showUI();
  outerContainer.removeClass('playing');
  play_1.addClass('fa-undo');
  play_1.removeClass('fa-pause');
}

const drawFrame = () => {
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth, video.videoHeight);
}

const startCapture = () => {
  if (video.paused) return;
  if (!settings.get('play_mode')) drawFrame();
  requestAnimationFrame(startCapture);
}

const judgePos = (x, y) => {
  const { offsetWidth: cWidth, offsetHeight: cHeight } = outerContainer;
  const { offsetWidth: sWidth, offsetHeight: sHeight } = speed;
  const lrMargin = parseFloat(pStyle.getPropertyValue('left').replace('px', '')),
    tbMargin = parseFloat(pStyle.getPropertyValue('top').replace('px', ''));
  const uiWidth = cWidth - lrMargin * 2,
    uiHeight = cHeight - tbMargin * 2;
  let left, top;
  if (!isNullish(x) && !isNullish(y)) {
    const { offsetLeft: cLeft, offsetTop: cTop } = outerContainer;
    const [xOffset, yOffset] = [sWidth / 2, sHeight / 2];
    const [uiLeft, uiTop] = [cLeft + lrMargin, cTop + tbMargin];
    if (isNullish(document.fullscreenElement)) y = y + getScrollTop();
    left = x - xOffset < uiLeft ? lrMargin : x + xOffset > uiLeft + uiWidth ? lrMargin + uiWidth - sWidth : x - cLeft - xOffset;
    top = y - yOffset < uiTop ? tbMargin : y + yOffset > uiTop + uiHeight ? tbMargin + uiHeight - sHeight : y - cTop - yOffset;
    speed.removeClass('fixed');
  } else if (!speed.hasClass('fixed')) {
    const { offsetLeft: sLeft, offsetTop: sTop } = speed;
    left = sLeft < lrMargin ? lrMargin : sLeft + sWidth > lrMargin + uiWidth ? lrMargin + uiWidth : sLeft;
    top = sTop < tbMargin ? tbMargin : sTop + sHeight > tbMargin + uiHeight ? tbMargin + uiHeight : sTop;
  }
  if (!isNaN(left)) speed.style.left = left + 'px';
  if (!isNaN(top)) speed.style.top = top + 'px';
}

const resize = () => {
  const isLoaded = video.readyState !== 0;
  const cw = document.documentElement.clientWidth;
  const ch = document.documentElement.clientHeight;
  const cAspectRatio = cw / ch;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const vAspectRatio = isLoaded ? vw / vh : 16 / 9;
  const vAspectRatioReverse = isLoaded ? vh / vw : 9 / 16;
  let w, h;

  if (cAspectRatio > 1) {
    if (vAspectRatio > cAspectRatio) {
      w = cw;
      h = cw / vAspectRatio;
    } else {
      w = ch / vAspectRatioReverse;
      h = ch;
    }
  } else {
    w = $('main').offsetWidth;
    h = w / vAspectRatio;
  }

  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  container.style.width = canvas.style.width = `${w}px`
  container.style.height = canvas.style.height = `${h}px`;

  if (cw > ch && cAspectRatio > vAspectRatio) {
    setMargin(`calc(var(--padding) + (${outerContainer.offsetWidth}px - ${container.style.width}) / 2 * ${settings.get('ui_offset') / 100})`);
  } else {
    setMargin(`var(--padding)`);
  }

  if (isLoaded) {
    canvas.width = vw;
    canvas.height = vh;
    drawFrame();
  }

  judgePos();
  setIconSize(Math.sqrt(cw / 1000));
}

const updateTime = (() => {
  let timer;
  return () => {
    if (timer) return;
    timer = setTimeout(() => {
      video.currentTime = progress.value / 1000 * video.duration;
      clearTimeout(timer);
      timer = null;
    }, 0.4 * Time.second);
  }
})();

const updateTimeStep = (() => {
  let time = 0;
  let timeout;
  return value => {
    if (video.readyState === 0 || video.ended) return;
    time += value;
    current.innerText = `${Time.formatTimeFloat(video.currentTime + time)}`;
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
    }, 0.4 * Time.second);
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
    currentItem.innerText = Time.formatTimeFloat(loop.start = time);
  } else {
    currentItem.innerText = Time.formatTimeFloat(loop.end = time);
  }
}

const resetLoop = () => {
  loop.start = loop.end = 0;
  loopStart.innerText = loopEnd.innerText = '00:00.000';
}

const stopSelectLoop = () => {
  outerContainer.removeClass('selecting_loop');
  selectLoop.addClass('hidden');
}

const toggleSelectLoop = () => {
  if (outerContainer.hasClass('selecting_loop')) {
    stopSelectLoop();
  } else {
    outerContainer.addClass('selecting_loop');
    selectLoop.removeClass('hidden');
  }
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
    video.name = file.name;
    video.src = window.URL.createObjectURL(blob);
    await video.load();
  });
}

const loadBookmarks = () => {
  bookmarkList.innerHTML = '';
  if (video.readyState === 0) {
    const data = bookmarks.getAll();
    Object.entries(data).forEach(([key, value]) => {
      const bookmarkItem = createElement('div');
      bookmarkItem.addClass('time_item');

      const videoName = createElement('span');
      videoName.addClass('text');
      videoName.innerText = `(${value.value.length}) ${key}`;
      bookmarkItem.appendChild(videoName);

      const deleteItem = createElement('i');
      deleteItem.addClass('fas', 'fa-trash-alt');
      deleteItem.addEventListener('click', event => {
        bookmarks.remove(key);
        loadBookmarks();
      });
      bookmarkItem.appendChild(deleteItem);

      bookmarkList.appendChild(bookmarkItem);
    });
  } else {
    const data = bookmarks.get(video.name);
    if (isNullish(data)) return;
    data.sort((a, b) => a - b).forEach((time, index) => {
      const timeItem = createElement('div');
      timeItem.addClass('time_item');

      const timeTextBox = createElement('span');
      timeTextBox.addClass('time_text');
      const jumpToTime = createElement('i');
      jumpToTime.addClass('fas', 'fa-location-arrow');
      jumpToTime.addEventListener('click', async event => {
        video.currentTime = time;
        await video.play();
      });
      jumpToTime.style.marginRight = '0.2em';
      timeTextBox.appendChild(jumpToTime);
      const timeText = createElement('span');
      timeText.addClass('text');
      timeText.innerText = Time.formatTimeFloat(time);
      timeTextBox.appendChild(timeText);
      timeItem.appendChild(timeTextBox);

      const deleteTime = createElement('i');
      deleteTime.addClass('fas', 'fa-trash-alt');
      deleteTime.addEventListener('click', event => {
        const data = bookmarks.get(video.name);
        data.splice(index, 1);
        data.length === 0 ? bookmarks.remove(video.name) : bookmarks.set(video.name, data);
        bookmarkList.removeChild(timeItem);
        loadBookmarks();
      });
      timeItem.appendChild(deleteTime);

      bookmarkList.appendChild(timeItem);
    });
  }
}

/*----------------*/

const hitsound = $('#hitsound');
const selectHitsound = $('#select_hitsound');

const Hitsound = {
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
      audioBuffer = await Hitsound.decode(e.target.result);
      selectHitsound.innerText = file.name.length >= 8 ? file.name.slice(0, 5) + '...' : file.name;
    });
  },
  play: () => {
    if (!audioBuffer) return;
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start(0);
  },
  clear: () => {
    audioBuffer = audioSource = null;
    selectHitsound.innerText = '选择';
  }
}

hitsound.addEventListener('click', event => {
  hitsound.value = null;
});
hitsound.addEventListener('change', Hitsound.load);
$('#clear_hitsound').addEventListener('click', Hitsound.clear);

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
  current.innerText = `${Time.formatTimeFloat(past + passed)}`;
  updateTime();
});
progress.addEventListener('change', event => {
  video.currentTime = progress.value / 1000 * video.duration;
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
  total.innerText = Time.formatTimeFloat(time);
  loadBookmarks();
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
  if (loop.start + loop.end > 0 && !outerContainer.hasClass('selecting_loop')) {
    const start = Math.min(loop.start, loop.end);
    const end = Math.max(loop.start, loop.end);
    if (video.currentTime > end) {
      video.currentTime = start;
    } else if (video.currentTime < start) {
      video.currentTime = end;
    }
  }
  progress.value = Math.floor(1000 * (video.currentTime / video.duration)) || 0;
  current.innerText = Time.formatTimeFloat(video.currentTime);
  drawFrame();
});
video.addEventListener('pause', event => {
  stoppedPlaying();
});
video.addEventListener('ended', event => {
  endedPlaying();
  progress.disabled = true;
});

cover.addEventListener('touchstart', event => {
  Hitsound.play();
});
cover.addEventListener('touchmove', event => {
  event.preventDefault();
});
cover.addEventListener('click', event => {
  changeSpeed.addClass('hidden');
  stopSelectLoop();
  bookmarkBox.addClass('hidden');
});

/*----------------*/

play.addEventListener('click', async event => {
  if (video.readyState === 0) return;
  if (!video.paused) {
    return await video.pause();
  }
  return await video.play();
});
uiLock.addEventListener('click', async event => {
  if (uiLocked === true) {
    uiLocked = false;
    uiLock_1.addClass('fa-unlock');
    uiLock_1.removeClass('fa-lock');
    if (!video.paused) hideUI();
  } else {
    uiLocked = true;
    uiLock_1.addClass('fa-lock');
    uiLock_1.removeClass('fa-unlock');
  }
});
mute.addEventListener('click', event => {
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
  bookmarkBox.addClass('hidden');
  changeSpeed.toggleClass('hidden');
});

let longClickTimer;
let isLongClicked = false;
speed.addEventListener('touchstart', event => {
  isLongClicked = false;
  longClickTimer = setTimeout(() => {
    speed.addClass('fixed');
    clearTimeout(longClickTimer);
    longClickTimer = null;
    isLongClicked = true;
  }, 0.5 * Time.second);
});
speed.addEventListener('touchend', event => {
  if (longClickTimer) clearTimeout(longClickTimer);
});
speed.addEventListener('touchmove', event => {
  event.preventDefault();
  clearTimeout(longClickTimer);
  longClickTimer = null;
  if (!isLongClicked) judgePos(event.touches[0].clientX, event.touches[0].clientY);
});

fullscreen.addEventListener('click', event => {
  if (document.fullscreenElement === null) {
    outerContainer.requestFullscreen({ navigationUI: 'hide' })
      .catch(err => {
        showDialog('请求全屏失败');
      });
  } else {
    document.exitFullscreen();
  }
});

$('#looper').addEventListener('click', event => {
  if (video.readyState === 0) return;
  changeSpeed.addClass('hidden');
  bookmarkBox.addClass('hidden');
  toggleSelectLoop();
});
$('#select_loop_box').addEventListener('click', event => {
  const currentItem = $('#select_loop_box .selected');
  if (currentItem.id === 'loop_start') {
    loopStart.removeClass('selected');
    loopEnd.addClass('selected');
  } else {
    loopEnd.removeClass('selected');
    loopStart.addClass('selected');
  }
});

$('#bookmarker').addEventListener('click', event => {
  if (video.readyState === 0) return;
  let data = bookmarks.get(video.name);
  if (isNullish(data)) bookmarks.set(video.name, data = [], { expires: Time.week });
  if (data.length >= 10) return showDialog('最多添加10个书签');
  const time = video.currentTime;
  if (data.lastIndexOf(time) >= 0) return showDialog('不可重复添加同一时间');
  data.push(time);
  bookmarks.set(video.name, data);
  showDialog('书签添加成功\n' + Time.formatTimeFloat(time));
});
$('#close_bookmark_box').addEventListener('click', event => {
  bookmarkBox.addClass('hidden');
});
$('#show_bookmarks').addEventListener('click', event => {
  changeSpeed.addClass('hidden');
  stopSelectLoop();
  bookmarkBox.toggleClass('hidden');
  loadBookmarks();
});

/*----------------*/

$('#backward_2').addEventListener('click', event => {
  video.currentTime = 0;
});
$('#backward_1').addEventListener('click', event => {
  updateTimeStep(-1);
});
$('#backward').addEventListener('click', event => {
  updateTimeStep(settings.get('time_step') * -1);
});
$('#forward').addEventListener('click', event => {
  updateTimeStep(settings.get('time_step') * 1);
});
$('#forward_1').addEventListener('click', event => {
  updateTimeStep(1);
});

$('#sub_1').addEventListener('click', event => {
  addSpeedRate(-0.5);
});
$('#sub').addEventListener('click', event => {
  addSpeedRate(settings.get('speed_step') * -1);
});
$('#add').addEventListener('click', event => {
  addSpeedRate(settings.get('speed_step') * 1);
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

const time_step = new SettingItem.range({
  container: $('#time_step'),
  text: '时间调整步长：$1s',
  valueMap: [0.05, 0.1, 0.2, 0.5],
  value: 0.1
}).render();

const speed_step = new SettingItem.range({
  container: $('#speed_step'),
  text: '倍速调整步长：$1x',
  valueMap: [0.01, 0.05, 0.1, 0.2],
  value: 0.05
}).render();

const ui_offset = new SettingItem.range({
  container: $('#ui_offset'),
  text: 'UI边界偏移：$1%',
  help: '屏幕宽高比大于视频宽高比时，UI左右两侧边距占屏幕宽度超出视频宽度部分的百分比。',
  min: 0,
  max: 100,
  value: 100
}).render().onInput(event => {
  setMargin(`calc(var(--padding) + (${outerContainer.offsetWidth}px - ${container.style.width}) / 2 * ${settings.get('ui_offset') / 100})`);
  judgePos();
});

/*const show_touch = new SettingItem.toggle({
  container: $('#show_touch'),
  text: '显示触摸位置：',
  valueMap: ['关闭', '开启'],
  checked: false
}).render().onClick(async event => {});*/

const play_mode = new SettingItem.toggle({
  container: $('#play_mode'),
  text: '视频播放模式：$1',
  buttonText: '切换',
  help: 'Canvas：使用HTML5 <canvas>元素代理视频播放\nVideo：直接显示原视频画面',
  valueMap: ['Canvas', 'Video'],
  checked: false
}).render().onClick(async event => {
  if (play_mode.checked) {
    container.appendChild(video);
  } else {
    container.removeChild(video);
  }
});

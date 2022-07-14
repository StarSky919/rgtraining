cookie.remove('time_step');
cookie.remove('speed_step');
cookie.remove('ui_offset');

/**
 * ----------------
 * 获取DOM元素和定义常量
 * ----------------
 */

window.AudioContext =
  AudioContext ||
  webkitAudioContext ||
  mozAudioContext ||
  msAudioContext;
window.requestAnimationFrame =
  requestAnimationFrame ||
  webkitRequestAnimationFrame;

const body = $('body');

const outerMessage = $('#outer_message');
const outerContainer = $('#outer_container');
const container = $('#container');

const play_1 = $('#play_1');
const mute_1 = $('#mute_1');
const uiLock_1 = $('#ui_lock_1');
const current = $('#current');
const total = $('#total');
const videoFile = $('#video_file');
const selectLoop = $('#select_loop');
const loopStart = $('#loop_start');
const loopEnd = $('#loop_end');
const sidebarBox = $('#sidebar_box');
const bookmarkList = $('#bookmark_list');

const progress = $('#progress');
const fullscreen_1 = $('#fullscreen_1');

const speed = $('#speed');
const speedRate = $('#speed_rate');
const changeSpeed = $('#change_speed');

const message = $('#message');
const cover = $('#cover');
const canvas = $('#canvas');
const video = $('#video');

const ctx = canvas.getContext('2d');
const pStyle = getComputedStyle(play);
const loop = {
  start: 0,
  end: 0
};
const settings = new Datastore('$');
const bookmarks = new Datastore('&');

if (!settings.get('play_mode')) container.removeChild(video);

/**
 * ----------------
 * 定义功能性函数
 * ----------------
 */

class TouchPoint {
  id;
  x;
  y;
  element;
  removed = false;

  constructor(identifier, pageX, pageY) {
    this.id = identifier;
    this.element = createElement('i');
    cover.appendChild(this.element);
    this.setX(pageX);
    this.setY(pageY);
  }

  setX(x) {
    this.x = x;
    this.element.style.left = this.x - outerContainer.offsetLeft + 'px';
  }

  setY(y) {
    this.y = y;
    this.element.style.top = this.y - outerContainer.offsetTop + 'px';
  }

  remove() {
    this.removed = true;
    this.element.addClass('removed');
  }
}

const SettingItem = {
  toggle: class {
    id;
    container;
    textBox;
    help;
    text;
    input;
    button;
    options;
    #helpClickCallback;

    constructor(options) {
      if (typeof options !== 'object') throw new Error('Options required');
      if (isNullish(options.valueMap)) options.valueMap = ['关闭', '开启'];
      this.container = options.container;
      this.id = options.container.id;
      this.options = options
      this.#init();
      const checked = !!settings.get(this.id);
      this.checked = checked;
    }

    #init() {
      const { text, buttonText, help, valueMap, checked } = this.options;
      this.container.addClass('setting_item');

      const input = createElement('input');
      input.type = 'checkbox';
      input.id = this.id + '_input';
      this.input = input;

      const textBox = createElement('span');
      const _text = createElement('span');
      _text.id = this.id + '_text';
      _text.innerText = text.replace('$1', checked ? valueMap[1] : valueMap[0]);
      this.text = _text;
      textBox.appendChild(_text);
      this.textBox = textBox;
      if (typeof help === 'string') {
        const _help = createElement('i');
        _help.style.marginLeft = '0.25em';
        _help.addClass('fas', 'fa-question-circle');
        _help.addEventListener('click', event => this.#helpClickCallback ? this.#helpClickCallback(help) : showDialog(help));
        this.help = _help;
        textBox.appendChild(_help);
      }

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

    onClick(callback, init) {
      this.input.addEventListener('click', callback.bind(this));
      if (init) callback.call(this);
      return this;
    }

    onHelpClick(callback) {
      this.#helpClickCallback = callback.bind(this);
      return this;
    }

    get checked() {
      return this.input.checked;
    }

    set checked(value) {
      this.input.checked = value;
      this.input.dispatchEvent(new Event('click'));
    }

    render() {
      this.container.innerHTML = '';
      this.container.appendChild(this.textBox);
      this.container.appendChild(this.input);
      this.container.appendChild(this.button);
      return this;
    }
  },
  range: class {
    id;
    container;
    textBox;
    help;
    text;
    input;
    options;
    #helpClickCallback;

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
      this.container.addClass('setting_item');

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
      const text = createElement('span');
      text.id = this.id + '_text';
      text.innerText = options.text.replace('$1', this.value);
      this.text = text;
      textBox.appendChild(text);
      if (typeof options.help === 'string') {
        const help = createElement('i');
        help.style.marginLeft = '0.25em';
        help.addClass('fas', 'fa-question-circle');
        help.addEventListener('click', event => this.#helpClickCallback ? this.#helpClickCallback(options.help) : showDialog(options.help));
        this.help = help;
        textBox.appendChild(help);
      }
      this.textBox = textBox;
      this.input.addEventListener('input', event => this.text.innerText =
        this.options.text.replace('$1', settings.set(this.id, this.value)));
    }

    onInput(callback, init) {
      this.input.addEventListener('input', callback.bind(this));
      if (init) callback.call(this);
      return this;
    }

    onChange(callback, init) {
      this.input.addEventListener('change', callback.bind(this));
      if (init) callback.call(this);
      return this;
    }

    onHelpClick(callback) {
      this.#helpClickCallback = callback.bind(this);
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
}

const createLongClick =
  (element, interval, callback) => (() => {
    let longClickTimer;
    let isLongClicked = false;
    element.addEventListener('touchstart', event => {
      isLongClicked = false;
      longClickTimer = setTimeout(async () => {
        clearTimeout(longClickTimer);
        longClickTimer = null;
        isLongClicked = true;
        await callback.call(this);
      }, interval * Time.second);
    });
    element.addEventListener('touchmove', event => {
      clearTimeout(longClickTimer);
      longClickTimer = null;
    });
    element.addEventListener('touchend', event => {
      isLongClicked = false;
      if (longClickTimer) clearTimeout(longClickTimer);
    });
    return () => isLongClicked;
  })();

const showDialog = async (msg, title = '信息') => {
  const dialogs = $('body>.dialog');
  const dialogCount = isNullish(dialogs) ? 0 : dialogs.length;
  const cover = createElement('div');
  cover.addClass('box_cover', 'hidden');
  cover.style.zIndex = 9921 + dialogCount;
  const dialog = createElement('div');
  dialog.addClass('box_container', 'dialog');
  dialog.style.zIndex = 9922 + dialogCount;
  const tab = createElement('div');
  tab.addClass('tab');
  const _title = createElement('label'),
    close = createElement('label');
  _title.innerText = title;
  close.addClass('close_box', 'fas', 'fa-times');
  tab.appendChild(_title);
  tab.appendChild(close);
  dialog.appendChild(tab);
  const box = createElement('div');
  box.addClass('box', 'dialog');
  const message = createElement('p');
  message.innerText = msg;
  box.appendChild(message);
  dialog.appendChild(box);
  body.appendChild(cover);
  body.appendChild(dialog);
  const closeDialog = async () => {
    dialog.removeClass('display');
    cover.addClass('hidden');
    await timeout(0.3 * Time.second);
    body.removeChild(dialog);
    body.removeChild(cover);
  }
  cover.addEventListener('click', closeDialog);
  close.addEventListener('click', closeDialog);
  await timeout(0);
  cover.removeClass('hidden');
  dialog.addClass('display');
}

const closeMessage = (() => {
  let timeout;
  return delay => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      message.addClass('hidden');
      clearTimeout(timeout);
      timeout = null;
    }, delay * Time.second);
  }
})();

const showMessage = (msg, delay = 2) => {
  message.innerText = msg;
  message.removeClass('hidden');
  closeMessage(delay);
}

const setIconSize = size => {
  outerContainer.style.setProperty('--ui-spacing', size * 0.85 + 'em');
  outerContainer.style.setProperty('--font-size', size * 1.65 + 'rem');
}

const setMargin = value => {
  outerContainer.style.setProperty('--margin', value);
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
  container.style.width = canvas.style.width = video.style.width = `${w}px`
  container.style.height = canvas.style.height = video.style.height = `${h}px`;

  if (cw > ch && cAspectRatio > vAspectRatio) {
    setMargin(`calc(var(--ui-spacing) + (${outerContainer.offsetWidth}px - ${container.style.width}) / 2 * ${settings.get('ui_offset') / 100})`);
  } else {
    setMargin(`var(--ui-spacing)`);
  }

  if (isLoaded) {
    canvas.width = vw;
    canvas.height = vh;
    drawFrame();
  }

  judgePos();
  setIconSize(cw > ch ? Math.sqrt(cw / 1000) : Math.sqrt(cw / 1000));
}

let uiLocked = false;
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

const loadBookmarks = () => {
  bookmarkList.innerHTML = '<span>空空如也</span>';
  if (video.readyState === 0) {
    const data = bookmarks.getAll();
    if (isNullish(data)) return;
    bookmarkList.innerHTML = '';
    Object.entries(data).forEach(([key, value]) => {
      const bookmarkItem = createElement('div');
      bookmarkItem.addClass('list_item');

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
    bookmarkList.innerHTML = '';
    data.sort((a, b) => a - b).forEach((time, index) => {
      const timeItem = createElement('div');
      timeItem.addClass('list_item');

      const timeTextBox = createElement('span');
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

const updateTimeStep = (() => {
  let time = 0;
  let timeout;
  return value => {
    if (video.readyState === 0 || video.ended) return;
    if (video.currentTime + time > video.duration || video.currentTime + time < 0) return;
    time += value;
    showMessage(`${Time.formatTimeFloat(video.currentTime + time)}\n${time >= 0 ? `+${time.toFixed(3)}` : time.toFixed(3)}秒`, 1);
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

/**
 * ----------------
 * 定义播放器控件的功能
 * ----------------
 */

//顶部控制栏

$('#play').addEventListener('click', async event => {
  if (video.readyState === 0) return;
  if (!video.paused) {
    return await video.pause();
  }
  return await video.play();
});
$('#mute').addEventListener('click', event => {
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
$('#ui_lock').addEventListener('click', async event => {
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

videoFile.addEventListener('click', event => {
  videoFile.value = null;
});
videoFile.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!['mp4'].includes(file.name.slice(-3))) {
    showDialog('目前只支持MP4格式的视频');
    return;
  }
  outerMessage.innerText = '当前文件：\n' + file.name;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', async e => {
    const buffer = e.target.result;
    const blob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
    video.name = file.name;
    video.src = window.URL.createObjectURL(blob);
    await video.load();
  });
});

$('#looper').addEventListener('click', event => {
  if (video.readyState === 0) return;
  changeSpeed.addClass('hidden');
  sidebarBox.addClass('hidden');
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
$('#loop_add').addEventListener('click', event => {
  setLoop(video.currentTime);
});
$('#loop_reset').addEventListener('click', event => {
  resetLoop();
});
$('#loop_close').addEventListener('click', event => {
  stopSelectLoop();
});

$('#show_sidebar').addEventListener('click', event => {
  changeSpeed.addClass('hidden');
  stopSelectLoop();
  sidebarBox.toggleClass('hidden');
  loadBookmarks();
});
$('#close_sidebar_box').addEventListener('click', event => {
  sidebarBox.addClass('hidden');
});
$('#clear_all_bookmarks').addEventListener('click', event => {
  if (video.readyState === 0) {
    bookmarks.clear();
  } else {
    bookmarks.remove(video.name);
  };
  loadBookmarks();
});

//底部控制栏

$('#backward_2').addEventListener('click', event => {
  video.currentTime = 0;
});

$('#backward_1').addEventListener('click', event => {
  updateTimeStep(-1);
});
const _backward_1 = createLongClick($('#backward_1'), 0.35, async () => {
  while (_backward_1()) {
    updateTimeStep(-1);
    await timeout(20);
  }
});

$('#backward').addEventListener('click', event => {
  updateTimeStep(settings.get('time_step') * -1);
});
const _backward = createLongClick($('#backward'), 0.35, async () => {
  while (_backward) {
    updateTimeStep(settings.get('time_step') * -1);
    await timeout(20);
  }
});

let slidingProgress = false;
progress.addEventListener('input', event => {
  slidingProgress = true;
  const past = video.currentTime;
  const passed = progress.value / 1000 * video.duration - past;
  showMessage(`${Time.formatTimeFloat(past + passed)}\n${passed >= 0 ? `+${passed.toFixed(3)}` : passed.toFixed(3)}秒`, 1);
});
progress.addEventListener('change', event => {
  slidingProgress = false;
  video.currentTime = progress.value / 1000 * video.duration;
});

$('#forward').addEventListener('click', event => {
  updateTimeStep(settings.get('time_step') * 1);
});
const _forward = createLongClick($('#forward'), 0.35, async () => {
  while (_forward()) {
    updateTimeStep(settings.get('time_step') * 1);
    await timeout(20);
  }
});

$('#forward_1').addEventListener('click', event => {
  updateTimeStep(1);
});
const _forward_1 = createLongClick($('#forward_1'), 0.35, async () => {
  while (_forward_1()) {
    updateTimeStep(1);
    await timeout(20);
  }
});

$('#fullscreen').addEventListener('click', event => {
  if (document.fullscreenElement === null) {
    if (!outerContainer.requestFullscreen) showMessage('请求全屏失败');
    outerContainer.requestFullscreen({ navigationUI: 'hide' })
      .catch(err => {
        showMessage('请求全屏失败');
      });
  } else {
    document.exitFullscreen();
  }
});

//悬浮按钮

const _speed = createLongClick(speed, 0.5, () => {
  speed.addClass('fixed');
});
speed.addEventListener('click', event => {
  sidebarBox.addClass('hidden');
  changeSpeed.toggleClass('hidden');
});
speed.addEventListener('touchmove', event => {
  event.preventDefault();
  if (!_speed()) judgePos(event.touches[0].clientX, event.touches[0].clientY);
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

$('#bookmarker').addEventListener('click', event => {
  if (video.readyState === 0) return;
  let data = bookmarks.get(video.name);
  if (isNullish(data)) bookmarks.set(video.name, data = [], { expires: Time.week });
  if (data.length >= 10) return showMessage('最多添加10个书签');
  const time = video.currentTime;
  if (data.lastIndexOf(time) >= 0) return showMessage('不可重复添加同一时间');
  data.push(time);
  bookmarks.set(video.name, data);
  showMessage('书签添加成功\n' + Time.formatTimeFloat(time));
});

//视频遮罩层

cover.addEventListener('touchend', event => {
  changeSpeed.addClass('hidden');
  stopSelectLoop();
  sidebarBox.addClass('hidden');
});

/**
 * ----------------
 * 监听并处理各项事件
 * ----------------
 */

window.addEventListener('resize', resize);
window.addEventListener('load', resize);
document.addEventListener('readystatechange', event => {
  if (document.readyState === 'complete')
    body.removeClass('no_transition');
});
document.addEventListener('fullscreenchange', event => {
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

video.addEventListener('resize', resize);
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
video.addEventListener('pause', event => {
  stoppedPlaying();
});
video.addEventListener('ended', event => {
  endedPlaying();
  progress.disabled = true;
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
  if (!slidingProgress) progress.value = Math.floor(1000 * (video.currentTime / video.duration)) || 0;
  current.innerText = Time.formatTimeFloat(video.currentTime);
  drawFrame();
});

/**
 * ----------------
 * 定义和渲染设置项
 * ----------------
 */

const horizontal_mirror = new SettingItem.toggle({
  container: $('#horizontal_mirror'),
  text: '水平翻转',
  checked: false
}).render().onClick(async event => {
  if (horizontal_mirror.checked) {
    outerContainer.addClass('horizontal_mirrored');
  } else {
    outerContainer.removeClass('horizontal_mirrored');
  }
});

const vertical_mirror = new SettingItem.toggle({
  container: $('#vertical_mirror'),
  text: '垂直翻转',
  checked: false
}).render().onClick(async event => {
  if (vertical_mirror.checked) {
    outerContainer.addClass('vertical_mirrored');
  } else {
    outerContainer.removeClass('vertical_mirrored');
  }
});

const show_touch = new SettingItem.toggle({
  container: $('#show_touch'),
  text: '显示触点',
  checked: false
}).render();

const play_mode = new SettingItem.toggle({
  container: $('#play_mode'),
  text: '播放模式',
  valueMap: ['Canvas', 'Video'],
  checked: false
}).render().onClick(async event => {
  if (play_mode.checked) {
    container.appendChild(video);
  } else {
    container.removeChild(video);
  }
  if (!isNullish(document.fullscreenElement))
    document.exitFullscreen();
});

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
  help: '屏幕宽高比大于视频宽高比时，UI左右两侧边距占屏幕宽度超出视频宽度部分的百分比',
  min: 0,
  max: 100,
  value: 100
}).render().onInput(event => {
  setMargin(`calc(var(--ui-spacing) + (${outerContainer.offsetWidth}px - ${container.style.width}) / 2 * ${settings.get('ui_offset') / 100})`);
  judgePos();
});

const dark_mode = new SettingItem.toggle({
  container: $('#dark_mode'),
  text: '深色模式：',
  checked: false
}).render().onClick(async event => {
  !!settings.get('dark_mode') ?
    body.addClass('dark_mode') :
    body.removeClass('dark_mode');
}, true);

/**
 * ----------------
 * 触点显示功能
 * ----------------
 */

const touches = [];

const findIndex = id => {
  for (const i in touches) {
    if (touches[i].id === id) return i;
  }
  return -1;
}
const findTouch = id => {
  for (const touch of touches) {
    if (touch.id === id) return touch;
  }
  return null;
}
const clearTouch = debounce(() => {
  if (isNullish($('#cover i:not(.removed)')))
    cover.innerHTML = '';
}, 0.2 * Time.second);

const addTouch = event => {
  event.preventDefault();

  if (!settings.get('show_touch')) return;
  for (const touch of event.changedTouches) {
    touches.push(new TouchPoint(touch.identifier, touch.pageX, touch.pageY));
  }
}
const moveTouch = event => {
  event.preventDefault();

  for (const touch of event.changedTouches) {
    const _touch = findTouch(touch.identifier);
    if (isNullish(_touch) || _touch.removed) continue;
    _touch.setX(touch.pageX);
    _touch.setY(touch.pageY);
  }
}
const removeTouch = event => {
  event.preventDefault();

  for (const touch of event.changedTouches) {
    const _touch = findTouch(touch.identifier);
    if (isNullish(_touch) || _touch.removed) continue;
    touches.splice(findIndex(_touch.id), 1);
    _touch.remove();
  }
  clearTouch();
}

cover.addEventListener('touchstart', addTouch);
cover.addEventListener('touchmove', moveTouch);
cover.addEventListener('touchend', removeTouch);
cover.addEventListener('touchcancel', removeTouch);

/**
 * ----------------
 * 自定义打击音功能
 * ----------------
 */

const hitsound = $('#hitsound');
const selectHitsound = $('#select_hitsound');
const audioContext = new window.AudioContext();
let audioBuffer;
let audioSource;

const Hitsound = {
  decode: arrayBuffer =>
    new Promise((resolve, reject) => {
      audioContext.decodeAudioData(arrayBuffer, buffer => {
        resolve(buffer);
      }, err => {
        showDialog('音频解码失败');
        reject();
      });
    }),
  load: event => {
    const file = event.target.files[0];
    if (!['mp3', 'ogg', 'wav'].includes(file.name.slice(-3))) {
      showDialog('只支持MP3、OGG和WAV格式的音频');
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
    audioSource.stop();
    audioBuffer = audioSource = null;
    selectHitsound.innerText = '选择';
  }
}

hitsound.addEventListener('click', event => {
  hitsound.value = null;
});
hitsound.addEventListener('change', Hitsound.load);
$('#clear_hitsound').addEventListener('click', Hitsound.clear);
cover.addEventListener('touchstart', Hitsound.play);

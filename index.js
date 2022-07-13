Array.unique = arr => Array.from(new Set(arr));

const $ = function(selector) {
  try {
    const nodes = document.querySelectorAll(selector);
    return nodes.length > 1 ? nodes : nodes[0];
  } catch (e) {
    return null;
  }
}

Node.prototype.$ = function(selector) {
  try {
    const nodes = this.querySelectorAll(selector);
    return nodes.length > 1 ? nodes : nodes[0];
  } catch (e) {
    return null;
  }
}

Node.prototype.hasClass = function(cls) {
  const classList = this.classList;
  for (const i in classList) {
    if (classList[i] === cls) return true;
  }
  return false;
}

Node.prototype.addClass = function(...cls) {
  for (const i in cls) {
    if (this.hasClass(cls[i])) continue;
    this.classList.add(cls[i]);
  }
  return this;
}

Node.prototype.removeClass = function(...cls) {
  for (const i in cls) {
    this.classList.remove(cls[i]);
  }
  return this;
}

Node.prototype.toggleClass = function(...cls) {
  for (const i in cls) {
    this.classList.toggle(cls[i]);
  }
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

Node.prototype.removeAttr = function(name) {
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
  set: function(key, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toGMTString();
    document.cookie = `${key}=${value};${expires};path=/`;
  },
  get: function(cKey) {
    const key = cKey + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(key) == 0) {
        return c.substring(key.length, c.length);
      }
    }
    return '';
  },
  remove: function(key) {
    this.set(key, null, -1);
  },
  clear: function() {
    const multiple = document.cookie.split(";");
    for (let i = 0; i < multiple.length; i++) {
      const [key, value] = multiple[i].split("=");
      this.remove(key);
    }
  }
}

const Time = class Time {
  static millisecond = 1;
  static second = 1000;
  static minute = Time.second * 60;
  static hour = Time.minute * 60;
  static day = Time.hour * 24;
  static week = Time.day * 7;

  static template(template, timestamp) {
    const time = new Date(timestamp);
    return template
      .replace('yyyy', time.getFullYear().toString())
      .replace('yy', time.getFullYear().toString().slice(2))
      .replace('MM', p0(time.getMonth() + 1))
      .replace('dd', p0(time.getDate()))
      .replace('hh', p0(time.getHours()))
      .replace('mm', p0(time.getMinutes()))
      .replace('ss', p0(time.getSeconds()))
      .replace('SSS', p0(time.getMilliseconds(), 3));
  }

  static formatTimeFloat(time) {
    const minute = Math.floor(time / 60).toString();
    const second = (time % 60).toFixed(3);
    return `${minute.padStart(2, '0')}:${second.padStart(6, '0')}`
  }

  static formatTimeInterval(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time.day - Time.hour / 2) {
      return Math.round(ms / Time.day) + 'd';
    } else if (abs >= Time.hour - Time.minute / 2) {
      return Math.round(ms / Time.hour) + 'h';
    } else if (abs >= Time.minute - Time.second / 2) {
      return Math.round(ms / Time.minute) + 'm';
    } else if (abs >= Time.second) {
      return Math.round(ms / Time.second) + 's';
    }
    return ms + 'ms';
  }
}

const isNullish = value => value === void 0 || value === null;

const Datastore = class {
  #prefix;
  #storage = localStorage;

  constructor(prefix) {
    this.#prefix = prefix;
  }

  #realKey(key) {
    return `${key.startsWith(this.#prefix) ? '' : this.#prefix}${key}`;
  }

  #getData(realKey) {
    return JSON.parse(this.#storage.getItem(realKey));
  }

  set(key, value, { fallback, expires } = {}) {
    const realKey = this.#realKey(key);
    const old = this.#getData(realKey);
    const data = {
      value,
      time: Date.now()
    };
    if (fallback) data.fallback = fallback;
    if (expires) data.expires = expires;
    this.#storage.setItem(realKey,
      JSON.stringify(Object.assign(isNullish(old) ? {} : old, data)));
    return value;
  }

  get(key) {
    const realKey = this.#realKey(key);
    const { value, time, fallback, expires } = this.#getData(realKey) || {};
    if (expires && time + expires <= Date.now()) {
      this.#storage.removeItem(realKey);
      return null;
    }
    return isNullish(value) ? fallback : value;
  }

  getAll() {
    const s = this.#storage;
    const data = {};
    Array.from({ length: s.length }, (_, index) => s.key(index))
      .filter(key => key.startsWith(this.#prefix))
      .forEach(key => data[key.replace(this.#prefix, '')] = JSON.parse(s.getItem((key))));
    return data;
  }

  has(key) {
    const realKey = this.#realKey(key);
    return !!this.#storage.getItem(realKey);
  }

  remove(key) {
    const realKey = this.#realKey(key);
    this.#storage.removeItem(realKey);
  }

  reset() {
    const s = this.#storage;
    Array.from({ length: s.length }, (_, index) => s.key(index))
      .filter(key => key.startsWith(this.#prefix))
      .forEach(key => this.set(key, null));
  }

  clear() {
    const s = this.#storage;
    Array.from({ length: s.length }, (_, index) => s.key(index))
      .filter(key => key.startsWith(this.#prefix))
      .forEach(key => s.removeItem(key));
  }
}

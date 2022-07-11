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

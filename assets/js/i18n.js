(function(global, factory) {
  global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.I18n = factory();
}(this, function() {
  'use strict';

  function isNullish(obj) {
    return obj === void 0 || obj === null;
  }

  class I18n {
    constructor({
      fallback,
      languages = [],
      resources,
      autorender = false
    } = {}) {
      if (languages.length <= 0) throw 'Language list is needed';
      if (isNullish(resources)) throw 'Resources is needed';
      this.current = fallback || languages[0];
      document.body.setAttribute('s-lang', this.current);
      this.resources = resources;
      this.autorender = autorender;
      if (autorender === true) this.render();
    }

    static init(options) {
      return new I18n(options);
    }

    text(key) {
      const segments = key.split('.');
      let parent = this.resources[this.current];
      for (const segment of segments) {
        if (isNullish(parent)) return null;
        parent = parent[segment];
      }
      return isNullish(parent) ? null : parent;
    }

    change(lang) {
      this.current = lang;
      document.body.setAttribute('s-lang', this.current);
      if (this.autorender === true) this.render();
    }

    render() {
      const nodelist = document.querySelectorAll('[s-i18n]');
      for (const node of nodelist) {
        node.innerText = this.text(node.getAttribute('s-i18n'));
      }
    }
  }

  return I18n;
}));

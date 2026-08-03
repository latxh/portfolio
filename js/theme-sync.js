/**
 * Carries the light/dark choice across versions of the site.
 *
 * Every era stored the preference its own way. 2021 through 2023 used
 * localStorage "appearance" with system/light/dark; the current site uses
 * "theme" with light/dark, where absent means follow the OS. Rather than invent
 * a third key, "theme" is treated as the canonical one — so the live site needs
 * no changes and only the archived versions load this bridge.
 *
 * Injected by tools/build-archive.mjs into the <head> of any snapshot whose
 * version entry declares a themeKey, and deliberately NOT deferred: it has to
 * seed the era's key before that era's own script reads it, otherwise the page
 * paints in the wrong theme first.
 */
(function () {
  "use strict";

  var CANONICAL = "theme";

  var script = document.currentScript;
  var eraKey = script && script.getAttribute("data-theme-key");
  if (!eraKey || eraKey === CANONICAL) return;

  var store;
  try {
    store = window.localStorage;
    if (!store) return;
  } catch (error) {
    return; // storage blocked outright — the era's own fallback takes over
  }

  function read(key) {
    try {
      return store.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function write(key, value) {
    try {
      store.setItem(key, value);
    } catch (error) {
      // quota or privacy mode — nothing to do
    }
  }

  function isChoice(value) {
    return value === "light" || value === "dark";
  }

  var choice = read(CANONICAL);

  if (!isChoice(choice)) {
    // Nobody has set a theme on the modern site. If this era already had one
    // stored from a visit years ago, promote it so it carries forward instead
    // of being overwritten.
    var existing = read(eraKey);
    choice = isChoice(existing) ? existing : null;
    if (choice) write(CANONICAL, choice);
  }

  // "system" is what every era of this site called "follow the OS".
  write(eraKey, choice || "system");

  // Mirror the era's own toggle back to the canonical key. This patches the
  // prototype rather than the localStorage instance: Storage has a named
  // property setter, so assigning to localStorage.setItem would quietly store
  // an item called "setItem" instead of replacing the method.
  var Storage = window.Storage;
  if (!Storage || !Storage.prototype || Storage.prototype.__themeSynced) return;

  var native = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    native.call(this, key, value);
    if (this !== store || key !== eraKey) return;
    if (isChoice(value)) native.call(this, CANONICAL, value);
    else {
      try {
        store.removeItem(CANONICAL); // back to following the OS
      } catch (error) {
        // ignore
      }
    }
  };
  Storage.prototype.__themeSynced = true;
})();

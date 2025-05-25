var gbppd = (function () {
  let e = document.getElementById("viewport"),
    t = null,
    n = [],
    o = [],
    l = document.getElementsByClassName("overflow-scrolling"),
    r = l && l.length? l[0]?.scrollHeight : 0,
    i = 0,
    c = null,
    a = function (e, t) {
      for (let t of e)
        if (
          "childList" == t.type &&
          ((o = t.target.getElementsByTagName("img")), o)
        )
          for (let e of o) n.push(e.src);
    },
    u = function () {
      (i += Math.floor(751 * Math.random()) + 50),
        i < r ? l[0].scrollBy(0, 800) : clearInterval(c);
    };
  return {
    start: function () {
      (t = new MutationObserver(a)),
        t.observe(e, { attributes: !0, childList: !0, subtree: !0 }),
        (c = setInterval(u, Math.floor(Math.random() * (2200 - 1800 + 1)) + 1800));
    },
    finish: function () {
  let e = new Set(n);
  t && (t.disconnect(), (t = null));
  clearInterval(c);
  return Array.from(e);
},
  };
})();
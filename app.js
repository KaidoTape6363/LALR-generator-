/* LALR Slide Builder — app logic. Nothing is stored or uploaded; photos stay in this browser tab. */
(function () {
  "use strict";

  // ======== CONFIG — change these if your boundary map changes ========
  var CONFIG = {
    mapViewer: "https://www.google.com/maps/d/u/0/viewer?mid=1PLDXIuozWfO84wUw6BwTx2MsJPqHDQ8&ll=1.356698928536084%2C103.76900630597514&z=13",
    mapEmbed: "https://www.google.com/maps/d/embed?mid=1PLDXIuozWfO84wUw6BwTx2MsJPqHDQ8&ll=1.356698928536084%2C103.76900630597514&z=13",
    targetMin: 8,          // "Time exceeded" is measured against this
    maxSftl: 8,
    photoMaxPx: 1600,      // photos are downsized to keep the deck small
    acesMaxPx: 2200
  };

  var D = window.LALRDeck;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TYPE_INFO = {
    A: { title: "Justification", sub: "More than 8 min in 8 min boundary (SFTL, congestion, weather)", slides: 3 },
    B: { title: "Removal: within 8 min", sub: "Actual response (ACES activation + MVC) is 8 min or less", slides: 2 },
    C: { title: "Removal: case type", sub: "Fire Minor (Rubbish), Fire Investigation or Oil Spillage", slides: 2 },
    D: { title: "No justification", sub: "11 min, 15 min or out of boundary", slides: 1 }
  };

  function today() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function freshState() {
    return {
      type: "A", caseType: "Fire Investigation",
      incidentNo: "", dispDate: today(), dispTime: "", arrTime: "", enrouteTime: "",
      incidentType: "", location: "", appliance: "", boundary: "8 Min Boundary", station: "BBFS",
      comd: "", pumpOp: "", targetMin: CONFIG.targetMin,
      sftls: [], congestion: 0, congestionRemark: "",
      weather: { yn: "N", remark: "" }, deviation: { yn: "N", remark: "" },
      mvcStart: "", mvcArrive: "", remarks: "", remarksEdited: false,
      images: {}
    };
  }
  var S = freshState();
  var dirty = false;

  // ---------------- binding ----------------
  function getPath(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, p, v) {
    var ks = p.split("."), last = ks.pop();
    var t = ks.reduce(function (a, k) { return a[k]; }, o); t[last] = v;
  }
  function bindAll(root) {
    $$("[data-bind]", root).forEach(function (el) {
      var p = el.getAttribute("data-bind");
      var v = getPath(S, p); el.value = v == null ? "" : v;
      if (el._bound) return; el._bound = true;
      var ev = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, function () {
        var val = el.value;
        if (el.classList.contains("time")) val = formatTimeTyping(el);
        if (el.hasAttribute("data-num")) val = Math.max(0, parseInt(val || "0", 10) || 0);
        if (p === "remarks") S.remarksEdited = val.trim() !== "";
        setPath(S, p, val);
        dirty = true;
        onChange(p);
      });
      if (el.classList.contains("time")) el.addEventListener("blur", function () { validateTime(el); });
    });
  }
  function formatTimeTyping(el) {
    var raw = el.value;
    if (/^\d{1,2}:\d{0,2}(:\d{0,2})?$/.test(raw)) return raw; // user typing colons themselves
    var dg = raw.replace(/\D/g, "").slice(0, 6), out = dg;
    if (dg.length > 4) out = dg.slice(0, 2) + ":" + dg.slice(2, 4) + ":" + dg.slice(4);
    else if (dg.length > 2) out = dg.slice(0, 2) + ":" + dg.slice(2);
    if (out !== raw) { el.value = out; }
    return out;
  }
  function validateTime(el) {
    var v = el.value.trim();
    var m = v.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m && m[1].length === 1) { v = "0" + v; }
    if (m && !m[3]) v = v + ":00";
    var ok = !v || (/^\d{2}:\d{2}:\d{2}$/.test(v) && +v.slice(0, 2) < 24 && +v.slice(3, 5) < 60 && +v.slice(6) < 60);
    el.classList.toggle("bad", !ok);
    if (ok && v !== el.value) { el.value = v; setPath(S, el.getAttribute("data-bind"), v); onChange(el.getAttribute("data-bind")); }
  }

  // ---------------- data for the deck ----------------
  function deckData(withMap) {
    var zone = S.boundary === "OOB" ? "OOB" + (S.station ? " (" + S.station + ")" : "") : S.boundary + (S.station ? " (" + S.station + ")" : "");
    var d = JSON.parse(JSON.stringify({
      type: S.type, caseType: S.caseType, incidentNo: S.incidentNo, dispDate: S.dispDate, dispTime: S.dispTime, arrTime: S.arrTime,
      enrouteTime: S.enrouteTime, incidentType: S.incidentType, location: S.location, appliance: (S.appliance || "").toUpperCase(),
      zone: zone, comd: S.comd, pumpOp: S.pumpOp, targetMin: S.targetMin, congestion: S.congestion, congestionRemark: S.congestionRemark,
      weather: S.weather, deviation: S.deviation, mvcStart: S.mvcStart, mvcArrive: S.mvcArrive,
      remarks: S.remarksEdited ? S.remarks : "", mapLink: CONFIG.mapViewer
    }));
    var im = S.images;
    d.sftls = S.sftls.map(function (s, i) {
      return { road: s.road, redTime: s.redTime, greenTime: s.greenTime, redImg: im["sftl" + i + "r"], greenImg: im["sftl" + i + "g"] };
    });
    d.images = { aces: im.aces, start: im.start, arrive: im.arrive };
    d.map = withMap ? Editor.exportData() : { img: null, markers: [] };
    return d;
  }

  // ---------------- report type tiles ----------------
  function renderTypes() {
    var box = $("#typeTiles"); box.innerHTML = "";
    Object.keys(TYPE_INFO).forEach(function (k) {
      var t = TYPE_INFO[k];
      var b = document.createElement("button");
      b.type = "button"; b.className = "type"; b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", S.type === k ? "true" : "false");
      var minis = ""; for (var i = 0; i < t.slides; i++) minis += '<i class="mini"></i>';
      b.innerHTML = "<b>" + t.title + "</b><span>" + t.sub + "</span><div class=\"minis\" title=\"" + t.slides + " slide" + (t.slides > 1 ? "s" : "") + "\">" + minis + "</div>";
      b.addEventListener("click", function () { S.type = k; dirty = true; renderTypes(); structureChanged(); });
      box.appendChild(b);
    });
    $("#caseTypeRow").hidden = S.type !== "C";
  }

  // ---------------- SFTL list ----------------
  function setSftlCount(n) {
    n = Math.max(0, Math.min(CONFIG.maxSftl, n));
    while (S.sftls.length < n) S.sftls.push({ road: "", redTime: "", greenTime: "" });
    while (S.sftls.length > n) {
      var i = S.sftls.length - 1;
      delete S.images["sftl" + i + "r"]; delete S.images["sftl" + i + "g"];
      S.sftls.pop();
    }
    Editor.trimSftl(n);
    structureChanged();
  }
  function renderSftlList() {
    $("#sftlCount").textContent = S.sftls.length;
    var box = $("#sftlList"); box.innerHTML = "";
    S.sftls.forEach(function (s, i) {
      var row = document.createElement("div"); row.className = "sftl-row";
      row.innerHTML = "<b>" + D.fmt.ord(i + 1) + " SFTL</b><input placeholder=\"Road name, e.g. Choa Chu Kang Ave 1\" data-bind=\"sftls." + i + ".road\" autocomplete=\"off\" aria-label=\"" + D.fmt.ord(i + 1) + " SFTL road\">";
      box.appendChild(row);
    });
    bindAll(box);
    $("#sftlHint").textContent = S.type === "A"
      ? "Each SFTL needs a red-light and green-light photo, and gets a marker on the map."
      : "Sets the SFTL markers on the map and the justification line.";
  }

  // ---------------- photo slots ----------------
  function slotDefs() {
    var t = S.type, groups = [];
    if (t === "A" || t === "B") {
      groups.push({ title: "ACES activation", slots: [
        { key: "aces", label: "ACES \u201cIncident Times\u201d", hint: "Photo of the printout row with Assign and Enroute times, cropped to the row if you can.", big: true }
      ] });
      groups.push({ title: "MVC footage", slots: [
        { key: "start", label: "Start of footage", hint: "Frame when the appliance moves off. Timestamp visible.", time: "mvcStart", timeLabel: "Footage start time" },
        { key: "arrive", label: "Arrived at location", hint: "Frame when the appliance stops at the incident.", time: "mvcArrive", timeLabel: "Arrived time" }
      ] });
    }
    if (t === "A") {
      S.sftls.forEach(function (s, i) {
        var o = D.fmt.ord(i + 1);
        groups.push({ title: o + " SFTL" + (s.road ? ", " + s.road : ""), slots: [
          { key: "sftl" + i + "r", label: "Red light", hint: "MVC frame stopped at the " + o + " SFTL.", time: "sftls." + i + ".redTime", timeLabel: "Red light time" },
          { key: "sftl" + i + "g", label: "Green light", hint: "MVC frame when the light turns green.", time: "sftls." + i + ".greenTime", timeLabel: "Green light time" }
        ] });
      });
    }
    if (t === "C") {
      groups.push({ title: "ACES incident record", slots: [
        { key: "aces", label: "ACES incident summary", hint: "Screenshot or photo showing the incident number, problem type and times.", big: true }
      ] });
    }
    return groups;
  }
  function renderSlots() {
    var box = $("#slots"); box.innerHTML = "";
    var groups = slotDefs();
    var lead = {
      A: "Add each photo and type the time shown on it. The deck works out durations and the actual response time.",
      B: "Add the ACES record and the two MVC frames, with the times shown on them.",
      C: "One photo is needed for slide 2.",
      D: "No photos needed for this report type. Only the map on slide 1."
    }[S.type];
    $("#photoLead").textContent = lead;
    groups.forEach(function (g) {
      var sec = document.createElement("div"); sec.className = "sgroup";
      sec.innerHTML = "<h3>" + esc(g.title) + "</h3><div class=\"pair\"></div>";
      var pair = $(".pair", sec);
      g.slots.forEach(function (sd) { pair.appendChild(slotEl(sd)); });
      box.appendChild(sec);
    });
    bindAll(box);
  }
  function slotEl(sd) {
    var img = S.images[sd.key];
    var el = document.createElement("div");
    el.className = "slot" + (img ? " filled" : "");
    el.innerHTML =
      "<div class=\"slot-head\"><i class=\"dot\"></i><div><b>" + esc(sd.label) + "</b><small>" + esc(sd.hint) + "</small></div></div>" +
      "<div class=\"thumb\">" + (img ? "<img alt=\"" + esc(sd.label) + "\">" : "<div class=\"ph\">Tap to add photo<br>or drop an image here</div>") + "</div>" +
      (sd.time ? "<label class=\"f\"><span>" + esc(sd.timeLabel) + "</span><input class=\"time\" data-bind=\"" + sd.time + "\" placeholder=\"hh:mm:ss\" inputmode=\"numeric\"></label>" : "") +
      "<div class=\"slot-actions\"><label class=\"btn ghost file\">" + (img ? "Replace" : "Add photo") + "<input type=\"file\" accept=\"image/*\"></label>" +
      (img ? "<button type=\"button\" class=\"ghost\" data-rm>Remove</button>" : "") + "</div>";
    if (img) $("img", el).src = "data:" + img.data;
    var input = $("input[type=file]", el);
    input.addEventListener("change", function () { if (input.files[0]) takeFile(sd, input.files[0]); });
    $(".thumb", el).addEventListener("click", function () { input.click(); });
    var rm = $("[data-rm]", el);
    if (rm) rm.addEventListener("click", function () { delete S.images[sd.key]; renderSlots(); updateStatus(); });
    ["dragenter", "dragover"].forEach(function (e) { el.addEventListener(e, function (ev) { ev.preventDefault(); el.classList.add("drag"); }); });
    ["dragleave", "drop"].forEach(function (e) { el.addEventListener(e, function (ev) { ev.preventDefault(); el.classList.remove("drag"); }); });
    el.addEventListener("drop", function (ev) { var f = ev.dataTransfer.files[0]; if (f) takeFile(sd, f); });
    return el;
  }
  function takeFile(sd, file) {
    if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|gif)$/i.test(file.name)) { toast("That file isn't an image."); return; }
    loadImage(file, sd.big ? CONFIG.acesMaxPx : CONFIG.photoMaxPx).then(function (r) {
      S.images[sd.key] = { data: r.data, w: r.w, h: r.h };
      dirty = true; renderSlots(); updateStatus();
    }).catch(function () { toast("Couldn't read that photo. Try a JPG or PNG."); });
  }
  function loadImage(file, maxPx) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        res({ data: cv.toDataURL("image/jpeg", 0.85).replace(/^data:/, ""), w: w, h: h, el: img });
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }

  // ---------------- computed displays ----------------
  function renderCalc() {
    var d = deckData(), c = D.compute(d);
    var chips = [
      ["Response time", D.fmt.long(c.response), "red"],
      ["Time exceeded", D.fmt.long(c.exceeded), "red"],
      ["Activation", c.activation == null ? "-" : D.fmt.long(c.activation) + (c.actLt1 ? "  (" + c.actLt1 + ")" : ""), ""]
    ];
    if (c.usesMvc) chips.push(["Actual response", D.fmt.long(c.actual), "green"]);
    $("#calcIncident").innerHTML = chips.map(function (x) { return "<div class=\"chip " + x[2] + "\">" + x[0] + "<b>" + esc(x[1]) + "</b></div>"; }).join("");

    // remarks
    var auto = D.autoRemark(d, c);
    var box = $("#remarksBox");
    if (!S.remarksEdited) { S.remarks = ""; box.placeholder = auto || "Optional remark"; if (document.activeElement !== box) box.value = ""; }
    $("#btnAutoRemark").hidden = !S.remarksEdited;
    var rem = S.remarksEdited ? S.remarks : auto;
    var t = "Activation Time: <u>" + D.fmt.short(c.activation) + "</u> (ACES)\n";
    if (c.usesMvc) {
      t += "Response Time: " + (d.mvcStart || "-") + " to " + (d.mvcArrive || "-") + " (MVC) = <u>" + D.fmt.short(c.mvc) + "</u>\n";
      t += "Actual Response Time: " + D.fmt.short(c.activation) + " (ACES) + " + D.fmt.short(c.mvc) + " (MVC) = <u>" + D.fmt.short(c.actual) + "</u>";
    } else {
      t += "Response Time: <u>" + D.fmt.short(c.response) + "</u>\nActual Response Time: -";
    }
    if (rem) t += "\n\nRemarks: " + esc(rem);
    $("#othersPreview").innerHTML = "<b>Preview of the Others / Remarks box</b>\n" + t;
  }

  function required() {
    var m = [], d = S;
    function need(v, label) { if (!v || String(v).trim() === "" || /^\d{8}\/$/.test(v)) m.push(label); }
    need(d.incidentNo, "ACES incident no.");
    need(d.dispTime, "Dispatched time"); need(d.arrTime, "Arrival time");
    need(d.enrouteTime, "Enroute time (for activation time)");
    need(d.appliance, "Appliance dispatched"); need(d.incidentType, "Incident type"); need(d.location, "Location");
    need(d.comd, "Vehicle commander"); need(d.pumpOp, "Pump operator");
    if (d.type === "A" || d.type === "B") { need(d.mvcStart, "MVC footage start time"); need(d.mvcArrive, "MVC arrived time"); }
    S.sftls.forEach(function (s, i) {
      need(s.road, D.fmt.ord(i + 1) + " SFTL road name");
      if (d.type === "A") { need(s.redTime, D.fmt.ord(i + 1) + " SFTL red light time"); need(s.greenTime, D.fmt.ord(i + 1) + " SFTL green light time"); }
    });
    if (!Editor.hasImage()) m.push("Map screenshot");
    var ph = [];
    slotDefs().forEach(function (g) { g.slots.forEach(function (sd) { if (!S.images[sd.key]) ph.push(g.title + ": " + sd.label); }); });
    return { fields: m, photos: ph };
  }
  function photoCounts() {
    var tot = 0, have = 0;
    slotDefs().forEach(function (g) { g.slots.forEach(function (sd) { tot++; if (S.images[sd.key]) have++; }); });
    return { tot: tot, have: have };
  }

  function renderSummary() {
    var t = S.type, n = S.sftls.length, rows = [["1", "Summary, map, justifications and legend"]];
    if (t === "A") {
      rows.push(["2", "Activation: ACES printout"]);
      var groups = 1 + n, pages = groups <= 4 ? 1 : Math.ceil(groups / 6);
      for (var p = 0; p < pages; p++) rows.push([String(3 + p), "Response: MVC start and arrival" + (n ? ", " + n + " SFTL photo pair" + (n > 1 ? "s" : "") : "") + (pages > 1 ? " (part " + (p + 1) + " of " + pages + ")" : "")]);
    } else if (t === "B") rows.push(["2", "Response: ACES activation and MVC start/arrival"]);
    else if (t === "C") rows.push(["2", "Response: ACES incident record"]);
    $("#deckSummary").innerHTML = rows.map(function (r) { return "<div class=\"srow\"><span class=\"n\">Slide " + r[0] + "</span>" + r[1] + "</div>"; }).join("") +
      "<div class=\"srow\" style=\"background:none;padding:2px 0\"><small>File name: <b>" + esc(D.fileName(deckData())) + "</b></small></div>";
    var r = required(), box = $("#missing");
    if (!r.fields.length && !r.photos.length) { box.className = "missing ok"; box.textContent = "Everything is filled in. Ready to download."; }
    else {
      box.className = "missing";
      box.innerHTML = "Still to do:<ul>" + r.fields.concat(r.photos).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    }
  }

  function updateStatus() {
    var pc = photoCounts(), r = required();
    var slides = S.type === "A" ? 2 + (1 + S.sftls.length <= 4 ? 1 : Math.ceil((1 + S.sftls.length) / 6)) : TYPE_INFO[S.type].slides;
    var left = r.fields.length + r.photos.length;
    $("#dockStatus").innerHTML = "<b>" + slides + " slide" + (slides > 1 ? "s" : "") + "</b>, " +
      (pc.tot ? pc.have + " of " + pc.tot + " photos" : "no photos needed") + "<br>" +
      (left ? left + " item" + (left > 1 ? "s" : "") + " left" : "Ready");
    renderSummary();
  }

  function onChange(path) {
    if (path === "dispDate") {
      var ymd = S.dispDate.replace(/-/g, "");
      if (!S.incidentNo || /^\d{8}\/?$/.test(S.incidentNo)) { S.incidentNo = ymd + "/"; $("[data-bind=incidentNo]").value = S.incidentNo; }
    }
    if (/^sftls\.\d+\.road$/.test(path)) { Editor.redraw(); if (S.type === "A") refreshGroupTitles(); }
    if (path === "boundary" || path === "station") Editor.suggestLabel();
    renderCalc(); updateStatus();
  }
  function refreshGroupTitles() {
    var gs = slotDefs(), hs = $$("#slots .sgroup > h3");
    gs.forEach(function (g, i) { if (hs[i]) hs[i].textContent = g.title; });
  }
  function structureChanged() {
    renderSftlList(); renderSlots(); Editor.updateSftlTool(); renderCalc(); updateStatus();
  }

  // ======================= MAP EDITOR =======================
  var Editor = (function () {
    var cv, cx, FW = 2100, FH = 684; // 200 px per inch of slide
    var img = null, view = { s: 1, x: 0, y: 0 };
    var strokes = [], markers = [], history = [];
    var tool = "pan", drag = null;
    var TL = new Image(); TL.src = "data:" + D.TL_PNG;
    var BOX_W = 296, BOX_H = 74, TL_W = 24, TL_H = 72;

    function init() {
      cv = $("#mapCanvas"); cx = cv.getContext("2d");
      TL.onload = redraw;
      cv.addEventListener("pointerdown", down);
      cv.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      cv.addEventListener("wheel", function (e) { if (!img) return; e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.08 : 0.93, pt(e)); }, { passive: false });
      $$("[data-tool]").forEach(function (b) { b.addEventListener("click", function () { setTool(b.getAttribute("data-tool")); }); });
      $$("[data-zoom]").forEach(function (b) { b.addEventListener("click", function () { zoomAt(+b.getAttribute("data-zoom"), { x: FW / 2, y: FH / 2 }); }); });
      $("#btnUndo").addEventListener("click", undo);
      $("#btnFull").addEventListener("click", toggleFull);
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); undo(); }
        if (e.key === "Escape" && $("#editor").classList.contains("full")) toggleFull();
      });
    }
    function toggleFull() {
      var ed = $("#editor"), on = !ed.classList.contains("full");
      ed.classList.toggle("full", on);
      $("#btnFull").textContent = on ? "Done" : "Full screen";
      document.body.style.overflow = on ? "hidden" : "";
      if (on && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {});
    }
    function setImage(image) {
      img = image; strokes = []; markers = []; history = [];
      var s = Math.max(FW / img.width, FH / img.height);
      view = { s: s, x: (FW - img.width * s) / 2, y: (FH - img.height * s) / 2 };
      $("#editor").hidden = false;
      suggestLabel(true);
      setTool("pan"); redraw(); updateSftlTool(); updateStatus();
      $("#editor").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function hasImage() { return !!img; }

    // image-space <-> frame-space
    function toF(p) { return { x: p.x * view.s + view.x, y: p.y * view.s + view.y }; }
    function toI(p) { return { x: (p.x - view.x) / view.s, y: (p.y - view.y) / view.s }; }
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * FW, y: (e.clientY - r.top) / r.height * FH }; }
    function snap() { history.push(JSON.stringify({ s: strokes, m: markers })); if (history.length > 60) history.shift(); }
    function undo() { if (!history.length) return; var h = JSON.parse(history.pop()); strokes = h.s; markers = h.m; redraw(); updateSftlTool(); }

    function zoomAt(f, c) {
      if (!img) return;
      var min = Math.min(FW / img.width, FH / img.height) * 0.5;
      var ns = Math.max(min, Math.min(view.s * f, 8));
      var ip = toI(c); view.s = ns; view.x = c.x - ip.x * ns; view.y = c.y - ip.y * ns; redraw();
    }

    var HINTS = {
      pan: "Drag to position the map inside the slide frame. Use + and − to zoom.",
      route: "Draw the route taken with your finger or mouse. Each drag is one line.",
      cong: "Draw over the stretch of road that was congested.",
      origin: "Tap where the appliance responded from.",
      incident: "Tap the incident location.",
      sftl: "Tap the junction of the next SFTL. Its label box is added beside it; use Adjust to move the box.",
      label: "Tap to place a zone label such as \u201cBBFS (8 Mins)\u201d.",
      select: "Drag a marker, an SFTL point or an SFTL label box to move it.",
      erase: "Tap a marker or a drawn line to remove it."
    };
    function setTool(t) {
      if (t === "sftl" && nextSftl() == null) { toast(S.sftls.length ? "All SFTLs are already on the map." : "Set the number of SFTLs in step 3 first."); return; }
      tool = t;
      $$("[data-tool]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tool") === t); });
      cv.classList.toggle("draw", t !== "pan" && t !== "select");
      $("#toolHint").textContent = HINTS[t] || "";
    }
    function nextSftl() {
      for (var i = 1; i <= S.sftls.length; i++) if (!markers.some(function (m) { return m.kind === "sftl" && m.n === i; })) return i;
      return null;
    }
    function updateSftlTool() {
      var b = $("#toolSftl"); if (!b) return;
      var n = nextSftl();
      $("span", b).textContent = S.sftls.length ? (n ? D.fmt.ord(n) + " SFTL" : "SFTLs placed") : "SFTL";
      b.disabled = !n;
      if (!n && tool === "sftl") setTool("select");
    }
    function trimSftl(n) { markers = markers.filter(function (m) { return m.kind !== "sftl" || m.n <= n; }); redraw(); }
    function currentLabelText() {
      var mins = { "8 Min Boundary": "8 Mins", "11 Min Boundary": "11 Mins", "15 Min Boundary": "15 Mins", "OOB": "OOB" }[S.boundary] || "";
      return (S.station || "Station") + "\n(" + mins + ")";
    }
    function suggestLabel() { /* labels are typed at placement, default from zone */ }

    // hit testing (frame coords)
    function sftlBox(m) { var p = toF({ x: m.lx, y: m.ly }); return { x: p.x, y: p.y, w: TL_W + BOX_W, h: BOX_H }; }
    function labelBox(m) {
      var lines = String(m.text).split("\n"), p = toF(m);
      var w = Math.max(144, Math.max.apply(null, lines.map(function (l) { return l.length; })) * 15 + 28), h = 32 * lines.length + 12;
      return { x: p.x - w / 2, y: p.y - h / 2, w: w, h: h };
    }
    function inBox(p, b) { return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
    function hit(p) {
      for (var i = markers.length - 1; i >= 0; i--) {
        var m = markers[i], f = toF(m);
        if (m.kind === "sftl") {
          if (Math.hypot(p.x - f.x, p.y - f.y) < 30) return { m: m, part: "pt" };
          if (inBox(p, sftlBox(m))) return { m: m, part: "box" };
        } else if (m.kind === "label") { if (inBox(p, labelBox(m))) return { m: m, part: "pt" }; }
        else if (Math.hypot(p.x - f.x, p.y - f.y) < 50) return { m: m, part: "pt" };
      }
      return null;
    }
    function hitStroke(p) {
      for (var i = strokes.length - 1; i >= 0; i--) {
        var pts = strokes[i].pts;
        for (var k = 0; k < pts.length; k++) { var f = toF(pts[k]); if (Math.hypot(p.x - f.x, p.y - f.y) < 22) return i; }
      }
      return -1;
    }

    function down(e) {
      if (!img) return;
      cv.setPointerCapture(e.pointerId);
      var p = pt(e), ip = toI(p);
      if (tool === "pan") { drag = { kind: "pan", sx: p.x, sy: p.y, vx: view.x, vy: view.y }; cv.style.cursor = "grabbing"; return; }
      if (tool === "route" || tool === "cong") { snap(); var st = { kind: tool, pts: [ip] }; strokes.push(st); drag = { kind: "draw", st: st }; redraw(); return; }
      if (tool === "incident" || tool === "origin") {
        snap(); markers = markers.filter(function (m) { return m.kind !== tool; });
        markers.push({ kind: tool, x: ip.x, y: ip.y }); redraw(); return;
      }
      if (tool === "sftl") {
        var n = nextSftl(); if (n == null) return;
        snap();
        // default label: up and to the right, flipped if it would leave the frame
        var bx = p.x + 40, by = p.y - 150;
        if (bx + TL_W + BOX_W > FW - 6) bx = p.x - 40 - TL_W - BOX_W;
        if (by < 6) by = p.y + 70;
        var li = toI({ x: bx, y: by });
        markers.push({ kind: "sftl", n: n, x: ip.x, y: ip.y, lx: li.x, ly: li.y });
        redraw(); updateSftlTool(); if (nextSftl() == null) setTool("select"); return;
      }
      if (tool === "label") {
        var txt = window.prompt("Label text (use | for a new line)", currentLabelText().replace("\n", " | "));
        if (!txt) return;
        snap(); markers.push({ kind: "label", x: ip.x, y: ip.y, text: txt.split("|").map(function (s) { return s.trim(); }).join("\n") }); redraw(); return;
      }
      if (tool === "select") {
        var h = hit(p);
        if (h) { snap(); drag = { kind: "mk", h: h, last: ip }; }
        return;
      }
      if (tool === "erase") {
        var hh = hit(p);
        if (hh) { snap(); markers.splice(markers.indexOf(hh.m), 1); redraw(); updateSftlTool(); return; }
        var si = hitStroke(p);
        if (si >= 0) { snap(); strokes.splice(si, 1); redraw(); }
      }
    }
    function move(e) {
      if (!drag) return;
      var p = pt(e);
      if (drag.kind === "pan") { view.x = drag.vx + (p.x - drag.sx); view.y = drag.vy + (p.y - drag.sy); redraw(); return; }
      var ip = toI(p);
      if (drag.kind === "draw") {
        var last = drag.st.pts[drag.st.pts.length - 1];
        if (Math.hypot((ip.x - last.x) * view.s, (ip.y - last.y) * view.s) > 4) { drag.st.pts.push(ip); redraw(); }
        return;
      }
      if (drag.kind === "mk") {
        var dx = ip.x - drag.last.x, dy = ip.y - drag.last.y, m = drag.h.m;
        if (m.kind === "sftl" && drag.h.part === "box") { m.lx += dx; m.ly += dy; }
        else { m.x += dx; m.y += dy; }
        drag.last = ip; redraw();
      }
    }
    function up() {
      if (drag && drag.kind === "draw" && drag.st.pts.length < 2) { strokes.pop(); history.pop(); }
      drag = null; if (cv) cv.style.cursor = "";
      redraw();
    }

    // ---- drawing ----
    function drawBase(ctx) {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, FW, FH);
      if (img) ctx.drawImage(img, view.x, view.y, img.width * view.s, img.height * view.s);
      strokes.forEach(function (st) {
        ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.strokeStyle = st.kind === "route" ? "#00B050" : "#FF0000"; ctx.lineWidth = st.kind === "route" ? 9 : 11;
        ctx.beginPath();
        st.pts.forEach(function (q, i) { var f = toF(q); if (i) ctx.lineTo(f.x, f.y); else ctx.moveTo(f.x, f.y); });
        ctx.stroke(); ctx.restore();
      });
    }
    function starPath(ctx, x, y, R, r, n) {
      ctx.beginPath();
      for (var i = 0; i < n * 2; i++) {
        var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R;
        ctx[i ? "lineTo" : "moveTo"](x + rr * Math.cos(a), y + rr * Math.sin(a));
      }
      ctx.closePath();
    }
    function drawMarkers(ctx) {
      markers.forEach(function (m) {
        var f = toF(m);
        if (m.kind === "incident") { starPath(ctx, f.x, f.y, 40, 17, 5); ctx.fillStyle = "#FF0000"; ctx.fill(); }
        else if (m.kind === "origin") { starPath(ctx, f.x, f.y, 46, 12, 4); ctx.fillStyle = "#FFFF00"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#000"; ctx.stroke(); }
        else if (m.kind === "label") {
          var b = labelBox(m); ctx.fillStyle = "#E36C09"; ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.fillStyle = "#000"; ctx.font = "26px Calibri, Carlito, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          String(m.text).split("\n").forEach(function (l, i, arr) { ctx.fillText(l, b.x + b.w / 2, b.y + b.h / 2 + (i - (arr.length - 1) / 2) * 32); });
        } else if (m.kind === "sftl") {
          var bx = sftlBox(m), road = (S.sftls[m.n - 1] || {}).road || "";
          if (TL.complete) ctx.drawImage(TL, bx.x, bx.y, TL_W, TL_H);
          var X = bx.x + TL_W;
          ctx.fillStyle = "#fff"; ctx.fillRect(X, bx.y, BOX_W, BOX_H); ctx.lineWidth = 2; ctx.strokeStyle = "#000"; ctx.strokeRect(X, bx.y, BOX_W, BOX_H);
          ctx.fillStyle = "#000"; ctx.font = "24px Calibri, Carlito, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(D.fmt.ord(m.n).toUpperCase() + " SFTL", X + BOX_W / 2, bx.y + 22);
          ctx.fillText(fitText(ctx, road.toUpperCase(), BOX_W - 10), X + BOX_W / 2, bx.y + 52);
          // arrow
          var px = f.x, py = f.y, sx, sy;
          if (py > bx.y + BOX_H) { sx = clamp(px, X + 30, X + BOX_W - 30); sy = bx.y + BOX_H; }
          else if (py < bx.y) { sx = clamp(px, X + 30, X + BOX_W - 30); sy = bx.y; }
          else { sx = px < X + BOX_W / 2 ? bx.x : X + BOX_W; sy = bx.y + BOX_H / 2; }
          arrowLine(ctx, sx, sy, px, py);
          if (tool === "select" || tool === "erase") { ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fillStyle = "rgba(179,38,30,.85)"; ctx.fill(); }
        }
      });
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function fitText(ctx, t, w) { if (ctx.measureText(t).width <= w) return t; while (t.length > 1 && ctx.measureText(t + "…").width > w) t = t.slice(0, -1); return t + "…"; }
    function arrowLine(ctx, x1, y1, x2, y2) {
      var L = Math.hypot(x2 - x1, y2 - y1); if (L < 16) return;
      var a = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = "#000"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - 12 * Math.cos(a), y2 - 12 * Math.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 18 * Math.cos(a - 0.4), y2 - 18 * Math.sin(a - 0.4)); ctx.lineTo(x2 - 18 * Math.cos(a + 0.4), y2 - 18 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill();
    }
    function redraw() {
      if (!cx) return;
      drawBase(cx); drawMarkers(cx);
    }

    function exportData() {
      if (!img) return { img: null, markers: [] };
      var c2 = document.createElement("canvas"); c2.width = FW; c2.height = FH;
      drawBase(c2.getContext("2d"));
      var out = markers.map(function (m) {
        var f = toF(m), o = { kind: m.kind, x: f.x / FW, y: f.y / FH };
        if (m.kind === "sftl") { var l = toF({ x: m.lx, y: m.ly }); o.n = m.n; o.lx = clamp(l.x, 0, FW - TL_W - BOX_W) / FW; o.ly = clamp(l.y, 0, FH - BOX_H) / FH; }
        if (m.kind === "label") o.text = m.text;
        return o;
      }).filter(function (o) { return o.x >= -0.02 && o.x <= 1.02 && o.y >= -0.02 && o.y <= 1.02; });
      return { img: { data: c2.toDataURL("image/jpeg", 0.88).replace(/^data:/, ""), w: FW, h: FH }, markers: out };
    }
    function reset() { img = null; strokes = []; markers = []; history = []; $("#editor").hidden = true; }

    return { init: init, setImage: setImage, hasImage: hasImage, exportData: exportData, redraw: redraw, trimSftl: trimSftl,
      updateSftlTool: updateSftlTool, suggestLabel: suggestLabel, reset: reset };
  })();

  // ---------------- map screenshot sources ----------------
  function initMap() {
    $("#lnkMap").href = CONFIG.mapViewer;
    $("#btnShowEmbed").addEventListener("click", function () {
      var w = $("#embedWrap"), f = $("#mapEmbed");
      if (!f.src) f.src = CONFIG.mapEmbed;
      w.hidden = !w.hidden;
      this.textContent = w.hidden ? "Show map on this page" : "Hide map";
    });
    $("#mapFile").addEventListener("change", function () {
      var f = this.files[0]; if (!f) return;
      loadImage(f, 3000).then(function (r) {
        var i = new Image(); i.onload = function () { Editor.setImage(i); }; i.src = "data:" + r.data;
      }).catch(function () { toast("Couldn't read that image."); });
      this.value = "";
    });
    var canCapture = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && !matchMedia("(pointer: coarse)").matches;
    if (!canCapture) $("#btnCapture").hidden = true;
    $("#btnCapture").addEventListener("click", captureEmbed);
  }
  // Screen-capture this tab and crop to the embedded map (desktop Chrome/Edge)
  function captureEmbed() {
    var frame = $("#mapEmbed");
    navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true, selfBrowserSurface: "include" })
      .then(function (stream) {
        var v = document.createElement("video"); v.srcObject = stream; v.muted = true; v.playsInline = true;
        return v.play().then(function () { return new Promise(function (r) { setTimeout(r, 350); }); }).then(function () {
          var track = stream.getVideoTracks()[0], vw = v.videoWidth, vh = v.videoHeight;
          var rect = frame.getBoundingClientRect(), sx = vw / window.innerWidth, sy = vh / window.innerHeight;
          var sameTab = Math.abs(sx - sy) < 0.08 * sx;
          var c = document.createElement("canvas"), x = 0, y = 0, w = vw, h = vh;
          if (sameTab) { x = rect.left * sx; y = rect.top * sy; w = rect.width * sx; h = rect.height * sy; }
          c.width = Math.round(w); c.height = Math.round(h);
          c.getContext("2d").drawImage(v, x, y, w, h, 0, 0, c.width, c.height);
          track.stop(); stream.getTracks().forEach(function (t) { t.stop(); });
          var i = new Image();
          i.onload = function () { Editor.setImage(i); toast(sameTab ? "Map captured." : "Captured the whole screen. Move and zoom to frame the map."); };
          i.src = c.toDataURL("image/png");
        });
      })
      .catch(function (err) { if (err && err.name !== "NotAllowedError") toast("Capture didn't work here. Take a screenshot and upload it instead."); });
  }

  // ---------------- download ----------------
  function buildDeck() {
    var d = deckData(true);
    return { pres: D.build(window.PptxGenJS, d), name: D.fileName(d) };
  }
  function download() {
    var r = required(), left = r.fields.length + r.photos.length;
    if (left && !window.confirm(left + " item" + (left > 1 ? "s are" : " is") + " still empty (see step 6). Download anyway? Empty spots will show as blanks.")) {
      $("#s-done").scrollIntoView({ behavior: "smooth" }); return;
    }
    var btn = $("#btnDownload"); btn.disabled = true; btn.textContent = "Building…";
    setTimeout(function () {
      try {
        var b = buildDeck();
        b.pres.writeFile({ fileName: b.name }).then(function () { toast("Downloaded " + b.name); })
          .catch(function (e) { console.error(e); toast("Couldn't build the deck: " + e.message); })
          .then(function () { btn.disabled = false; btn.textContent = "Download deck"; });
      } catch (e) { console.error(e); toast("Couldn't build the deck: " + e.message); btn.disabled = false; btn.textContent = "Download deck"; }
    }, 30);
  }
  function share() {
    try {
      var b = buildDeck();
      b.pres.write({ outputType: "blob" }).then(function (blob) {
        var file = new File([blob], b.name, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: b.name });
        toast("Sharing isn't available here. Use Download instead.");
      }).catch(function (e) { if (e && e.name !== "AbortError") toast("Couldn't share: " + e.message); });
    } catch (e) { toast("Couldn't build the deck: " + e.message); }
  }

  // ---------------- misc ----------------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var toastT;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 3200); }

  function resetAll() {
    if (dirty && !window.confirm("Clear this report and start a new one?")) return;
    S = freshState(); dirty = false;
    $$("[data-bind]").forEach(function (el) { el._bound = false; });
    Editor.reset(); $("#embedWrap").hidden = true;
    bindAll(document); renderTypes(); structureChanged(); onChange("dispDate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    Editor.init();
    renderTypes();
    bindAll(document);
    $$("[data-step=sftl]").forEach(function (b) { b.addEventListener("click", function () { setSftlCount(S.sftls.length + (+b.getAttribute("data-d"))); dirty = true; }); });
    $("#btnAutoRemark").addEventListener("click", function () { S.remarksEdited = false; S.remarks = ""; $("#remarksBox").value = ""; renderCalc(); });
    $("#btnDownload").addEventListener("click", download);
    $("#btnReset").addEventListener("click", resetAll);
    var probe = new File([""], "x.pptx");
    if (navigator.canShare && navigator.canShare({ files: [probe] }) && matchMedia("(pointer: coarse)").matches) { $("#btnShare").hidden = false; $("#btnShare").addEventListener("click", share); }
    initMap();
    onChange("dispDate");
    structureChanged();
    window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
  }
  init();
})();

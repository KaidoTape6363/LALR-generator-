/* LALR deck builder — shared by the browser app (and node for testing).
   build(PptxGenJS, data) -> pres (call pres.writeFile / pres.write) */
(function (root) {
  "use strict";
  var TL_PNG = "image/png;base64,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";

  // ---------- colours / fonts (taken from the station templates) ----------
  var RED_HDR = "C0504D", YEL = "FFFF00", RED = "FF0000", GRN = "00B050",
      GREY = "D9D9D9", BLK = "000000", ORANGE = "E36C09";
  var CAL = "Calibri", ARI = "Arial";

  // ---------- time helpers ----------
  function toSec(t) {
    if (!t) return null;
    var m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    return (+m[1]) * 3600 + (+m[2]) * 60 + (+(m[3] || 0));
  }
  function diff(a, b) { // b - a, wraps past midnight
    var x = toSec(a), y = toSec(b);
    if (x == null || y == null) return null;
    var d = y - x; if (d < 0) d += 86400; return d;
  }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtLong(s) { // "08 Min 17 Sec" / "43 Sec"
    if (s == null) return "-";
    var m = Math.floor(s / 60), r = s % 60;
    return m > 0 ? p2(m) + " Min " + p2(r) + " Sec" : r + " Sec";
  }
  function fmtShort(s) { // "7min 36s" / "43s"
    if (s == null) return "-";
    var m = Math.floor(s / 60), r = s % 60;
    return m > 0 ? m + "min " + p2(r) + "s" : r + "s";
  }
  function fmtDur(s) { // "30 sec" / "2 mins 19 sec"
    if (s == null) return "-";
    var m = Math.floor(s / 60), r = s % 60;
    if (!m) return r + " sec";
    return m + (m === 1 ? " min " : " mins ") + r + " sec";
  }
  function ord(n) { return n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th"); }
  function fmtDate(iso) { // 2026-02-18 -> 18/02/2026
    if (!iso) return "";
    var p = iso.split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  var TYPES = {
    A: { name: "Justification – More than 8 min in 8 Min Boundary", slug: "justification_8min", slides: 3 },
    B: { name: "Removal – Actual response within 8 min", slug: "removal_within_8min", slides: 2 },
    C: { name: "Removal – Fire Minor (Rubbish) / Fire Investigation / Oil Spillage", slug: "removal_case_type", slides: 2 },
    D: { name: "No Justification – 11 Min / 15 Min / OOB", slug: "no_justification", slides: 1 }
  };

  // ---------- derived values ----------
  function compute(d) {
    var c = {};
    c.response = diff(d.dispTime, d.arrTime);
    c.activation = d.activationSec != null && d.activationSec !== "" ? +d.activationSec : diff(d.dispTime, d.enrouteTime);
    var target = (+d.targetMin || 8) * 60;
    c.exceeded = c.response == null ? null : Math.max(0, c.response - target);
    c.actLt1 = c.activation == null ? "" : (c.activation < 60 ? "Y" : "N");
    c.mvc = diff(d.mvcStart, d.mvcArrive);
    c.usesMvc = d.type === "A" || d.type === "B";
    c.actual = c.usesMvc && c.activation != null && c.mvc != null ? c.activation + c.mvc : null;
    c.sftls = (d.sftls || []).map(function (s, i) {
      return { n: i + 1, road: s.road || "", red: s.redTime, green: s.greenTime, dur: diff(s.redTime, s.greenTime) };
    });
    c.sftlTotal = c.sftls.reduce(function (a, s) { return a + (s.dur || 0); }, 0);
    c.nSftl = c.sftls.length;
    return c;
  }

  function autoRemark(d, c) {
    var ap = d.appliance || "Appliance";
    if (d.type === "A") {
      var r = ap + " arrived at scene in " + fmtShort(c.actual);
      var why = [];
      if (c.nSftl) why.push("Total SFTL Time " + fmtShort(c.sftlTotal) + " (" + c.nSftl + "x SFTL)");
      if (+d.congestion > 0) why.push(d.congestion + "x Traffic Congestion");
      return r + (why.length ? " due to " + why.join(" and ") : "");
    }
    if (d.type === "B") return "Propose for removal as " + ap + " arrived at scene in " + fmtShort(c.actual) + ".";
    if (d.type === "C") return "Propose for removal due to case of " + (d.caseType || "Fire Investigation") + ".";
    return "";
  }

  // Rich-text runs for the "Others" / "Remarks" cells
  function remarkRuns(d, c, size) {
    var base = { fontFace: ARI, fontSize: size, color: BLK };
    function t(s, o) { var r = { text: s, options: Object.assign({}, base, o || {}) }; return r; }
    var BU = { bold: true, underline: { style: "sng" } };
    var runs = [];
    runs.push(t("Activation Time: "), t(fmtShort(c.activation), BU), t(" (ACES)", { breakLine: true }));
    if (c.usesMvc) {
      runs.push(t("Response Time: " + (d.mvcStart || "-") + " to " + (d.mvcArrive || "-") + " (MVC) = "), t(fmtShort(c.mvc), BU), t("", { breakLine: true }));
      runs.push(t("Actual Response Time: " + fmtShort(c.activation) + " (ACES) + " + fmtShort(c.mvc) + " (MVC) = "), t(fmtShort(c.actual), BU));
    } else {
      runs.push(t("Response Time: "), t(fmtShort(c.response), BU), t("", { breakLine: true }));
      runs.push(t("Actual Response Time: -"));
    }
    var rem = (d.remarks != null && String(d.remarks).trim() !== "") ? String(d.remarks).trim() : autoRemark(d, c);
    if (rem) {
      runs[runs.length - 1].options.breakLine = true;
      runs.push(t("", { breakLine: true }));
      var green = d.type === "B" || d.type === "C";
      runs.push(t("Remarks: " + rem, { bold: true, color: green ? GRN : BLK }));
    }
    return runs;
  }

  // ---------- shape helpers ----------
  function B(pt) { return { type: "solid", pt: pt || 1, color: BLK }; }
  function cell(text, o) {
    return { text: text, options: Object.assign({ fontFace: CAL, fontSize: 9, color: BLK, align: "center", valign: "middle", border: [B(), B(), B(), B()], margin: [0.02, 0.04, 0.02, 0.04] }, o || {}) };
  }
  function hdr(text, o) { return cell(text, Object.assign({ fill: { color: RED_HDR }, color: YEL, bold: true, fontSize: 8 }, o || {})); }

  function fitBox(img, x, y, w, h) { // contain-fit an image into a box, centred
    var iw = img.w || 16, ih = img.h || 9, s = Math.min(w / iw, h / ih);
    var W = iw * s, H = ih * s;
    return { x: x + (w - W) / 2, y: y + (h - H) / 2, w: W, h: H };
  }
  function addImg(slide, img, box) {
    if (!img || !img.data) {
      slide.addShape("rect", { x: box.x, y: box.y, w: box.w, h: box.h, fill: { color: "F2F2F2" }, line: { color: "BFBFBF", width: 0.75, dashType: "dash" } });
      slide.addText("Photo not provided", { x: box.x, y: box.y, w: box.w, h: box.h, fontFace: ARI, fontSize: 9, color: "7F7F7F", align: "center", valign: "middle", isTextBox: true });
      return;
    }
    var f = fitBox(img, box.x, box.y, box.w, box.h);
    slide.addImage({ data: img.data, x: f.x, y: f.y, w: f.w, h: f.h });
  }
  function star5(slide, x, y, w, h) { slide.addShape("star5", { x: x, y: y, w: w, h: h, fill: { color: RED }, line: { color: RED, width: 0.5 } }); }
  function star4(slide, x, y, w, h) { slide.addShape("star4", { x: x, y: y, w: w, h: h, fill: { color: YEL }, line: { color: BLK, width: 0.75 } }); }
  function tlight(slide, x, y, w, h) { slide.addImage({ data: TL_PNG, x: x, y: y, w: w || 0.12, h: h || 0.36 }); }
  function arrow(slide, x1, y1, x2, y2) {
    var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    if (w < 0.01 && h < 0.01) return;
    slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(w, 0.001), h: Math.max(h, 0.001), flipH: x2 < x1, flipV: y2 < y1, line: { color: BLK, width: 1, endArrowType: "triangle" } });
  }
  function footer(slide) {
    slide.addText("RESTRICTED", { x: 4.29, y: 7.18, w: 4.5, h: 0.3, fontFace: CAL, fontSize: 10, color: RED, align: "center", valign: "middle", isTextBox: true });
  }
  // Caption made of lines [[label, value], ...] e.g. [["Remark: ","Start Footage"],["Time: ","17:33:21"]]
  function caption(slide, lines, x, y, w, h, size) {
    var runs = [];
    lines.forEach(function (ln, i) {
      var last = i === lines.length - 1;
      runs.push({ text: ln[0], options: { bold: true } });
      runs.push({ text: ln[1], options: { bold: ln[2] === "b", underline: ln[2] === "u" ? { style: "sng" } : undefined, breakLine: !last } });
    });
    slide.addText(runs, { x: x, y: y, w: w, h: h, fontFace: ARI, fontSize: size || 9, color: BLK, align: "center", valign: "top", margin: 0, isTextBox: true });
  }
  function boxCaption(slide, text, cx, y, w) {
    slide.addText(text, { x: cx - w / 2, y: y, w: w, h: 0.29, fontFace: CAL, fontSize: 11, color: BLK, align: "center", valign: "middle", line: { color: BLK, width: 1 }, fill: { color: "FFFFFF" }, isTextBox: true });
  }

  // ---------- SLIDE 1: summary + map ----------
  var MAP = { x: 1.52, y: 1.31, w: 10.5, h: 3.42 };

  function slideSummary(pres, d, c) {
    var s = pres.addSlide();
    var respCol = { color: RED, bold: true };
    s.addTable([
      [hdr("ACES INCIDENT NO."), hdr("DISPATCHED - DAY / TIME"), hdr("ARRIVAL TIME"), hdr("RESPONSE TIME"), hdr("TIME EXCEEDED"), hdr("ACTIVATION TIME < 1 MIN")],
      [cell(d.incidentNo || ""), cell(fmtDate(d.dispDate) + " | " + (d.dispTime || "")), cell(d.arrTime || ""), cell(fmtLong(c.response), respCol), cell(fmtLong(c.exceeded), respCol), cell(c.actLt1)],
      [hdr("INCIDENT TYPE"), hdr("LOCATION"), hdr("APPL DISPATCHED"), hdr("RESPONSE ZONE"), hdr("VEHICLE COMD / PUMP OPERATOR", { colspan: 2 })],
      [cell(d.incidentType || ""), cell(d.location || ""), cell(d.appliance || ""), cell(d.zone || ""), cell([d.comd, d.pumpOp].filter(Boolean).join(" / "), { colspan: 2 })]
    ], { x: 1.52, y: 0.08, w: 10.5, colW: [1.75, 2.02, 1.48, 1.75, 1.75, 1.75], rowH: [0.27, 0.34, 0.27, 0.34] });

    // map
    var m = d.map || {};
    if (m.img && m.img.data) s.addImage({ data: m.img.data, x: MAP.x, y: MAP.y, w: MAP.w, h: MAP.h });
    else addImg(s, null, MAP);
    s.addShape("rect", { x: MAP.x, y: MAP.y, w: MAP.w, h: MAP.h, fill: { type: "none" }, line: { color: BLK, width: 1 } });
    drawMarkers(s, d, c, m.markers || []);

    // justifications
    var nS = c.nSftl, nC = +d.congestion || 0;
    function yn(flag) { return flag ? "Y" : "N"; }
    var wx = d.weather || {}, dv = d.deviation || {};
    var just = [
      [hdr("JUSTIFICATIONS", { fontSize: 9 }), hdr("Y/N", { fontSize: 9 }), hdr("REMARKS", { fontSize: 9 })],
      [cell("SFTL"), cell(yn(nS)), cell(nS ? nS + " x SFTL" + (nS > 1 ? "s" : "") : "Nil")],
      [cell("Traffic Congestion"), cell(yn(nC)), cell(nC ? (d.congestionRemark || nC + " x Traffic Congestion") : "Nil")],
      [cell("Inclement Weather"), cell(yn(wx.yn === "Y")), cell(wx.yn === "Y" ? (wx.remark || "Heavy rain") : "Nil")],
      [cell("ACES Route Deviation?"), cell(yn(dv.yn === "Y")), cell(dv.yn === "Y" ? (dv.remark || "Yes") : "Nil")],
      [cell("Others"), { text: remarkRuns(d, c, 8), options: { colspan: 2, align: "left", valign: "middle", border: [B(), B(), B(), B()], margin: [0.04, 0.08, 0.04, 0.08] } }]
    ];
    s.addTable(just, { x: 1.52, y: 4.73, w: 9.03, colW: [4.63, 1.04, 3.36], rowH: [0.39, 0.25, 0.25, 0.25, 0.25, 1.13] });

    // legend
    s.addTable([
      [hdr("LEGEND", { colspan: 2, fontSize: 9 })],
      [cell(""), cell("Route Taken", { fontSize: 8 })],
      [cell(""), cell("Congestion", { fontSize: 8 })],
      [cell(""), cell("SFTL", { fontSize: 8 })],
      [cell(""), cell("Responded From", { fontSize: 8 })],
      [cell(""), cell("Incident Location", { fontSize: 8 })]
    ], { x: 10.56, y: 4.73, w: 1.46, colW: [0.4, 1.06], rowH: [0.42, 0.42, 0.42, 0.42, 0.42, 0.42] });
    var cx = 10.76, ry = function (i) { return 4.73 + 0.42 * i + 0.21; };
    s.addShape("rect", { x: cx - 0.1, y: ry(1) - 0.05, w: 0.2, h: 0.1, fill: { color: GRN }, line: { color: GRN, width: 0.5 } });
    s.addShape("rect", { x: cx - 0.1, y: ry(2) - 0.05, w: 0.2, h: 0.1, fill: { color: RED }, line: { color: RED, width: 0.5 } });
    tlight(s, cx - 0.06, ry(3) - 0.17, 0.12, 0.34);
    star4(s, cx - 0.1, ry(4) - 0.12, 0.2, 0.24);
    star5(s, cx - 0.14, ry(5) - 0.12, 0.28, 0.24);

    if (d.mapLink) s.addNotes("Google map with response boundary link (Use Google Chrome):\n" + d.mapLink);
  }

  function drawMarkers(s, d, c, markers) {
    function X(nx) { return MAP.x + nx * MAP.w; }
    function Y(ny) { return MAP.y + ny * MAP.h; }
    markers.forEach(function (mk) {
      if (mk.kind === "incident") star5(s, X(mk.x) - 0.2, Y(mk.y) - 0.19, 0.4, 0.38);
      else if (mk.kind === "origin") star4(s, X(mk.x) - 0.22, Y(mk.y) - 0.24, 0.44, 0.48);
      else if (mk.kind === "label") {
        var lines = String(mk.text || "").split("\n");
        var w = Math.max(0.72, Math.max.apply(null, lines.map(function (l) { return l.length; })) * 0.075 + 0.14);
        var h = 0.16 * lines.length + 0.06;
        s.addText(lines.join("\n"), { x: X(mk.x) - w / 2, y: Y(mk.y) - h / 2, w: w, h: h, fontFace: CAL, fontSize: 8, color: BLK, align: "center", valign: "middle", fill: { color: ORANGE }, margin: 0, isTextBox: true });
      } else if (mk.kind === "sftl") {
        var sf = c.sftls[mk.n - 1];
        var road = sf ? sf.road : "";
        var BW = 1.48, BH = 0.37, TW = 0.12;
        var lx = X(mk.lx), ly = Y(mk.ly); // top-left of [light+box] group
        tlight(s, lx, ly, TW, 0.36);
        var bx = lx + TW, by = ly;
        s.addText([
          { text: String(mk.n), options: { breakLine: false } },
          { text: ord(mk.n).slice(String(mk.n).length).toUpperCase(), options: { superscript: true } },
          { text: " SFTL", options: { breakLine: true } },
          { text: road.toUpperCase() }
        ], { x: bx, y: by, w: BW, h: BH, fontFace: CAL, fontSize: 8, color: BLK, align: "center", valign: "middle", fill: { color: "FFFFFF" }, line: { color: BLK, width: 0.75 }, margin: 0.02, isTextBox: true });
        // arrow from nearest box edge to the SFTL point
        var px = X(mk.x), py = Y(mk.y);
        var cxb = bx + BW / 2, cyb = by + BH / 2;
        var sx, sy;
        if (py > by + BH) { sx = Math.min(Math.max(px, bx + 0.15), bx + BW - 0.15); sy = by + BH; }
        else if (py < by) { sx = Math.min(Math.max(px, bx + 0.15), bx + BW - 0.15); sy = by; }
        else { sx = px < cxb ? lx : bx + BW; sy = cyb; }
        if (Math.hypot(px - sx, py - sy) > 0.08) arrow(s, sx, sy, px, py);
      }
    });
  }

  // ---------- header tables for slides 2+ ----------
  function titleTable(s, title, appl, col2, col3, opts) {
    var o = opts || {};
    var red = { color: RED, bold: true, fontSize: 14 };
    s.addTable([
      [cell([{ text: title + " ", options: { color: BLK } }, { text: appl || "", options: { color: RED } }], { colspan: 3, bold: true, fontSize: 18, fill: { color: "FFFFFF" } })],
      [cell("Incident No.", { fill: { color: GREY }, fontSize: 14 }), cell(col2[0], { fill: { color: GREY }, fontSize: 14 }), cell(col3[0], { fill: { color: GREY }, fontSize: 14 })],
      [cell(o.incidentNo || "", { bold: true, fontSize: 14 }), cell(col2[1], red), cell(col3[1], Object.assign({}, red, { color: col3[2] || RED }))],
      [cell("", { colspan: 3 })]
    ], { x: o.x, y: o.y, w: o.w, colW: [o.w / 3, o.w / 3, o.w / 3], rowH: o.rowH });
  }
  function remarksTable(s, runs, x, y, w, h, leftW) {
    s.addTable([[cell("Remarks", { fill: { color: GREY }, fontSize: 14 }), { text: runs, options: { align: "left", valign: "middle", border: [B(), B(), B(), B()], margin: [0.05, 0.1, 0.05, 0.1] } }]],
      { x: x, y: y, w: w, colW: [leftW, w - leftW], rowH: [h] });
  }

  // ---------- A: Activation slide ----------
  function slideActivation(pres, d, c) {
    var s = pres.addSlide();
    var X = 1.15, W = 10.43;
    titleTable(s, "Activation for", d.appliance, ["Activation Time (ACES)", fmtLong(c.activation)], ["Actual Activation Time", fmtLong(c.activation)],
      { x: X, y: 0.09, w: W, rowH: [0.42, 0.35, 0.35, 4.2], incidentNo: d.incidentNo });
    // remarks row
    s.addTable([[cell("Remarks", { fill: { color: GREY }, fontSize: 14 }),
      { text: d.activationRemarks || ("According to ACES logs, " + (d.appliance || "") + " responded in " + fmtLong(c.activation) + "."), options: { colspan: 2, fontFace: ARI, fontSize: 11, italic: true, align: "left", valign: "middle", border: [B(), B(), B(), B()], margin: [0.05, 0.1, 0.05, 0.1] } }]],
      { x: X, y: 5.41, w: W, colW: [W / 3, W / 3, W / 3], rowH: [1.78] });
    var area = { x: X + 0.4, y: 1.35, w: W - 0.8, h: 3.3 };
    var img = (d.images || {}).aces;
    var f = img && img.data ? fitBox(img, area.x, area.y, area.w, area.h) : { x: area.x + 1.5, y: area.y + 0.8, w: area.w - 3, h: 1.6 };
    addImg(s, img, f);
    boxCaption(s, (d.appliance || "") + " Activation Time (ACES): " + fmtLong(c.activation), X + W / 2, f.y + f.h + 0.25, 3.3);
    footer(s);
  }

  // ---------- A: Response slide(s) with MVC + SFTL photos ----------
  function slideResponseSftl(pres, d, c) {
    var imgs = d.images || {};
    var groups = [{
      items: [
        { img: imgs.start, cap: [["Remark: ", "Start Footage"], ["Time: ", d.mvcStart || "-", "u"]] },
        { img: imgs.arrive, cap: [["Remark: ", "Arrived Location"], ["Time: ", d.mvcArrive || "-", "u"]] }
      ]
    }];
    c.sftls.forEach(function (sf, i) {
      var src = (d.sftls || [])[i] || {};
      groups.push({
        items: [
          { img: src.redImg, cap: [["Remark: ", ord(sf.n) + " SFTL (Red Light)"], ["Time: ", sf.red || "-", "u"]] },
          { img: src.greenImg, cap: [["Remark: ", ord(sf.n) + " SFTL (Green Light)"], ["Time: ", sf.green || "-", "u"], ["Duration: ", fmtDur(sf.dur), "u"]] }
        ]
      });
    });
    var per = groups.length <= 4 ? 4 : 6;
    var cols = groups.length <= 4 ? 2 : 3;
    var pages = Math.ceil(groups.length / per);
    var runs = remarkRuns(d, c, 11);
    for (var p = 0; p < pages; p++) {
      var s = pres.addSlide();
      var X = 1.57, W = 10.0;
      titleTable(s, "Response for", d.appliance + (pages > 1 ? "  (" + (p + 1) + "/" + pages + ")" : ""),
        ["Response Time (ACES)", fmtLong(c.response)], ["Actual Response Time", fmtLong(c.actual), GRN],
        { x: X, y: 0.12, w: W, rowH: [0.37, 0.31, 0.31, 3.97], incidentNo: d.incidentNo });
      remarksTable(s, runs, X, 5.16, W, 2.03, 2.17);
      var gs = groups.slice(p * per, p * per + per);
      var rows = Math.ceil(gs.length / cols) || 1;
      var areaX = X + 0.2, areaY = 1.22, areaW = W - 0.4, areaH = 3.8;
      var gw = areaW / cols, gh = areaH / rows;
      var capH = cols === 2 ? 0.5 : 0.5;
      gs.forEach(function (g, gi) {
        var col = gi % cols, row = Math.floor(gi / cols);
        var inRow = Math.min(cols, gs.length - row * cols);
        var gx = areaX + (cols - inRow) * gw / 2 + col * gw + 0.12, gy = areaY + row * gh;
        var innerW = gw - 0.24;
        var photoW = innerW / 2 - 0.02;
        var photoH = Math.min(photoW * 9 / 16 * 1.05, gh - capH - 0.15);
        g.items.forEach(function (it, k) {
          var px = gx + k * (photoW + 0.04);
          addImg(s, it.img, { x: px, y: gy, w: photoW, h: photoH });
          caption(s, it.cap, px - 0.05, gy + photoH + 0.05, photoW + 0.1, capH, cols === 2 ? 9 : 8);
        });
      });
      footer(s);
    }
  }

  // ---------- B: Response slide with ACES + MVC start/arrive ----------
  function slideResponseSimple(pres, d, c) {
    var s = pres.addSlide(), imgs = d.images || {};
    var X = 1.57, W = 10.0;
    titleTable(s, "Response for", d.appliance, ["Response Time (ACES)", fmtLong(c.response)], ["Actual Response Time", fmtLong(c.actual), GRN],
      { x: X, y: 0.12, w: W, rowH: [0.37, 0.31, 0.31, 4.53], incidentNo: d.incidentNo });
    remarksTable(s, remarkRuns(d, c, 11), X, 5.72, W, 1.46, 2.17);
    // left: ACES
    var left = { x: X + 0.2, y: 1.5, w: 4.0, h: 2.4 };
    var fa = imgs.aces && imgs.aces.data ? fitBox(imgs.aces, left.x, left.y, left.w, left.h) : { x: left.x, y: left.y + 0.4, w: left.w, h: 1.4 };
    addImg(s, imgs.aces, fa);
    boxCaption(s, (d.appliance || "") + " Activation Time (ACES): " + fmtLong(c.activation), left.x + left.w / 2, fa.y + fa.h + 0.2, 3.3);
    // right: start + arrive
    var rx = X + 4.55, pw = 2.6, ph = 1.85, py = 1.75;
    [[imgs.start, [["Remark: ", "Start Footage"], ["Time: ", d.mvcStart || "-", "u"]]],
     [imgs.arrive, [["Remark: ", "Arrived Location"], ["Time: ", d.mvcArrive || "-", "u"]]]].forEach(function (it, k) {
      var bx = rx + k * (pw + 0.1);
      addImg(s, it[0], { x: bx, y: py, w: pw, h: ph });
      caption(s, it[1], bx, py + ph + 0.06, pw, 0.4, 9);
    });
    footer(s);
  }

  // ---------- C: Response slide with ACES incident record ----------
  function slideResponseRecord(pres, d, c) {
    var s = pres.addSlide(), imgs = d.images || {};
    var X = 1.57, W = 10.0;
    titleTable(s, "Response for", d.appliance, ["Response Time (ACES)", fmtLong(c.response)], ["Actual Response Time", fmtLong(c.response)],
      { x: X, y: 0.12, w: W, rowH: [0.37, 0.31, 0.31, 3.97], incidentNo: d.incidentNo });
    remarksTable(s, remarkRuns(d, c, 11), X, 5.16, W, 2.03, 2.17);
    addImg(s, imgs.aces, imgs.aces && imgs.aces.data ? fitBox(imgs.aces, X + 0.5, 1.3, W - 1.0, 3.6) : { x: X + 1.5, y: 1.6, w: W - 3, h: 3 });
    footer(s);
  }

  function build(PptxGenJS, d) {
    var c = compute(d);
    var pres = new PptxGenJS();
    pres.layout = "LAYOUT_WIDE";
    pres.title = "LALR " + (d.incidentNo || "");
    slideSummary(pres, d, c);
    if (d.type === "A") { slideActivation(pres, d, c); slideResponseSftl(pres, d, c); }
    else if (d.type === "B") slideResponseSimple(pres, d, c);
    else if (d.type === "C") slideResponseRecord(pres, d, c);
    return pres;
  }

  function fileName(d) {
    var inc = String(d.incidentNo || "incident").replace(/[^0-9A-Za-z]+/g, "_").replace(/^_+|_+$/g, "");
    var ap = String(d.appliance || "").replace(/[^0-9A-Za-z]+/g, "");
    return [inc, ap, (TYPES[d.type] || {}).slug].filter(Boolean).join("_") + ".pptx";
  }

  var api = { build: build, compute: compute, autoRemark: autoRemark, fileName: fileName, TYPES: TYPES,
    fmt: { long: fmtLong, short: fmtShort, dur: fmtDur, ord: ord, date: fmtDate }, time: { toSec: toSec, diff: diff }, TL_PNG: TL_PNG };
  root.LALRDeck = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

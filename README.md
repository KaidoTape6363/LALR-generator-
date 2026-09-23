# LALR Slide Builder

Static web app that drafts LALR report decks (.pptx) in the browser. Nothing is uploaded or stored: photos stay in the open tab and are discarded when it closes.

## Deploy to Netlify
Drag this whole folder onto https://app.netlify.com/drop (or connect a repo with publish directory = this folder). No build step.

## Files
- `index.html`, `styles.css`, `app.js` - the form, photo prompts and map editor
- `deck.js` - builds the slides (layouts copied from the station templates)
- `vendor/pptxgen.bundle.js` - PptxGenJS 4.0.1, bundled so the app has no script dependencies

## Changing settings
Top of `app.js`, `CONFIG`:
- `mapViewer` / `mapEmbed` - the Google My Maps boundary map (swap the `mid=` value if the map changes)
- `targetMin` - "Time exceeded" is measured against this (8 min)
- `maxSftl` - most SFTLs a section commander can pick

Appliance, station and incident-type suggestions are the `<datalist>` lists at the bottom of `index.html`.

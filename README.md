# Wedding Invitation Template - Easy Customization Guide

## Quick Edit Guide (5 minutes setup)
Edit these files only:

### 1. **index.html** - Main content
```
- Names: Search "Supriyadi" / "Hayu Kartikasari" → Replace
- Date: Line ~15 & ~250 "24 Mei 2026" → Change
- Location: Line ~320 "Jalan Watuagung, Rembes" → Update
- Countdown: Line ~290 data-date="2026-05-24T09:00:00+07:00" → YYYY-MM-DDTHH:MM:SS+07:00
- Bank accounts: Line ~350/360 data-copy & text
- WA number: script.js line ~530 WA_NUMBER
```

### 2. **script.js** - Google Sheets (Wishes)
```
- Line ~420 GOOGLE_SCRIPT_URL = "your-deployed-url-here"
- Deploy new: Google Apps Script → New Spreadsheet → Paste code below
```

**Google Sheets Setup (2 min):**
```
1. New Google Sheet: Columns A:Name, B:Message, C:Attend (true/false), D:Date
2. Apps Script (Extensions): Paste this code:
```js
function doGet() { return ContentService.createTextOutput(JSON.stringify(getData())).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) { appendRow([e.name,e.message,e.attend,new Date()]); return ContentService.createTextOutput('OK'); }
function getData() { var sheet = SpreadsheetApp.getActiveSheet(); var data = sheet.getDataRange().getValues(); return data.slice(1).map(row=> ({name:row[0],text:row[1],attend:row[2],date:row[3]})).reverse(); }
function appendRow(row) { var sheet = SpreadsheetApp.getActiveSheet(); sheet.appendRow(row); }
```
3. Deploy → New → Web app → Anyone → Copy URL to script.js
```

### 3. **Images** - Replace files
```
images/couple-hero.webp (hero photo)
images/supriyadi.webp / hayu-kartikasari.webp (portraits)
images/gallery-*.webp (4 photos)
images/logo-pernikahan.png (logo)
```

### 4. **Music** (optional)
```
music/cant-help-falling-in-love.mp3 → Replace (MP3 format)
```

### 5. **share.html** - WA generator (auto)
Ready - generates personalized links `?to=Nama+Tamu`

## Deployment
```
1. Zip folder
2. Host anywhere (Netlify/Vercel free)
3. Test: index.html loads, wishes fetch, RSVP works
```

## Common Issues & Fixes
| Problem | Fix |
|---------|-----|
| Wishes not loading | Check Google URL, Sheet permissions |
| Countdown wrong | Update data-date format |
| Music not playing | Replace MP3, check autoplay policy |
| Mobile scroll issues | CSS already optimized |
| Fonts slow | Preconnect OK |

**Sell-ready: 100% customizable, no code skills needed!**


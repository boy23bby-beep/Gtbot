const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

// Renders a dashboard-style image and returns a Buffer
// options: { width, height, title, subtitle, avatarUrl, name, uid, threadName, time, bgColor, accentColor }
module.exports = async function renderDashboard(options = {}) {
  const {
    width = 1000,
    height = 420,
    title = '',
    subtitle = '',
    avatarUrl,
    name = '',
    uid = '',
    threadName = '',
    time = '',
    bgColor = '#0f1724',
    accentColor = '#1f6feb'
  } = options;

  // Ensure font exists (uses same font as uid command)
  try {
    const cacheDir = path.join(__dirname, '..', 'hindsiligury');
    await fs.ensureDir(cacheDir);
    const fontPath = path.join(cacheDir, 'HindSiliguri-Light.ttf');
    if (!fs.existsSync(fontPath)) {
      // try to download from main branch raw if available
      const fontUrl = 'https://github.com/boy23bby-beep/Gtbot/raw/main/func/hindsiligury/HindSiliguri-Light.ttf';
      try {
        const resp = await axios.get(fontUrl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(fontPath, Buffer.from(resp.data));
      } catch (e) {
        // ignore, fallback to system fonts
      }
    }
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: 'BanglaFont' });
    }
  } catch (e) {
    // ignore font errors
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // accent stripe
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 12, height);

  // card area
  const cardX = 40;
  const cardY = 30;
  const cardW = width - cardX * 2;
  const cardH = height - cardY * 2;
  ctx.fillStyle = '#0b1220';
  roundRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fill();

  // avatar circle
  const avSize = 140;
  const avX = cardX + 30;
  const avY = cardY + 30;
  try {
    if (avatarUrl) {
      const resp = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 10000 });
      const img = await loadImage(resp.data);
      // draw circle clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, avX, avY, avSize, avSize);
      ctx.restore();
    }
  } catch (e) {
    // ignore avatar errors
  }

  // title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.font = '28px BanglaFont, Sans';
  ctx.fillText(title, avX + avSize + 30, avY + 30);

  // subtitle
  ctx.fillStyle = '#b7c0d6';
  ctx.font = '18px BanglaFont, Sans';
  ctx.fillText(subtitle, avX + avSize + 30, avY + 60);

  // name & uid box
  ctx.fillStyle = '#0f273f';
  const infoX = avX + avSize + 30;
  const infoY = avY + 80;
  const infoW = cardW - (avSize + 30 + 60);
  const infoH = 110;
  roundRect(ctx, infoX, infoY, infoW, infoH, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '22px BanglaFont, Sans';
  ctx.fillText(name || `User: ${uid}`, infoX + 18, infoY + 36);
  ctx.fillStyle = '#9fb2d8';
  ctx.font = '16px BanglaFont, Sans';
  ctx.fillText(`UID: ${uid}`, infoX + 18, infoY + 68);

  // thread name and time
  ctx.fillStyle = '#aabed8';
  ctx.font = '16px BanglaFont, Sans';
  ctx.fillText(`Thread: ${threadName || 'Private'}`, cardX + 40, cardY + cardH - 50);
  ctx.fillText(`Time: ${time}`, cardX + 40, cardY + cardH - 24);

  // extra decorative accent
  ctx.fillStyle = accentColor;
  ctx.fillRect(width - 200, cardY + 40, 140, 6);

  return canvas.toBuffer('image/png');
};

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

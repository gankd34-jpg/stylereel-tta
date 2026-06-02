/**
 * video-maker.js — Tạo video slideshow từ ảnh (Canvas + MediaRecorder)
 * Không cần API video bên ngoài — chạy hoàn toàn trên trình duyệt.
 *
 * Output: video WebM, 3 slides x 3 giây = 9 giây
 * - Slide 1: Chân dung KOL mặc sản phẩm
 * - Slide 2: 4 góc chụp KOL với sản phẩm
 * - Slide 3: Text card "Sản phẩm gắn ở giỏ hàng"
 */

const VideoMaker = (() => {

  const W = 1080;
  const H = 1920; // 9:16 TikTok vertical
  const SLIDE_DURATION = 2500; // 2.5s per slide
  const FPS = 30;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Không tải được ảnh: ' + src));
      img.src = src;
    });
  }

  function drawImageCover(ctx, img, w, h) {
    const iw = img.width, ih = img.height;
    const scale = Math.max(w / iw, h / ih);
    const nw = iw * scale, nh = ih * scale;
    ctx.drawImage(img, (w - nw) / 2, (h - nh) / 2, nw, nh);
  }

  function drawSubtitle(ctx, text, w, h, y) {
    if (!text) return;
    ctx.save();
    ctx.font = '700 42px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Background pill
    const m = ctx.measureText(text);
    const pw = m.width + 60, ph = 70;
    const px = (w - pw) / 2, py = y - ph / 2;
    ctx.fillStyle = 'rgba(5,7,15,.6)';
    roundRect(ctx, px, py, pw, ph, 18);
    ctx.fill();
    // Text
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, w / 2, y);
    ctx.restore();
  }

  function drawPrice(ctx, price, w, h) {
    if (!price) return;
    ctx.save();
    const text = price + '.000đ';
    ctx.font = '800 56px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const y = h - 200;
    // BG
    const m = ctx.measureText(text);
    const pw = m.width + 50, ph = 80;
    ctx.fillStyle = 'rgba(59,110,245,.85)';
    roundRect(ctx, (w - pw) / 2, y - ph / 2, pw, ph, 16);
    ctx.fill();
    // Text
    ctx.fillStyle = '#fff';
    ctx.fillText(text, w / 2, y);
    ctx.restore();
  }

  function drawTextCard(ctx, w, h, options) {
    // Navy gradient background
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#05070F');
    grd.addColorStop(0.5, '#0D1426');
    grd.addColorStop(1, '#16245A');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Decorative circle glow
    ctx.save();
    const rgrd = ctx.createRadialGradient(w / 2, h / 2 - 100, 50, w / 2, h / 2 - 100, 400);
    rgrd.addColorStop(0, 'rgba(59,110,245,.25)');
    rgrd.addColorStop(1, 'transparent');
    ctx.fillStyle = rgrd;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Cart icon (simple)
    ctx.save();
    ctx.strokeStyle = '#5C8BFF';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const cx = w / 2, cy = h / 2 - 180;
    // Cart body
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy - 40);
    ctx.lineTo(cx - 60, cy - 40);
    ctx.lineTo(cx - 30, cy + 40);
    ctx.lineTo(cx + 60, cy + 40);
    ctx.lineTo(cx + 80, cy - 20);
    ctx.lineTo(cx - 40, cy - 20);
    ctx.stroke();
    // Wheels
    ctx.beginPath();
    ctx.arc(cx - 20, cy + 65, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 45, cy + 65, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Main text
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '800 58px "Space Grotesk", Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sản phẩm gắn', w / 2, h / 2 + 20);
    ctx.fillText('ở giỏ hàng', w / 2, h / 2 + 90);
    ctx.restore();

    // Sub text
    ctx.save();
    ctx.fillStyle = '#8C9AB6';
    ctx.font = '500 36px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bấm vào giỏ hàng để mua ngay', w / 2, h / 2 + 180);
    ctx.restore();

    // Price if available
    if (options.price) {
      drawPrice(ctx, options.price, w, h);
    }

    // Subtitle
    if (options.subtitle) {
      drawSubtitle(ctx, options.subtitle, w, h, h - 320);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Smooth transition: fade between slides
  function fadeTransition(ctx, w, h, fromCanvas, toDrawFn, duration, onFrame) {
    return new Promise(resolve => {
      const start = performance.now();
      function frame() {
        const elapsed = performance.now() - start;
        const t = Math.min(elapsed / duration, 1);
        // Draw "from" image
        if (fromCanvas) ctx.drawImage(fromCanvas, 0, 0);
        // Overlay "to" with increasing opacity
        ctx.globalAlpha = t;
        toDrawFn();
        ctx.globalAlpha = 1;
        if (onFrame) onFrame();
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      frame();
    });
  }

  /**
   * Create video from slides
   * @param {Object} options
   * @param {string} options.img1Src - URL of portrait image
   * @param {string} options.img2Src - URL of 4-angle body image
   * @param {string} options.price - Price string (e.g. "199")
   * @param {string} options.subtitle - Sub text
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<{videoUrl: string, posterUrl: string, slides: string[]}>}
   */
  async function create(options, onProgress) {
    onProgress && onProgress('Đang tải ảnh…');

    // Load images
    const img1 = await loadImage(options.img1Src);
    const img2 = await loadImage(options.img2Src);

    onProgress && onProgress('Đang dựng video slideshow…');

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Capture slides as static images for output
    const slideImages = [];

    // Draw slide 1 → capture
    ctx.clearRect(0, 0, W, H);
    drawImageCover(ctx, img1, W, H);
    if (options.subtitle) drawSubtitle(ctx, options.subtitle, W, H, H - 300);
    if (options.price) drawPrice(ctx, options.price, W, H);
    slideImages.push(canvas.toDataURL('image/jpeg', 0.92));

    // Draw slide 2 → capture
    ctx.clearRect(0, 0, W, H);
    drawImageCover(ctx, img2, W, H);
    if (options.subtitle) drawSubtitle(ctx, options.subtitle, W, H, H - 300);
    slideImages.push(canvas.toDataURL('image/jpeg', 0.92));

    // Draw slide 3 → capture
    ctx.clearRect(0, 0, W, H);
    drawTextCard(ctx, W, H, options);
    slideImages.push(canvas.toDataURL('image/jpeg', 0.92));

    onProgress && onProgress('Đang mã hóa video…');

    // Record video using MediaRecorder
    const stream = canvas.captureStream(FPS);

    // Check supported mimeType — prefer MP4, fallback to WebM
    let mimeType = '';
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4'
    ];
    const webmTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    // Try MP4 first
    for (const t of mp4Types) {
      if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
    }
    // Fallback to WebM
    if (!mimeType) {
      for (const t of webmTypes) {
        if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
      }
    }
    const isMP4 = mimeType.startsWith('video/mp4');
    console.log('[VideoMaker] Recording format:', mimeType, isMP4 ? '(MP4)' : '(WebM)');

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

    const videoUrl = await new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const blobType = isMP4 ? 'video/mp4' : 'video/webm';
        const blob = new Blob(chunks, { type: blobType });
        resolve({ url: URL.createObjectURL(blob), ext: isMP4 ? 'mp4' : 'webm' });
      };
      recorder.onerror = reject;
      recorder.start(100); // collect data every 100ms

      let slideIdx = 0;
      const slides = [
        () => {
          ctx.clearRect(0, 0, W, H);
          drawImageCover(ctx, img1, W, H);
          if (options.subtitle) drawSubtitle(ctx, options.subtitle, W, H, H - 300);
          if (options.price) drawPrice(ctx, options.price, W, H);
        },
        () => {
          ctx.clearRect(0, 0, W, H);
          drawImageCover(ctx, img2, W, H);
          if (options.subtitle) drawSubtitle(ctx, options.subtitle, W, H, H - 300);
        },
        () => {
          ctx.clearRect(0, 0, W, H);
          drawTextCard(ctx, W, H, options);
        }
      ];

      // Draw slides with timer
      function showSlide() {
        if (slideIdx >= slides.length) {
          // Small delay then stop
          setTimeout(() => recorder.stop(), 200);
          return;
        }
        slides[slideIdx]();
        onProgress && onProgress('Đang ghi slide ' + (slideIdx + 1) + '/3…');
        slideIdx++;
        setTimeout(showSlide, SLIDE_DURATION);
      }

      // Need to keep drawing frames for MediaRecorder
      let recording = true;
      function drawFrame() {
        if (!recording) return;
        // Redraw current slide (MediaRecorder needs continuous frames)
        if (slideIdx > 0 && slideIdx <= slides.length) {
          slides[slideIdx - 1]();
        }
        requestAnimationFrame(drawFrame);
      }

      recorder.addEventListener('stop', () => { recording = false; });
      showSlide();
      drawFrame();
    });

    return {
      videoUrl: videoUrl.url,
      videoExt: videoUrl.ext,
      posterUrl: slideImages[0],
      slides: slideImages
    };
  }

  return { create, loadImage };
})();

/**
 * api.js — Gemini image generation + Video API integration
 * Loaded by "Tạo Video AI.html"
 */

const API = (() => {
  let config = null;

  // ---- Settings (localStorage) ----
  function getSettings() {
    try { return JSON.parse(localStorage.getItem('stylereel_settings') || '{}'); }
    catch { return {}; }
  }
  function saveSettings(s) {
    localStorage.setItem('stylereel_settings', JSON.stringify(s));
  }

  // ---- Config ----
  const DEFAULT_CONFIG = {
  "model": {
    "name": "gemini-2.5-flash-image",
    "endpoint": "https://generativelanguage.googleapis.com/v1beta",
    "type": "gemini"
  },
  "output_images": 2,
  "backgrounds": [
    {
      "id": "studio",
      "label": "Studio trắng",
      "prompt_desc": "phông nền studio trắng sạch sẽ, ánh sáng chuyên nghiệp"
    },
    {
      "id": "gradient",
      "label": "Gradient",
      "prompt_desc": "phông nền gradient xanh tím hiện đại, tông lạnh"
    },
    {
      "id": "street",
      "label": "Đường phố",
      "prompt_desc": "phông nền đường phố đô thị, ánh sáng tự nhiên ban ngày"
    },
    {
      "id": "indoor",
      "label": "Nội thất",
      "prompt_desc": "phông nền phòng nội thất sang trọng, ánh sáng ấm"
    },
    {
      "id": "beach",
      "label": "Bãi biển",
      "prompt_desc": "phông nền bãi biển nhiệt đới, nắng nhẹ, cát trắng"
    }
  ],
  "templates": {
    "full_set": {
      "hook": "[PRECISE TASK]\nI am sending you 3 reference images. Create exactly \n1 fashion advertisement photo by combining them \nstrictly according to these instructions.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 1 = SOURCE BACKGROUND\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCopy this background with 100% fidelity:\n- Preserve the EXACT real-world colors of every \n  object (do NOT alter any colors)\n- Preserve exact lighting, shadows, and camera angle\n- Preserve all details: wall, gate, vehicle, ground, \n  pole, graffiti\n- STRICTLY DO NOT change the color of the car, wall, \n  or any element in the background\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 2 = PRODUCT TO WEAR\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis is the clothing/product to be displayed:\n- Memorize precisely: color, fabric texture, cut, \n  pattern, and decorative details\n- The product must appear on the model EXACTLY as \n  in the original — no alterations whatsoever\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 3 = MODEL BODY REFERENCE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUse the body shape and standing pose from this image:\n- Preserve exact figure, height, and body proportions\n- Preserve hairstyle\n- Dress ONLY in the product from Image 2\n- Add NO extra accessories (no extra bags, jewelry)\n- Face obscured by phone (matching original pose)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 REQUIRED OUTPUT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nFollow this exact priority sequence:\n\nSTEP 1: Use Image 1 background as the canvas — keep \nit 100% intact, no color grading, no modifications\n\nSTEP 2: Place the model (Image 3) in the center \nforeground, naturally scaled to the space\n\nSTEP 3: Dress the model in the exact product \n(Image 2) with all colors and details preserved\n\nSTEP 4: Blend lighting naturally so the model \nintegrates with the background (same light source, \nmatching shadows)\n\nSTEP 5: Render at high quality, fully photo-realistic, \nnot appearing as a composite\n\nMANDATORY REQUIREMENTS:\n✅ Vehicle/wall/background colors must match Image 1 \n   exactly — no color changes\n✅ Product color and design must match Image 2 exactly\n✅ Model figure must match Image 3\n✅ Final image must look like a real photograph\n✅ Portrait orientation, full-body shot\n✅ No extra accessories not present in Image 2",
      "full": "You are a professional fashion e-commerce product photographer.\n\nI will provide you with 2 images:\n- Image 1: An AI mannequin figure wearing only a plain bodysuit/base layer (no clothing)\n- Image 2: The clothing product that needs to be photographed\n\nYour task: Generate a 4-angle product photo (2x2 grid layout) showing the EXACT clothing \nfrom Image 2 worn by the EXACT mannequin from Image 1.\n\n━━━ MANNEQUIN SPECIFICATIONS ━━━\nReplicate the mannequin from Image 1 with 100% accuracy:\n- Hair: exact same style, color, length, and how it's tied/worn\n- Skin tone: exact same complexion and undertone\n- Body: exact same proportions, figure type, and build\n- Face: preserve as-is (faceless/smooth OR maintain exact facial features if present)\n- Pose: neutral upright standing, arms relaxed at sides, feet flat and natural\n- No jewelry or accessories unless shown in the product image\n\n━━━ GARMENT SPECIFICATIONS ━━━\nDress the mannequin in EXACTLY the clothing from Image 2:\n- Color: match precisely — do not alter hue, saturation, or brightness\n- Fabric & texture: replicate the exact material appearance and drape\n- All design details must be preserved:\n  - Neckline style (halter / V-neck / round / off-shoulder / etc.)\n  - Sleeve type and length (or sleeveless)\n  - Waistline treatment (fitted / tied / elasticated / belted)\n  - Hem style and garment length (mini / midi / maxi / crop)\n  - Patterns, prints, embroidery, appliqué, buttons, lace, or any embellishments\n- Fit: clothing sits naturally on the body with realistic fabric draping\n- Silhouette: preserve exact shape (bodycon / A-line / flowy / structured / etc.)\n\n━━━ FOUR-PANEL LAYOUT ━━━\n┌─────────────────┬─────────────────┐\n│   FRONT VIEW    │   BACK VIEW     │\n│                 │                 │\n├─────────────────┼─────────────────┤\n│   LEFT SIDE     │   RIGHT SIDE    │\n│                 │                 │\n└─────────────────┴─────────────────┘\n- Equal-sized panels in a clean 2x2 grid\n- Only the camera angle changes between panels — everything else stays identical\n\n━━━ PHOTOGRAPHY TECHNICAL SPECS ━━━\n- Background: Pure white (#FFFFFF) or soft neutral light gray (#F5F5F5)\n- Lighting: Soft, even diffused studio lighting — no harsh shadows or dramatic effects\n- Shot framing: Full body, head-to-toe clearly visible in EVERY panel\n- Image quality: Ultra-photorealistic, 4K resolution, sharp fabric texture detail\n- Style: Clean, professional e-commerce product photography aesthetic\n\n━━━ CONSISTENCY REQUIREMENTS (CRITICAL) ━━━\n- The mannequin must be IDENTICAL across all 4 panels (hair, skin, body, pose)\n- The garment must be IDENTICAL across all 4 panels (color, fit, details, styling)\n- Background and lighting must be IDENTICAL across all 4 panels\n- NEVER add accessories, props, or modify the garment design\n- NEVER change the mannequin's hair or makeup between panels\n\nGenerate the product photography image now."
    },
    "separate": {
      "hook": "[TASK: CREATE FASHION OUTFIT ADVERTISEMENT]\nI am sending 4 reference images. Generate exactly \n1 complete advertisement photo following these \nprecise instructions.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 1 = BACKGROUND SCENE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis is the environment for the advertisement:\n- Copy this background with 100% fidelity\n- Preserve the EXACT real-world colors of every \n  single object\n- Preserve exact lighting, shadows, angle, atmosphere\n- STRICTLY DO NOT change any colors in the background\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 2 = MANNEQUIN / MODEL\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis provides the body shape and pose:\n- Preserve exact figure, body proportions, height\n- Preserve exact standing pose\n- Preserve hairstyle if present\n- Face may be hidden or obscured\n- DO NOT keep the original outfit on the mannequin —\n  it will be replaced by Images 3 + 4\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 3 = BOTTOM GARMENT (PANTS/SKIRT)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis is the lower-body garment to be worn:\n- Memorize precisely: color, fabric, cut, pattern, \n  silhouette (wide-leg/slim/flared etc.)\n- Dress the model's lower body with this exact \n  garment\n- Preserve 100% of original color and details\n- Length and fit must match the original exactly\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 IMAGE 4 = TOP GARMENT (SHIRT/BLOUSE/JACKET)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis is the upper-body garment to be worn:\n- Memorize precisely: color, fabric, neckline, \n  sleeves, pattern, silhouette\n- Dress the model's upper body with this exact \n  garment\n- Preserve 100% of original color and details\n- Style and fit must match the original exactly\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 GENERATION WORKFLOW\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSTEP 1 — BACKGROUND:\nUse Image 1 as the canvas. Keep it completely \nintact with no modifications whatsoever.\n\nSTEP 2 — SUBJECT PLACEMENT:\nPlace the model from Image 2 in the center of \nthe frame, naturally scaled to the background.\n\nSTEP 3 — OUTFIT ASSEMBLY:\nSimultaneously dress the model with:\n- Top garment (Image 4) on upper body\n- Bottom garment (Image 3) on lower body\nBoth pieces must combine naturally, with a \nrealistic and seamless waist/waistband junction.\n\nSTEP 4 — LIGHTING INTEGRATION:\nBlend lighting so the model integrates with the \nbackground. Match light direction, color \ntemperature, and cast natural shadows.\n\nSTEP 5 — FINAL RENDER:\nOutput at high quality, fully photo-realistic, \nappearing as a genuine professional photograph.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ MANDATORY CHECKLIST\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Background matches Image 1 100%, no color \n   changes to any object\n✅ Model figure and pose matches Image 2\n✅ Bottom garment matches Image 3 100% \n   (color, cut, fabric)\n✅ Top garment matches Image 4 100% \n   (color, cut, fabric)\n✅ Both garments combined naturally on the body\n✅ Unified lighting, not looking like a composite\n✅ Portrait orientation, full-body or 3/4 view\n✅ High-end commercial photography quality\n\n⚠️ STRICTLY PROHIBITED:\n❌ Altering background colors or any object colors\n❌ Changing color or style of either garment\n❌ Adding accessories not present in source images\n❌ Producing an image that looks like crude editing",
      "full": "You are a professional fashion e-commerce product photographer.\n\nI will provide you with 3 images:\n- Image 1: AI mannequin figure in a plain bodysuit/base layer (no clothing)\n- Image 2: TOP product (flat lay or hanger photo — the shirt/blouse/top)\n- Image 3: BOTTOM product (flat lay or hanger photo — the pants/skirt/shorts)\n\nYour task: Generate a 4-angle product photo (2x2 grid) showing the mannequin \nfrom Image 1 wearing BOTH the top from Image 2 AND the bottom from Image 3 \nas a complete styled outfit.\n\n━━━ MANNEQUIN SPECIFICATIONS ━━━\nReplicate the mannequin from Image 1 with 100% accuracy:\n- Hair: exact same style, color, length, and how it's tied/worn\n- Skin tone: exact same complexion and undertone\n- Body proportions: exact same figure type and build\n- Face: preserve as-is (smooth faceless OR maintain exact features if present)\n- Pose: neutral upright standing, arms relaxed at sides, feet flat\n- No accessories unless shown in the original product images\n\n━━━ TOP GARMENT — from Image 2 ━━━\nDress the mannequin in EXACTLY the top from Image 2:\n- Color: match precisely — light heathered gray, do not alter tone\n- Fabric/texture: ribbed cotton-blend knit with subtle texture\n- Neckline: classic polo collar with center-front zip placket (partial zip)\n- Sleeves: short cap sleeves, slightly structured\n- Design details: DAZZI brand label at collar, zip-up center front detail,\n  seam line running center front body\n- Silhouette: slim fitted, slightly curved hem at bottom\n- Length: regular/hip-length top\n\n━━━ BOTTOM GARMENT — from Image 3 ━━━\nDress the mannequin in EXACTLY the bottom from Image 3:\n- Color: match precisely — warm beige/khaki cream\n- Fabric/texture: lightweight woven cotton, smooth with slight structure\n- Style: bubble skirt / puff skirt with balloon silhouette\n- Waistband: wide structured high-rise waistband with belt loops\n- Design details: gathered/pleated fabric creating voluminous bubble shape,\n  full gathered hem that puffs inward at bottom edge\n- Silhouette: voluminous A-line balloon/bubble shape, very full and rounded\n- Length: mini — falls at upper thigh\n\n━━━ OUTFIT COMBINATION REQUIREMENTS ━━━\n- Both garments must be worn simultaneously as a complete, natural outfit\n- Top should be tucked in or sitting naturally above the skirt waistband\n- Fabric draping of both pieces must look realistic and physically accurate\n- Color of each garment must remain independent — no color bleeding between pieces\n- The outfit proportions must be balanced and true to real-life styling\n\n━━━ FOUR-PANEL LAYOUT (2x2 grid) ━━━\n┌─────────────────┬─────────────────┐\n│   FRONT VIEW    │   BACK VIEW     │\n│                 │                 │\n├─────────────────┼─────────────────┤\n│   LEFT SIDE     │   RIGHT SIDE    │\n│                 │                 │\n└─────────────────┴─────────────────┘\n- Equal-sized panels in a clean 2x2 grid\n- ONLY the camera angle changes between panels\n\n━━━ PHOTOGRAPHY TECHNICAL SPECS ━━━\n- Background: Pure white (#FFFFFF) or soft neutral light gray (#F5F5F5)\n- Lighting: Soft, even diffused studio lighting — no harsh shadows\n- Shot framing: Full body head-to-toe in EVERY single panel\n- Image quality: Ultra-photorealistic, 4K, sharp fabric texture detail\n- Style: Clean professional e-commerce product photography\n\n━━━ CONSISTENCY REQUIREMENTS (CRITICAL) ━━━\n- Mannequin IDENTICAL across all 4 panels (hair, skin, body, pose)\n- Top garment IDENTICAL across all 4 panels (color, fit, details)\n- Bottom garment IDENTICAL across all 4 panels (color, shape, details)\n- Background and lighting IDENTICAL across all 4 panels\n- NEVER add accessories, props, or modify either garment design\n\nGenerate the complete outfit product photography image now."
    }
  }
};

  async function loadConfig(forceReload) {
    if (config && !forceReload) return config;
    let base;
    try {
      const r = await fetch('prompts-config.json?t=' + Date.now());
      if (!r.ok) throw new Error('HTTP ' + r.status);
      base = await r.json();
    } catch(e) {
      console.warn('[StyleReel] Cannot fetch config, using embedded default:', e.message);
      base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    config = base;
    return config;
  }



  // ---- File → base64 ----
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve({ base64, mimeType: file.type || 'image/png' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function imgUrlToBase64(url) {
    const r = await fetch(url);
    const blob = await r.blob();
    return fileToBase64(blob);
  }

  // ---- Fill template variables ----
  function fillVars(tpl, cfg, inputs, sharedBg) {
    const outputCount = cfg.output_images || (cfg.gemini && cfg.gemini.output_images) || 2;
    tpl = tpl.replace(/{output_count}/g, outputCount);
    tpl = tpl.replace(/{kol_name}/g, inputs.kolName || 'KOL');
    tpl = tpl.replace(/{kol_style}/g, inputs.kolStyle || 'thanh lịch');

    if (inputs.price) {
      tpl = tpl.replace(/{price}/g, inputs.price + '.000đ');
    } else {
      tpl = tpl.replace(/{price}/g, 'Không hiển thị');
    }

    if (inputs.subtitle && inputs.subtitle.trim()) {
      tpl = tpl.replace(/{subtitle_line}/g, '- Phụ đề hiển thị trên video: "' + inputs.subtitle + '"');
    } else {
      tpl = tpl.replace(/{subtitle_line}/g, '');
    }

    tpl = tpl.replace(/{background_desc}/g, sharedBg);
    return tpl;
  }

  // ---- Pick background description (random if not chosen) ----
  function pickBackground(cfg, inputs) {
    if (inputs.backgroundId) {
      const bg = cfg.backgrounds.find(b => b.id === inputs.backgroundId);
      return bg ? bg.prompt_desc : 'phông nền tự nhiên';
    }
    const rand = cfg.backgrounds[Math.floor(Math.random() * cfg.backgrounds.length)];
    return rand.prompt_desc + ' (chọn ngẫu nhiên)';
  }

  // ---- Build 2 prompts: hook + full ----
  function buildPrompts(cfg, inputs) {
    const mode = inputs.uploadMode; // 'full_set' | 'separate'
    let tpl = cfg.templates[mode];
    // Backward-compat: if template is a plain string, use it for both
    if (typeof tpl === 'string') tpl = { hook: tpl, full: tpl };
    const bg = pickBackground(cfg, inputs); // same background for both images
    return {
      hook: fillVars(tpl.hook || '', cfg, inputs, bg),
      full: fillVars(tpl.full || '', cfg, inputs, bg),
      background: bg
    };
  }

  // Legacy single-prompt builder (kept for compatibility)
  function buildPrompt(cfg, inputs) {
    const p = buildPrompts(cfg, inputs);
    return 'HOOK:\n' + p.hook + '\n\n---\n\nFULL:\n' + p.full;
  }

  async function collectProductImages(inputs) {
    const images = [];
    if (inputs.uploadMode === 'full_set' && inputs.files.set) {
      const d = await fileToBase64(inputs.files.set);
      images.push({ role: 'Ảnh sản phẩm cả bộ', ...d });
    }
    if (inputs.uploadMode === 'separate') {
      if (inputs.files.top) {
        const d = await fileToBase64(inputs.files.top);
        images.push({ role: 'Ảnh áo', ...d });
      }
      if (inputs.files.bottom) {
        const d = await fileToBase64(inputs.files.bottom);
        images.push({ role: 'Ảnh quần', ...d });
      }
    }
    return images;
  }



  // Load one KOL image (data URL or asset URL) as a reference object
  async function kolRef(src, role) {
    if (!src) return null;
    try { return { role, ...(await imgUrlToBase64(src)) }; }
    catch (e) { console.warn('Không tải được ảnh KOL:', role, e); return null; }
  }

  // ---- Call Gemini API (Image Generation) ----
  // Gửi prompt text + ảnh tham khảo (inlineData base64) → nhận 1 ảnh sinh bởi Gemini
  async function callGemini(prompt, images, label) {
    const s = getSettings();
    const cfg = await loadConfig();
    const apiKey = (s.apiKey || '').trim();
    if (!apiKey) throw new Error('Chưa nhập API Key. Bấm ⚙ để thêm key.');

    const modelName = (cfg.model && cfg.model.name) || 'gemini-2.5-flash-image';
    const baseUrl = ((cfg.model && cfg.model.endpoint) || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
    const endpoint = baseUrl + '/models/' + modelName + ':generateContent?key=' + apiKey;

    // Build content parts: ảnh tham khảo trước, prompt text sau
    const parts = [];
    for (const img of images) {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    }
    parts.push({ text: prompt });

    const body = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    };

    console.log('[StyleReel] Gọi Gemini (' + label + '):', modelName, '| Ảnh tham khảo:', images.length, images.map(r => r.role));

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = err.error?.message || ('HTTP ' + resp.status);
      throw new Error('Gemini API lỗi (' + label + '): ' + msg);
    }

    const data = await resp.json();
    const generatedImages = [];
    for (const cand of (data.candidates || [])) {
      for (const p of (cand.content?.parts || [])) {
        if (p.inlineData) {
          generatedImages.push('data:' + p.inlineData.mimeType + ';base64,' + p.inlineData.data);
        }
      }
    }

    if (!generatedImages.length) {
      throw new Error('Gemini không trả về ảnh (' + label + '). Kiểm tra model có hỗ trợ image generation (VD: gemini-2.5-flash-image).');
    }
    return generatedImages[0];
  }

  // ---- Call the configured model API (image generation) ----
  async function callCustomModel(prompt, images, label) {
    const s = getSettings();
    const cfg = await loadConfig();
    const endpoint = ((cfg.model && cfg.model.endpoint) || s.modelEndpoint || s.videoEndpoint || '').trim();
    const key = (s.apiKey || s.modelKey || s.videoKey || '').trim();
    if (!endpoint) throw new Error('Chưa cấu hình endpoint model.');
    if (!key) throw new Error('Chưa nhập API Key. Bấm ⚙ để thêm key.');

    // Reference images as data URLs
    const refDataUrls = images.map(img => 'data:' + img.mimeType + ';base64,' + img.base64);

    const body = {
      prompt: prompt,
      image: refDataUrls[0] || null,
      images: refDataUrls,
      reference_roles: images.map(i => i.role),
      type: label // 'hook' | 'full'
    };

    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = 'Bearer ' + key;

    const resp = await fetch(endpoint, {
      method: 'POST', headers, body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      throw new Error('API model lỗi ' + resp.status + ': ' + t.slice(0, 160));
    }
    const data = await resp.json().catch(() => ({}));

    // Try common response shapes for an image
    const url = data.image || data.image_url || data.imageUrl || data.url ||
      (Array.isArray(data.images) ? data.images[0] : null) ||
      data.output?.image || (Array.isArray(data.output) ? data.output[0] : null) ||
      data.data?.[0]?.url || data.data?.[0]?.b64_json || null;

    if (!url) throw new Error('API model không trả về ảnh. Kiểm tra định dạng response.');
    // If base64 without prefix
    if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('data:')) {
      return 'data:image/png;base64,' + url;
    }
    return url;
  }

  // ---- Route: generate ONE image for a given prompt ----
  async function generateImage(prompt, images, label) {
    const cfg = await loadConfig();
    const modelType = (cfg.model && cfg.model.type) || 'custom';
    if (modelType === 'gemini') {
      const img = await callGemini(prompt, images, label);
      return { img, engine: 'gemini' };
    }
    return { img: await callCustomModel(prompt, images, label), engine: 'custom' };
  }

  // ---- Call Video Model API (user-pasted, generic image-to-video) ----
  async function callVideoModel(imageUrls, onProgress) {
    const s = getSettings();
    const endpoint = (s.videoEndpoint || '').trim();
    const key = (s.videoKey || '').trim();

    if (!endpoint) {
      return { status: 'skipped', message: 'Chưa cấu hình model video — dùng slideshow tự động.' };
    }

    onProgress && onProgress('Đang gửi ảnh đến model video…');

    // Generic request: send first image + a motion prompt.
    // Most image-to-video APIs accept { image, prompt }. User fine-tunes per provider.
    const body = {
      image: imageUrls[0],
      images: imageUrls,
      prompt: s.videoMotionPrompt || 'Chuyển động nhẹ nhàng, camera lia chậm quanh người mẫu, phong cách quảng cáo thời trang',
      duration: 8
    };

    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = 'Bearer ' + key;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        return { status: 'error', message: 'Model video lỗi ' + resp.status + ': ' + t.slice(0, 160) };
      }
      const data = await resp.json().catch(() => ({}));
      // Try common response shapes for a video URL
      const url = data.video_url || data.videoUrl || data.url ||
        data.output?.video_url || data.output?.[0] || data.data?.video_url || null;
      if (url) return { status: 'ok', url };
      return { status: 'pending', message: 'Model nhận yêu cầu nhưng không trả URL video trực tiếp. Kiểm tra định dạng response của provider.', raw: data };
    } catch (e) {
      return { status: 'error', message: 'Không gọi được model video: ' + e.message };
    }
  }

  // ---- Main orchestrator: hook + full prompts → 2 images ----
  async function generate(inputs, onProgress) {
    onProgress('loading_config', 'Đang tải cấu hình…');
    const cfg = await loadConfig();

    onProgress('building_prompt', 'Đang xây dựng prompt Hook + Full…');
    const prompts = buildPrompts(cfg, inputs);
    console.log('[StyleReel] Hook prompt:', prompts.hook);
    console.log('[StyleReel] Full prompt:', prompts.full);

    onProgress('collecting_images', 'Đang chuẩn bị ảnh tham khảo…');
    
    // Collect individual image refs
    const productFiles = await collectProductImages(inputs);
    const kolHookRef = await kolRef(inputs.kolHookImg, 'KOL Hook');
    const kolFullRef = await kolRef(inputs.kolFullImg, 'KOL Full body');
    const bgRef = inputs.backgroundImage ? await kolRef(inputs.backgroundImage, 'Phông nền') : null;

    // Build refs in EXACT order each prompt expects
    let hookRefs = [];
    let fullRefs = [];

    if (inputs.uploadMode === 'full_set') {
      // full_set.hook: [Phông nền, Sản phẩm cả bộ, KOL Hook]
      if (bgRef) hookRefs.push(bgRef);
      hookRefs = hookRefs.concat(productFiles); // sản phẩm cả bộ
      if (kolHookRef) hookRefs.push(kolHookRef);

      // full_set.full: [KOL Full, Sản phẩm cả bộ]
      if (kolFullRef) fullRefs.push(kolFullRef);
      fullRefs = fullRefs.concat(productFiles);
    } else {
      // separate.hook: [Phông nền, KOL Hook, Quần, Áo]
      if (bgRef) hookRefs.push(bgRef);
      if (kolHookRef) hookRefs.push(kolHookRef);
      // productFiles: [Áo, Quần] or [Quần, Áo] — need bottom first then top
      const bottomFile = productFiles.find(f => f.role.includes('quần') || f.role.includes('Quần'));
      const topFile = productFiles.find(f => f.role.includes('áo') || f.role.includes('Áo'));
      if (bottomFile) hookRefs.push(bottomFile);
      if (topFile) hookRefs.push(topFile);

      // separate.full: [KOL Full, Áo, Quần]
      if (kolFullRef) fullRefs.push(kolFullRef);
      if (topFile) fullRefs.push(topFile);
      if (bottomFile) fullRefs.push(bottomFile);
    }

    console.log('[StyleReel] Mode:', inputs.uploadMode);
    console.log('[StyleReel] Hook refs:', hookRefs.length, hookRefs.map(r=>r.role));
    console.log('[StyleReel] Full refs:', fullRefs.length, fullRefs.map(r=>r.role));

    const s = getSettings();
    const modelType = (cfg.model && cfg.model.type) || 'custom';
    const engineName = (cfg.model && cfg.model.name) ? cfg.model.name : (modelType === 'gemini' ? 'Gemini' : 'API của bạn');

    // Image 1: HOOK
    // Prepend actual image info so Gemini knows exactly what's sent
    let hookPromptFinal = prompts.hook;
    let fullPromptFinal = prompts.full;
    if (hookRefs.length > 0) {
      const hookNote = '[ACTUAL IMAGES ATTACHED: ' + hookRefs.length + ' images in order: ' + hookRefs.map((r, i) => 'Image ' + (i+1) + '=' + r.role).join(', ') + ']\n\n';
      hookPromptFinal = hookNote + hookPromptFinal;
    }
    if (fullRefs.length > 0) {
      const fullNote = '[ACTUAL IMAGES ATTACHED: ' + fullRefs.length + ' images in order: ' + fullRefs.map((r, i) => 'Image ' + (i+1) + '=' + r.role).join(', ') + ']\n\n';
      fullPromptFinal = fullNote + fullPromptFinal;
    }

    onProgress('gen_hook', 'Đang tạo ảnh Hook qua ' + engineName + '…');
    const r1 = await generateImage(hookPromptFinal, hookRefs, 'hook');

    // Image 2: FULL
    onProgress('gen_full', 'Đang tạo ảnh Full sản phẩm qua ' + engineName + '…');
    const r2 = await generateImage(fullPromptFinal, fullRefs, 'full');

    return {
      images: [r1.img, r2.img],
      engine: r1.engine,
      engineName,
      prompts,
      // Combined prompt text for debug box (show actual prompts sent including image notes)
      prompt: '【 HOOK — ' + hookRefs.length + ' ảnh: ' + hookRefs.map(r=>r.role).join(', ') + ' 】\n' + hookPromptFinal + '\n\n━━━━━━━━━━━━━━━━━━\n\n【 FULL — ' + fullRefs.length + ' ảnh: ' + fullRefs.map(r=>r.role).join(', ') + ' 】\n' + fullPromptFinal
    };
  }

  // ---- Public API ----
  return {
    getSettings,
    saveSettings,
    loadConfig,
    buildPrompt,
    buildPrompts,
    generate,
    callVideoModel,

  };
})();

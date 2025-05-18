document.addEventListener("DOMContentLoaded", async () => {

  /* ========== 1.  DÁTA Z HTML ====================================== */
  const dataHolder = document.getElementById("processed-image-data");
  if (!dataHolder) return;

  let data;
  try { data = JSON.parse(dataHolder.dataset.json); }
  catch (e) { console.error("Chybný JSON:", e); return; }

  /* ========== 2.  DOM PRVKY ======================================== */
  const canvas   = document.getElementById("canvas");
  const ctx      = canvas.getContext("2d");
  const swMain   = document.getElementById("overlay-switch");
  const colMain  = document.getElementById("mask-color");

  const modal    = document.getElementById("img-modal");
  const mCanvas  = document.getElementById("modal-canvas");
  const mCtx     = mCanvas.getContext("2d");
  const swModal  = document.getElementById("modal-overlay-switch");
  const colModal = document.getElementById("modal-mask-color");

  /* ========== 3.  TEXTY ============================================ */
  document.getElementById("detail-method").textContent = data.method || "-";
  document.getElementById("detail-status").textContent = data.status || "-";
  document.getElementById("detail-date").textContent   = fmtDate(data.created_at);
  document.getElementById("detail-answer").textContent = data.answer || "-";

  const backLink = document.getElementById("original-photo-link");
  if (data.original_photo_id)
    backLink.href = `/photos/detail/${data.original_photo_id}`;
  else
    backLink.style.display = "none";

  /* ========== 4.  OBRÁZOK + MASKA ================================== */
  const baseImg = await loadImage(data.original_image.url);
  const mask    = await decodeTifMask(data.url);

  /* ========== 5.  ULOŽENÁ FARBA ==================================== */
  const COLOR_KEY = "maskColor";
  const savedColor = localStorage.getItem(COLOR_KEY) || "#ffffff";
  colMain.value = colModal.value = savedColor;
  let tintedMask = tintMask(mask, savedColor);

  /* ========== 6.  KRESLENIE ======================================== */
  function draw(ctxDest, w, h, showMask, tint) {
    ctxDest.clearRect(0, 0, w, h);
    ctxDest.drawImage(baseImg, 0, 0, w, h);
    if (showMask) ctxDest.drawImage(tint, 0, 0, w, h);
  }

  canvas.width  = baseImg.width;
  canvas.height = baseImg.height;
  draw(ctx, canvas.width, canvas.height, swMain.checked, tintedMask);

  /* ========== 7.  EVENTY =========================================== */

  /* -- prepínanie masky v náhľade -- */
  swMain.addEventListener("change", () =>
    draw(ctx, canvas.width, canvas.height, swMain.checked, tintedMask));

  /* -- zmena farby -- */
  function updateColor(hex) {
    localStorage.setItem(COLOR_KEY, hex);
    colMain.value = colModal.value = hex;
    tintedMask = tintMask(mask, hex);
    draw(ctx, canvas.width, canvas.height, swMain.checked, tintedMask);
    if (modal.classList.contains("open"))
      draw(mCtx, mCanvas.width, mCanvas.height, swModal.checked, tintedMask);
  }
  colMain.addEventListener("input", e => updateColor(e.target.value));
  colModal.addEventListener("input", e => updateColor(e.target.value));

  /* -- otvorenie modalu -- */
  canvas.parentElement.addEventListener("click", () => {
    modal.classList.add("open");
    mCanvas.width  = baseImg.width;
    mCanvas.height = baseImg.height;
    draw(mCtx, mCanvas.width, mCanvas.height, swModal.checked, tintedMask);
  });

  /* -- zatvorenie modalu (krížik) -- */
  document.getElementById("modal-close")
          .addEventListener("click", () => modal.classList.remove("open"));

  /* -- klik mimo obrázka -- */
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });

  /* -- Esc zatvára modal -- */
  document.addEventListener("keydown", e=>{
    if (e.key === "Escape" && modal.classList.contains("open"))
      modal.classList.remove("open");
  });

  /* -- prepnutie masky v modale -- */
  swModal.addEventListener("change", () =>
    draw(mCtx, mCanvas.width, mCanvas.height, swModal.checked, tintedMask));

  /* -- odkryť UI -- */
  document.querySelector(".processed-image-container")
          .classList.remove("hidden-js");
});

/* ==================================================================== */
/*  POMOCNÉ FUNKCIE                                                      */
/* ==================================================================== */

function fmtDate(str){
  if(!str) return "-";
  return new Date(str).toLocaleDateString("sk-SK",{
    day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"
  });
}

function loadImage(url){
  return new Promise((res,rej)=>{
    const i=new Image();
    i.onload =()=>res(i);
    i.onerror=()=>rej(new Error("Image load error"));
    i.src=url;
  });
}

function tintMask(srcCanvas, hex){
  const c = document.createElement("canvas");
  c.width  = srcCanvas.width;
  c.height = srcCanvas.height;
  const cx = c.getContext("2d");
  cx.drawImage(srcCanvas,0,0);
  cx.globalCompositeOperation="source-in";
  cx.fillStyle = hex;
  cx.fillRect(0,0,c.width,c.height);
  return c;
}

async function decodeTifMask(url){
  if(typeof UTIF==="undefined") throw new Error("UTIF.js missing");

  const buf  = await fetch(url).then(r=>r.arrayBuffer());
  const ifds = UTIF.decode(buf);
  UTIF.decodeImage(buf, ifds[0]);

  const rgba = UTIF.toRGBA8(ifds[0]);
  const w    = Number(ifds[0].width);
  const h    = Number(ifds[0].height);

  const c  = document.createElement("canvas");
  c.width  = w; c.height = h;
  const cx = c.getContext("2d");
  const img= cx.createImageData(w,h);

  for(let i=0;i<w*h;i++){
    img.data[i*4+3] = rgba[i*4] > 128 ? 255 : 0;   // alfa
  }
  cx.putImageData(img,0,0);
  return c;
}

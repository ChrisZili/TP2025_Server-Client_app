document.addEventListener("DOMContentLoaded", async () => {
  const parts = window.location.pathname.split("/");
  const messageId = parts[2];

  try {
    const response = await fetch(`/spravy/${messageId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include"
    });

    if (!response.ok) throw new Error("Nepodarilo sa načítať správu.");

    const message = await response.json();

    document.getElementById("sender-email").textContent = message.sender_email || "-";
    document.getElementById("recipient-email").textContent = message.recipient_email || "-";
    document.getElementById("timestamp").textContent = new Date(message.timestamp).toLocaleString('sk-SK');
    document.getElementById("message-content").textContent = message.content || "";

    // Reveal hidden content
    document.querySelectorAll(".hidden-js").forEach(el => {
      el.classList.remove("hidden-js");
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });

    // Display images if available
    if (message.images && message.images.length > 0) {
      const imagesContainer = document.getElementById("message-images");
      console.log("Images to display:", message.images); // Debug output

      message.images.forEach((imgFilename) => {
        console.log("Adding image with src:", `/${imgFilename}`); // Debug each filename

        const img = document.createElement("img");
        img.src = `/${imgFilename}`;

        img.alt = "Príloha správy";
        img.classList.add("message-image");
        imagesContainer.appendChild(img);
      });
    }

  } catch (err) {
    console.error("Chyba pri načítaní správy:", err);
    alert(err.message || "Nepodarilo sa načítať správu.");
  }
  initLightbox();

});

//galeria obrazkov
function initLightbox() {
  const images = Array.from(document.querySelectorAll('.message-image'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  let currentIndex = 0;

  function updateArrows() {
    // Hide both arrows if only one image
    if (images.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }

    // Hide prev if at first image
    prevBtn.style.display = (currentIndex === 0) ? 'none' : 'block';
    // Hide next if at last image
    nextBtn.style.display = (currentIndex === images.length - 1) ? 'none' : 'block';
  }

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightbox.classList.remove('hidden');
    updateArrows();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      lightboxImg.src = images[currentIndex].src;
      updateArrows();
    }
  }

  function showNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      lightboxImg.src = images[currentIndex].src;
      updateArrows();
    }
  }

  images.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.onclick = () => openLightbox(i);
  });

  closeBtn.onclick = closeLightbox;
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;

  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target === closeBtn) closeLightbox();
  };

  document.onkeydown = (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'ArrowRight') showNext();
  };
}


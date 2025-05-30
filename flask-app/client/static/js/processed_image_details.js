document.addEventListener("DOMContentLoaded", function() {
  console.log("Processed image details script loaded");

  // Toggle image functionality
  const container = document.querySelector('.processed-image-container');
  const originalImage = document.getElementById('original-image');
  const processedImage = document.getElementById('processed-image');
  const imageToggle = document.getElementById('image-toggle');
  const originalLabel = document.querySelector('.switch-label:first-child');
  const processedLabel = document.querySelector('.switch-label:last-child');

  // JSON Modal Variables
  const jsonModal = document.getElementById('json-modal');
  const showJsonBtn = document.getElementById('show-json-btn');
  const closeJsonBtn = document.querySelector('.close-modal');
  const jsonContent = document.getElementById('json-content');
  const dataHolder = document.getElementById('processed-image-data');

  // Debug logging for troubleshooting
  console.log("JSON Modal Elements:", {
    modal: jsonModal ? "Found" : "Missing",
    button: showJsonBtn ? "Found" : "Missing",
    closeBtn: closeJsonBtn ? "Found" : "Missing",
    content: jsonContent ? "Found" : "Missing",
    dataHolder: dataHolder ? "Found" : "Missing"
  });

  if (dataHolder) {
    console.log("Data attribute exists:", dataHolder.hasAttribute('data-json'));
  }

  // Image Toggle Functionality
  if (originalImage && processedImage && imageToggle) {
    // Set initial state
    originalImage.style.opacity = '1';
    processedImage.style.opacity = '0';

    // Add toggle event
    imageToggle.addEventListener('change', function() {
      if (this.checked) {
        originalImage.style.opacity = '0';
        processedImage.style.opacity = '1';
      } else {
        originalImage.style.opacity = '1';
        processedImage.style.opacity = '0';
      }
    });
  }

  // JSON Modal Functionality
  if (showJsonBtn && jsonModal && closeJsonBtn && jsonContent) {
    console.log("Setting up JSON modal functionality");

    // Function to apply syntax highlighting to the pre-rendered JSON
    function highlightJSON() {
      try {
        // Only apply highlighting if not already applied
        if (jsonContent.classList.contains('highlighted')) return;

        // Get the text content as it's already properly formatted JSON
        const jsonText = jsonContent.textContent;

        // Apply simple syntax highlighting
        const highlighted = jsonText.replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'json-key';
              } else {
                cls = 'json-string';
              }
            } else if (/true|false/.test(match)) {
              cls = 'json-boolean';
            } else if (/null/.test(match)) {
              cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
          }
        );

        jsonContent.innerHTML = highlighted;
        jsonContent.classList.add('highlighted');
      } catch (e) {
        console.error("Error highlighting JSON:", e);
        // On error, keep the original content
      }
    }

    // Show modal on button click
    showJsonBtn.addEventListener('click', function() {
      console.log("JSON button clicked");
      jsonModal.classList.remove('hidden');

      // Apply syntax highlighting when showing the modal
      highlightJSON();
    });

    // Close modal when clicking the X
    closeJsonBtn.addEventListener('click', function() {
      console.log("Close button clicked");
      jsonModal.classList.add('hidden');
    });

    // Close when clicking outside modal
    jsonModal.addEventListener('click', function(event) {
      if (event.target === jsonModal) {
        jsonModal.classList.add('hidden');
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !jsonModal.classList.contains('hidden')) {
        jsonModal.classList.add('hidden');
      }
    });
  }

  // Make container visible when everything is ready
  if (container && container.classList.contains('hidden-js')) {
    container.classList.remove('hidden-js');
  }
});
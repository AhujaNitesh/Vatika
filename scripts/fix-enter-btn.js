const fs = require('fs');

['neuro', 'skincare', 'immunity', 'respiratory', 'digestive'].forEach(m => {
  const filePath = 'assets/maps/' + m + '/index.html';
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure enterBtn works cleanly
  const targetStr = "document.getElementById('enterBtn').addEventListener('click', () => {";
  const replacementStr = `const enterBtnEl = document.getElementById('enterBtn');
      if (enterBtnEl) {
        enterBtnEl.onclick = function() {
          const ov = document.getElementById('startOverlay');
          if (ov) { ov.style.display = 'none'; ov.classList.add('hidden'); }
          try { if (canvas) canvas.requestPointerLock(); } catch(e){}
          try { initAudioEngine(); } catch(e){}
        };
      }
      document.getElementById('enterBtn').addEventListener('click', () => {`;

  if (content.includes(targetStr) && !content.includes('enterBtnEl.onclick')) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed Enter Sanctuary Grounds button in:', filePath);
  }
});

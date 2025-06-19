// src/darkMode.ts
// Applica la dark mode in base all'orario locale (20:00–7:00)
export function applyAutoDarkMode() {
  const hour = new Date().getHours();
  const isDark = hour >= 20 || hour < 7;
  document.body.classList.toggle('dark', isDark);
}

// Rende la funzione accessibile globalmente per richiamo da altri componenti
if (typeof window !== 'undefined') {
  (window as any).applyAutoDarkMode = applyAutoDarkMode;
}

// Esegui subito e ogni ora
applyAutoDarkMode();
setInterval(applyAutoDarkMode, 60 * 60 * 1000);

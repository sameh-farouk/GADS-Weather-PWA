let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  let installButton = document.querySelector("#install");
  
  installButton.addEventListener('click', (e) => {
    deferredPrompt.prompt();
    deferredPrompt = null;
    installButton.hidden = true;
  });
  installButton.hidden = false;
});
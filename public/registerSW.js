// Service Worker Registration Script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW Registration] Service Worker registered successfully:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[SW Registration] New service worker available');
              
              // Show update notification (optional)
              if (confirm('A new version of Vision Gems Manager is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Handle controller change (when new SW takes control)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            console.log('[SW Registration] New service worker activated, reloading...');
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.error('[SW Registration] Service Worker registration failed:', error);
      });
  });
} else {
  console.warn('[SW Registration] Service Workers are not supported in this browser');
}



import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Install QuickBites</h3>
            <p className="text-sm text-gray-600">
              Tap <span className="inline-block">
                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </span> then "Add to Home Screen"
            </p>
          </div>
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (isInstalled) return null;

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/icons/icon-192x192.png" 
            alt="QuickBites" 
            className="w-12 h-12 rounded-xl"
          />
          <div>
            <h3 className="font-semibold text-gray-900">Install QuickBites</h3>
            <p className="text-sm text-gray-600">Add to your home screen for quick access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallButton(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-quick-brown text-white rounded-lg text-sm hover:bg-amber-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt; 
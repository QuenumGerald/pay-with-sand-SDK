// This file silences MetaMask console errors related to chrome.runtime.sendMessage

// Store the original console.error
const originalError = console.error;

// Override console.error to filter out MetaMask errors
console.error = (...args: any[]) => {
  const metamaskErrors = [
    'chrome.runtime.sendMessage called from a webpage must specify an Extension ID',
    'Error in invocation of runtime.sendMessage'
  ];
  
  const isMetamaskError = metamaskErrors.some(error => 
    args.some(arg => typeof arg === 'string' && arg.includes(error))
  );
  
  // Only log non-MetaMask errors
  if (!isMetamaskError) {
    originalError.apply(console, args);
  }
};

// Also handle uncaught exceptions
const originalOnError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
  const isMetamaskError = message && 
    typeof message === 'string' && 
    message.includes('chrome.runtime.sendMessage');
  
  if (!isMetamaskError && originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false; // Don't suppress other errors
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const isMetamaskError = event.reason && 
    typeof event.reason.message === 'string' && 
    event.reason.message.includes('chrome.runtime.sendMessage');
  
  if (!isMetamaskError) {
    // Re-throw non-MetaMask errors
    throw event.reason;
  }
  
  // Prevent the default handler from running
  event.preventDefault();
});

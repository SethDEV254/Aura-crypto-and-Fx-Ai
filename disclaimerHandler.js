/**
 * disclaimerHandler.js
 * Handles the risk disclaimer modal functionality
 */

// Wait for DOM to be ready and app.js to load
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for app.js to initialize
  setTimeout(initializeDisclaimer, 100);
});

function initializeDisclaimer() {
  // Get DOM elements
  const els = {
    riskDisclaimerModal: document.getElementById('risk-disclaimer-modal'),
    disclaimerAcceptCheckbox: document.getElementById('disclaimer-accept-checkbox'),
    disclaimerAcceptBtn: document.getElementById('disclaimer-accept-btn'),
    terminalCommandLine: document.getElementById('terminal-command-line')
  };

  // Check if user has accepted the risk disclaimer
  function checkRiskDisclaimerStatus() {
    const disclaimerAccepted = localStorage.getItem('auraRiskDisclaimerAccepted');
    
    if (disclaimerAccepted === 'true') {
      // User has already accepted, no need to show again
      return;
    }
    
    // Bind disclaimer events
    bindDisclaimerEvents();
  }

  // Bind event listeners for disclaimer modal
  function bindDisclaimerEvents() {
    // Enable/disable accept button based on checkbox
    if (els.disclaimerAcceptCheckbox) {
      els.disclaimerAcceptCheckbox.addEventListener('change', (e) => {
        if (els.disclaimerAcceptBtn) {
          els.disclaimerAcceptBtn.disabled = !e.target.checked;
        }
      });
    }

    // Handle accept button click
    if (els.disclaimerAcceptBtn) {
      els.disclaimerAcceptBtn.addEventListener('click', () => {
        acceptRiskDisclaimer();
      });
    }
  }

  // Show the risk disclaimer modal
  function showRiskDisclaimerModal() {
    if (els.riskDisclaimerModal) {
      els.riskDisclaimerModal.classList.remove('hidden');
      if (els.terminalCommandLine) {
        els.terminalCommandLine.innerText = `AURA LEGAL: Please read and accept the risk disclaimer before running analysis.`;
      }
      
      // Reset checkbox and button state
      if (els.disclaimerAcceptCheckbox) {
        els.disclaimerAcceptCheckbox.checked = false;
      }
      if (els.disclaimerAcceptBtn) {
        els.disclaimerAcceptBtn.disabled = true;
      }
      
      // Scroll to top of disclaimer content
      const scrollContent = els.riskDisclaimerModal.querySelector('.disclaimer-scroll-content');
      if (scrollContent) {
        scrollContent.scrollTop = 0;
      }
    }
  }

  // Accept the risk disclaimer and save to localStorage
  function acceptRiskDisclaimer() {
    // Save acceptance to localStorage
    localStorage.setItem('auraRiskDisclaimerAccepted', 'true');
    localStorage.setItem('auraRiskDisclaimerDate', new Date().toISOString());
    
    // Hide modal
    if (els.riskDisclaimerModal) {
      els.riskDisclaimerModal.classList.add('hidden');
    }
    
    // Show confirmation
    if (els.terminalCommandLine) {
      els.terminalCommandLine.innerText = `AURA LEGAL: Risk disclaimer accepted. You may now proceed with analysis.`;
    }
    
    // Flash confirmation if function exists
    if (typeof flashTerminalConfirmation === 'function') {
      flashTerminalConfirmation('DISCLAIMER ACCEPTED');
    }
    
    // Automatically trigger the scan that was attempted
    setTimeout(() => {
      if (typeof triggerAIScanWorkflow === 'function') {
        triggerAIScanWorkflow();
      }
    }, 500);
  }

  // Override the global triggerAIScanWorkflow function
  function overrideScanWorkflow() {
    // Store original function if it exists
    if (typeof window.triggerAIScanWorkflow === 'function') {
      window.originalTriggerAIScanWorkflow = window.triggerAIScanWorkflow;
    }
    
    // Create new function that checks disclaimer first
    window.triggerAIScanWorkflow = function() {
      // Check if disclaimer has been accepted
      const disclaimerAccepted = localStorage.getItem('auraRiskDisclaimerAccepted');
      
      if (disclaimerAccepted !== 'true') {
        // Show disclaimer modal first
        showRiskDisclaimerModal();
        return;
      }
      
      // Proceed with original scan workflow if it exists
      if (typeof window.originalTriggerAIScanWorkflow === 'function') {
        return window.originalTriggerAIScanWorkflow.apply(this, arguments);
      }
    };
  }

  // Initialize disclaimer system
  checkRiskDisclaimerStatus();
  
  // Wait for app.js to fully load, then override the scan function
  setTimeout(overrideScanWorkflow, 500);

  // Make functions globally available for debugging
  window.showRiskDisclaimerModal = showRiskDisclaimerModal;
  window.acceptRiskDisclaimer = acceptRiskDisclaimer;
}
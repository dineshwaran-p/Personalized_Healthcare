// Pendo Track Event helpers.
//
// The Pendo agent is loaded globally as `window.pendo`. These wrappers are
// no-ops while the agent is not on the page and never throw, so analytics can
// never break the user flows they instrument.

export const trackPendoEvent = (eventName, properties = {}) => {
  try {
    if (typeof window.pendo?.track === 'function') {
      window.pendo.track(eventName, properties);
    }
  } catch (error) {
    console.error(`Pendo track failed for "${eventName}":`, error);
  }
};

// Associates the current and subsequent events with an authenticated visitor.
export const identifyPendoVisitor = (visitorId) => {
  if (!visitorId) return;
  try {
    if (typeof window.pendo?.identify === 'function') {
      window.pendo.identify({ visitor: { id: String(visitorId) } });
    }
  } catch (error) {
    console.error('Pendo identify failed:', error);
  }
};

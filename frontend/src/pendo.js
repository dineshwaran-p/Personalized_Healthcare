// Novus by Pendo visitor lifecycle. The install snippet in index.html defines
// window.pendo and main.jsx initializes it once at boot. These helpers run
// inside the app's sign-in and sign-out flows, so they must never throw.

// Identify the signed-in user, shaped like the POST /login response `user`.
export function identifyPendoVisitor(user) {
  if (!window.pendo || !user?.id) return;
  window.pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

// Re-identify a session restored from its JWT on page load. The token only
// carries `id`, so the other fields come from the login response AuthPage
// saves in localStorage, and only when that response is for the same user.
export function identifyPendoVisitorFromToken(tokenData) {
  const id = tokenData?.id;
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    // Unreadable entry: identify by the token's id alone.
  }
  identifyPendoVisitor(storedUser?.id === id ? storedUser : { id });
}

// Reset to a fresh anonymous visitor on sign-out. clearSession is not stubbed
// by the install snippet, so it only exists once the agent script has loaded.
export function clearPendoSession() {
  if (typeof window.pendo?.clearSession === "function") {
    window.pendo.clearSession();
  }
}

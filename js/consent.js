/* Cookie consent + Google Analytics loader.
   Shared, lightweight version for pages that don't need the full main.js
   (privacy-policy.html, 404.html). The homepage (index.html) has this same
   logic built into main.js — kept here too so every page behaves
   consistently and a visitor's consent choice is respected everywhere. */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const CONSENT_KEY = 'celeste-cookie-consent';
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  const loadGoogleAnalytics = () => {
    const id = window.GA_MEASUREMENT_ID;
    if (!id || id === 'G-C8ZLL73DG9' || window.__gaLoaded) return;
    window.__gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  };

  const getStoredConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (_error) {
      return null;
    }
  };

  const storeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // If storage is blocked, the banner will simply reappear next visit.
    }
  };

  const hideConsentBanner = () => cookieBanner?.setAttribute('hidden', '');
  const showConsentBanner = () => cookieBanner?.removeAttribute('hidden');

  window.showCookiePreferences = () => showConsentBanner();

  document.getElementById('cookie-preferences-link')?.addEventListener('click', () => {
    window.showCookiePreferences();
  });

  const existingConsent = getStoredConsent();
  if (existingConsent === 'accepted') {
    loadGoogleAnalytics();
  } else if (existingConsent !== 'declined') {
    showConsentBanner();
  }

  cookieAccept?.addEventListener('click', () => {
    storeConsent('accepted');
    hideConsentBanner();
    loadGoogleAnalytics();
  });

  cookieDecline?.addEventListener('click', () => {
    storeConsent('declined');
    hideConsentBanner();
  });
});

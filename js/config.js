/* Google Analytics 4 configuration.
   REPLACE THE ID BELOW WITH YOUR OWN.
   Get it from analytics.google.com: create a GA4 property for this site,
   then Admin > Data Streams > (your web stream) > Measurement ID.
   It looks like "G-C8ZLL73DG9".

   This lives in its own external file (rather than an inline <script> tag)
   because the site's Content-Security-Policy intentionally does not allow
   'unsafe-inline' for scripts — that's what actually blocks malicious
   injected scripts from running if the site is ever compromised. An
   external same-origin file like this one is allowed by 'self' and keeps
   that protection intact. */
window.GA_MEASUREMENT_ID = "G-C8ZLL73DG9";

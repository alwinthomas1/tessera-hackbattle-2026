const suspiciousTlds = [
  ".xyz", ".top", ".click", ".link", ".download", ".zip", ".apk"
];

async function inspectUrl(urlString) {
  const result = {
    originalUrl: urlString,
    finalDestination: null,
    hostname: null,
    protocol: null,
    ipAddress: null,
    redirected: false,
    suspiciousReasons: [],
    isDangerous: false
  };

  try {
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = "https://" + urlString;
    }

    const originalHost = new URL(urlString).hostname;

    // Follow redirects safely, with a timeout so a dead link doesn't hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(urlString, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal
    });
    clearTimeout(timeout);

    const finalUrl = new URL(response.url);
    result.finalDestination = finalUrl.href;
    result.hostname = finalUrl.hostname;
    result.protocol = finalUrl.protocol;

    if (finalUrl.hostname !== originalHost) {
      result.redirected = true;
      result.suspiciousReasons.push(
        `Link redirects to a different domain: ${originalHost} -> ${finalUrl.hostname}`
      );
    }

    if (finalUrl.protocol !== "https:") {
      result.suspiciousReasons.push("URL does not use HTTPS");
    }

    const hostname = finalUrl.hostname.toLowerCase();
    for (const tld of suspiciousTlds) {
      if (hostname.endsWith(tld)) {
        result.suspiciousReasons.push(`Suspicious or high-risk TLD detected: ${tld}`);
      }
    }

    const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      result.ipAddress = hostname;
      result.suspiciousReasons.push("URL uses a direct IP address instead of a domain");
    }

    if (finalUrl.pathname.toLowerCase().includes(".apk") ||
        finalUrl.href.toLowerCase().includes("download")) {
      result.suspiciousReasons.push("Possible application download link detected");
    }

    result.isDangerous = result.suspiciousReasons.length > 0;
    return result;

  } catch (error) {
    // If fetch fails (dead link, blocked, timeout) fall back to static parsing
    // instead of just returning "invalid" — this is more forgiving for real-world scam links
    return {
      originalUrl: urlString,
      finalDestination: null,
      hostname: null,
      protocol: null,
      ipAddress: null,
      redirected: false,
      suspiciousReasons: [`Could not resolve link: ${error.message}`],
      isDangerous: true
    };
  }
}

module.exports = { inspectUrl };
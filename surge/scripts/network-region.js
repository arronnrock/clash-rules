// Surge event script: keep WIFI on PROXY in mainland China and DIRECT elsewhere.
// Both network-changed and engine-started point to this same script.

const GROUP = "WIFI";
const GEO_URL = "https://www.cloudflare.com/cdn-cgi/trace";

function finish(message) {
  if (message) {
    console.log(message);
    if ($surge && typeof $surge.logbook === "function") {
      $surge.logbook(message);
    }
  }
  $done();
}

function currentSelection() {
  try {
    const details = $surge.selectGroupDetails();
    return details && details.decisions ? details.decisions[GROUP] : null;
  } catch (_) {
    return null;
  }
}

$httpClient.get(
  {
    url: GEO_URL,
    policy: "DIRECT",
    timeout: 5,
    headers: { "User-Agent": "Surge-Network-Region/1.0" },
  },
  (error, response, data) => {
    if (error || !response || response.status !== 200 || typeof data !== "string") {
      finish(`Region detection failed; WIFI unchanged (${currentSelection() || "unknown"})`);
      return;
    }

    const match = data.match(/^loc=([A-Z]{2})$/m);
    if (!match) {
      finish(`Region response missing country; WIFI unchanged (${currentSelection() || "unknown"})`);
      return;
    }

    const country = match[1];
    let target;
    let regionClass;
    if (country === "CN") {
      target = "PROXY";
      regionClass = "mainland China";
    } else if (country === "HK" || country === "MO") {
      target = "DIRECT";
      regionClass = "Hong Kong/Macau";
    } else {
      target = "DIRECT";
      regionClass = "overseas";
    }
    const current = currentSelection();

    if (current === target) {
      finish(`DIRECT egress ${country} (${regionClass}); WIFI remains ${target}`);
      return;
    }

    const changed = $surge.setSelectGroupPolicy(GROUP, target);
    if (!changed) {
      finish(`DIRECT egress ${country} (${regionClass}); unable to switch WIFI, kept ${current || "unknown"}`);
      return;
    }

    finish(`DIRECT egress ${country} (${regionClass}); WIFI switched ${current || "unknown"} -> ${target}`);
  },
);

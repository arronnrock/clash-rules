const marker =
  "# Proxy policies are injected by the private Sub-Store Surge output.";
const nodes = await produceArtifact({
  type: "collection",
  name: "private",
  platform: "Surge",
});

if (!$content.includes(marker)) {
  throw new Error("Surge proxy marker not found");
}

$content = $content.replace(marker, String(nodes).trim());

if ($options) {
  $options._res = {
    headers: {
      "profile-update-interval": 24,
    },
  };
}

function filterOutliers(prices) {
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const threshold = avg * 0.2;
  return prices.filter(p => Math.abs(p - avg) <= threshold);
}

function computeFinalPrice(prices) {
  const filtered = filterOutliers(prices);
  if (filtered.length === 0) throw new Error("All sources are outliers.");
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

module.exports = { computeFinalPrice };

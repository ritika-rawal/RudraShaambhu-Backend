export function reduceToSingleDigit(value) {
  let total = Number(value);

  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }

  while (total > 9) {
    total = Math.floor(total / 10) + (total % 10);
  }

  return total;
}

export function calculateNameNumerology(name) {
  const mapping = {
    a: 1, i: 1, j: 1, q: 1, y: 1,
    b: 2, k: 2, r: 2,
    c: 3, g: 3, l: 3, s: 3,
    d: 4, m: 4, t: 4,
    e: 5, h: 5, n: 5, x: 5,
    u: 6, v: 6, w: 6,
    o: 7, z: 7,
    f: 8, p: 8
  };

  let sum = 0;
  for (const char of name.toLowerCase()) {
    if (mapping[char]) {
      sum += mapping[char];
    }
  }

  return reduceToSingleDigit(sum);
}

export function getZodiac(month, day) {
  const signs = [
    "capricorn", "aquarius", "pisces", "aries", "taurus", "gemini",
    "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius"
  ];
  const boundaryDays = [20, 19, 20, 20, 21, 21, 23, 23, 23, 23, 22, 22];

  const monthIndex = Number(month) - 1;
  const dayNum = Number(day);

  if (monthIndex < 0 || monthIndex > 11 || !Number.isInteger(dayNum)) {
    return null;
  }

  if (dayNum < boundaryDays[monthIndex]) {
    return signs[monthIndex];
  }

  return signs[(monthIndex + 1) % 12];
}

import { Product } from "../models/Product.js";
import { calculateNameNumerology, getZodiac, reduceToSingleDigit } from "../utils/numerology.js";

const numberToMukhiMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9
};

const letterMapping = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

function reduceDigit(value) {
  let current = Number(value);

  if (!Number.isFinite(current) || current <= 0) {
    return null;
  }

  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

function getNameNumber(name) {
  const cleaned = String(name || "").toLowerCase();
  let sum = 0;

  for (const char of cleaned) {
    if (letterMapping[char]) {
      sum += letterMapping[char];
    }
  }

  return reduceDigit(sum);
}

function getLifePathNumber(dob) {
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const normalized = parsed.toISOString().slice(0, 10).replaceAll("-", "");
  const total = normalized.split("").reduce((sum, part) => sum + Number(part), 0);
  return reduceDigit(total);
}

function toPayload(product) {
  const json = product.toJSON();
  return {
    ...json,
    id: json.id ?? json._id,
    mukhi: String(json.mukhi)
  };
}

export async function getNameRecommendation(req, res) {
  const name = String(req.query.name || "").trim();

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const nameNumber = getNameNumber(name);
  const mappedMukhi = nameNumber ? numberToMukhiMap[nameNumber] : null;

  if (!mappedMukhi) {
    return res.status(400).json({ message: "could not calculate recommendation for this name" });
  }

  try {
    const items = await Product.find({ mukhi: mappedMukhi }).sort({ rating: -1 });
    return res.json({
      type: "name",
      input: name,
      nameNumber,
      recommendedMukhi: mappedMukhi,
      items: items.map(toPayload)
    });
  } catch (error) {
    return res.status(500).json({ message: "failed to load name recommendations", error: error.message });
  }
}

export async function getDobRecommendation(req, res) {
  const dob = String(req.query.dob || "").trim();

  if (!dob) {
    return res.status(400).json({ message: "dob is required in YYYY-MM-DD format" });
  }

  const lifePathNumber = getLifePathNumber(dob);
  const mappedMukhi = lifePathNumber ? numberToMukhiMap[lifePathNumber] : null;

  if (!mappedMukhi) {
    return res.status(400).json({ message: "invalid dob; expected format YYYY-MM-DD" });
  }

  try {
    const items = await Product.find({ mukhi: mappedMukhi }).sort({ rating: -1 });
    return res.json({
      type: "dob",
      input: dob,
      lifePathNumber,
      recommendedMukhi: mappedMukhi,
      items: items.map(toPayload)
    });
  } catch (error) {
    return res.status(500).json({ message: "failed to load dob recommendations", error: error.message });
  }
}

export async function getNumerologyRecommendation(req, res) {
  const number = Number(req.query.number ?? req.query.value);

  if (!Number.isInteger(number) || number < 1 || number > 9) {
    return res.status(400).json({ message: "number must be an integer between 1 and 9" });
  }

  const mappedMukhi = numberToMukhiMap[number];

  try {
    const items = await Product.find({ mukhi: mappedMukhi }).sort({ rating: -1 });
    return res.json({
      type: "numerology",
      number,
      mukhi: mappedMukhi,
      items: items.map(toPayload)
    });
  } catch (error) {
    return res.status(500).json({ message: "failed to load numerology recommendations", error: error.message });
  }
}

export async function getExploreRecommendation(req, res) {
  const type = String(req.query.type || "").trim();
  const date = String(req.query.date || "").trim();
  const name = String(req.query.name || "").trim();

  if (!["horoscope", "bhagyank", "name"].includes(type)) {
    return res.status(400).json({ message: "type must be horoscope, bhagyank or name" });
  }

  let value = null;
  let label = "";

  if (type === "name") {
    value = calculateNameNumerology(name);
    label = `Numerology ${value}`;
  }

  if (type === "bhagyank") {
    const parts = date.split("-");
    const day = Number(parts[2]);
    value = reduceToSingleDigit(day);
    label = `Lucky Number ${value}`;
  }

  if (type === "horoscope") {
    const parts = date.split("-");
    const zodiac = getZodiac(parts[1], parts[2]);
    const zodiacMap = {
      aries: 3,
      taurus: 5,
      gemini: 4,
      cancer: 2,
      leo: 1,
      virgo: 6,
      libra: 2,
      scorpio: 8,
      sagittarius: 7,
      capricorn: 2,
      aquarius: 9,
      pisces: 6
    };

    if (!zodiac) {
      return res.status(400).json({ message: "invalid date" });
    }

    value = zodiacMap[zodiac] || null;
    label = zodiac.charAt(0).toUpperCase() + zodiac.slice(1);
  }

  if (!value || value < 1 || value > 9) {
    return res.status(400).json({ message: "could not derive recommendation value" });
  }

  try {
    const mappedMukhi = numberToMukhiMap[value];
    const item = await Product.findOne({ mukhi: mappedMukhi }).sort({ rating: -1 });

    if (!item) {
      return res.status(404).json({ message: "no recommendation found" });
    }

    return res.json({ type, label, value, item: toPayload(item) });
  } catch (error) {
    return res.status(500).json({ message: "failed to load explore recommendation", error: error.message });
  }
}

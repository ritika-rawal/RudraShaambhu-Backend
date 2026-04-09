import { calculateLifePath, LIFE_PATH_MEANINGS } from "../utils/lifePath.js";

function isValidDate(day, month, year) {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1) {
    return false;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function getLifePathNumber(req, res) {
  const day = Number(req.body?.day);
  const month = Number(req.body?.month);
  const year = Number(req.body?.year);

  if (!isValidDate(day, month, year)) {
    return res.status(400).json({ message: "Please provide a valid date (day, month, year)." });
  }

  const lifePathNumber = calculateLifePath(day, month, year);

  if (!lifePathNumber || !LIFE_PATH_MEANINGS[lifePathNumber]) {
    return res.status(400).json({ message: "Could not calculate life path number." });
  }

  return res.json({
    lifePathNumber,
    meaning: LIFE_PATH_MEANINGS[lifePathNumber]
  });
}

const MASTER_NUMBERS = new Set([11, 22, 33]);

export function reduceNumber(num) {
  let current = Number(num);

  if (!Number.isInteger(current) || current <= 0) {
    return null;
  }

  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

export function calculateLifePath(day, month, year) {
  const reducedDay = reduceNumber(day);
  const reducedMonth = reduceNumber(month);
  const reducedYear = reduceNumber(year);

  if (!reducedDay || !reducedMonth || !reducedYear) {
    return null;
  }

  const total = reducedDay + reducedMonth + reducedYear;
  return reduceNumber(total);
}

export const LIFE_PATH_MEANINGS = {
  1: "Leader, independent, original thinker.",
  2: "Diplomatic, cooperative, sensitive peacemaker.",
  3: "Creative, expressive, optimistic communicator.",
  4: "Practical, disciplined, reliable builder.",
  5: "Freedom-loving, adventurous, adaptable explorer.",
  6: "Nurturing, responsible, service-oriented protector.",
  7: "Analytical, spiritual, introspective seeker.",
  8: "Ambitious, organized, abundance and power focused.",
  9: "Compassionate, humanitarian, wise old soul.",
  11: "Master visionary: intuitive inspiration and spiritual insight.",
  22: "Master builder: turns big visions into practical reality.",
  33: "Master teacher: compassionate guidance and healing service."
};

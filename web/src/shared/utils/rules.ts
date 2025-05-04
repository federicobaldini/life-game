export enum LifeRule {
  CONWAY = "B3/S23",
  HIGH_LIFE = "B36/S23",
  SEEDS = "B2/S",
  LIFE_WITHOUT_DEATH = "B3/S012345678",
  DAY_AND_NIGHT = "B3678/S34678",
  MORLEY = "B368/S245",
  DIAMOEBA = "B35678/S5678",
  ANNEAL = "B4678/S35678",
  MAZE = "B3/S12345",
  MAZECENTRIC = "B3/S1234",
}

const ruleDensityMap: Record<LifeRule, number> = {
  [LifeRule.CONWAY]: 20,
  [LifeRule.HIGH_LIFE]: 30,
  [LifeRule.SEEDS]: 10,
  [LifeRule.LIFE_WITHOUT_DEATH]: 1,
  [LifeRule.DAY_AND_NIGHT]: 50,
  [LifeRule.MORLEY]: 40,
  [LifeRule.DIAMOEBA]: 48,
  [LifeRule.ANNEAL]: 50,
  [LifeRule.MAZE]: 2,
  [LifeRule.MAZECENTRIC]: 2,
};

export const getDensityForRule = (ruleString: LifeRule): number => {
  return ruleDensityMap[ruleString] ?? 20;
};

/**
 * Converts a rule string like "B36/S23" into two Uint8Arrays
 * @param ruleString Rule string in the format "B.../S..."
 * @returns Tuple of [birthArray, survivalArray]
 */
export const parseRule = (ruleString: string): [Uint8Array, Uint8Array] => {
  const [birthString, survivalString]: Array<string> = ruleString
    .toUpperCase()
    .split("/");
  const birth = new Uint8Array([...birthString.replace("B", "")].map(Number));
  const survival = new Uint8Array(
    [...survivalString.replace("S", "")].map(Number)
  );

  return [birth, survival];
};

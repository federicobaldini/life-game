const ruleDensityMap: Record<string, number> = {
  "B3/S23": 20, // Conway
  "B36/S23": 30, // HighLife
  "B2/S": 10, // Seeds (too dense will explode instantly)
  "B3/S012345678": 1, // Life Without Death
  "B3678/S34678": 50, // Day & Night
  "B368/S245": 40, // Morley
  "B35678/S5678": 48, // Diamoeba
  "B4678/S35678": 50, // Anneal
  "B3/S12345": 2, // Maze
  "B3/S1234": 2, // Mazectric
};

export const getDensityForRule = (ruleString: string): number => {
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

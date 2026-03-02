
import { talentsPart1 } from './talents_part1';
import { talentsPart2 } from './talents_part2';

export const talentData = {
  ...talentsPart1,
  ...talentsPart2
} as const;

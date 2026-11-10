
/**
 * takes and array, picks a random index then returns the item at that index.
 * this is just here to abvoid repetung random pick logic in other seed files.
 */
import { firstNames, lastNames } from './constants.js';

export const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const randomVariant = () => ({
  rounds: randomItem([3, 5, 7]),
  straightsAllowed: randomItem([true, false]),
  timePerRound: randomItem([3, 10, 30])
});

export const generateUsername = (index) => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  return `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${index}`;
};

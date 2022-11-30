import ethers from 'ethers';
import { getRoundTimes, fetchMintBurns } from './helpers.js';

const round = 3;
const { from, to } = getRoundTimes(round);
console.log(`*** Fetching from: ${from}(${new Date(from * 1000)}), to: ${to}(${new Date(to * 1000)})`);

const main = async () => {
  const { mint, burn } = await fetchMintBurns(from, to);

  console.log('Mints', ethers.utils.formatUnits(burn, 30))
  console.log('Burns', ethers.utils.formatUnits(mint, 30))
}

main();

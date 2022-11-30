import ethers from 'ethers';
import { getRoundTimes, fetchGraphReferrals } from './helpers.js';

const round = 5;
const { from, to } = getRoundTimes(round);
console.log(`*** Fetching from: ${from}(${new Date(from * 1000)}), to: ${to}(${new Date(to * 1000)})`);

const main = async () => {
  const { referralStats, referrerStats } = await fetchGraphReferrals(from, to);

  console.log('*** REFERRALS ***')
  // console.log('Referral volume', ethers.utils.formatUnits(referralStats.volume, 30))
  console.log('Total volume', ethers.utils.formatUnits(referrerStats.volume, 30))
  console.log('Total commission', ethers.utils.formatUnits(referrerStats.totalCommissions, 30))
  console.log('Total rebates', ethers.utils.formatUnits(referralStats.totalRebates, 30))
}

main();

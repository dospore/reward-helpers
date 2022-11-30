
import ethers from 'ethers';
import { fetchReferralRound } from './helpers.js';


const main = async () => {
  const rounds = [0, 1, 2, 3, 4, 5, 6, 7];
  let total = ethers.BigNumber.from(0);
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    console.log(`*** Fetching round: ${round}`);
    const { totalRewards, merkleRoot } = await fetchReferralRound(round, true);
    const { totalRewards: totalRewardsDev, merkleRoot: merkleRootDev } = await fetchReferralRound(round, false);

    total = total.add(totalRewards);

    console.log('*** Referral Rewards Prod ***')
    console.log('Total reward', ethers.utils.formatEther(totalRewards))
    console.log(`Merkle root: ${merkleRoot}`);
    console.log()

    console.log('*** Referral Rewards Dev ***')
    console.log('Total reward', ethers.utils.formatEther(totalRewardsDev))
    console.log(`Merkle root: ${merkleRootDev}`);
    console.log()

    if (merkleRootDev === merkleRoot) {
      console.log('Merkle roots match')
      console.log()
    }
  }

  console.log('** All Referral Rewards *** ')
  console.log('Total reward', ethers.utils.formatEther(total))
}

main();

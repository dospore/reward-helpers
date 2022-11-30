
import ethers from 'ethers';
import { fetchTradingRound } from './helpers.js';


const main = async () => {
  // const rounds = [1, 2, 3, 4, 5]
  const rounds = [6, 7]
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    console.log(`*** Fetching round: ${round}`);
    const { totalRewards, fees, volume, merkleRoot } = await fetchTradingRound(round, true);
    const { totalRewards: totalRewardsDev, fees: feesDev, volume: volumeDev, merkleRoot: merkleRootDev } = await fetchTradingRound(round, false);

    console.log('*** Trading Rewards Prod ***')
    console.log('Total fees', ethers.utils.formatUnits(fees, 30))
    console.log('Total volume', ethers.utils.formatUnits(volume, 30))
    console.log('Total reward', ethers.utils.formatEther(totalRewards))
    console.log(`Merkle root: ${merkleRoot}`);
    console.log()

    console.log('*** Trading Rewards Dev ***')
    console.log('Total fees', ethers.utils.formatUnits(feesDev, 30))
    console.log('Total volume', ethers.utils.formatUnits(volumeDev, 30))
    console.log('Total reward', ethers.utils.formatEther(totalRewardsDev))
    console.log(`Merkle root: ${merkleRootDev}`);
    console.log()

    if (merkleRootDev === merkleRoot) {
      console.log('Merkle roots match')
      console.log()
    }
  }
}

main();

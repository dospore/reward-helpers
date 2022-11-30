import ethers from 'ethers';
import { getRoundTimes, fetchGraphVolumes } from './helpers.js';

const round = 9;
let { from, to } = getRoundTimes(round);
console.log(`*** Fetching from: ${from}(${new Date(from * 1000)}), to: ${to}(${new Date(to * 1000)})`);

const main = async () => {
  const { volumes, fees, fees2 } = await fetchGraphVolumes(from, to);

  console.log('*** VOLUMES ***')
  let totalVolume = ethers.BigNumber.from(0);
  Object.keys(volumes).map((stat) => {
    console.log(stat, ethers.utils.formatUnits(volumes[stat], 30));
    totalVolume = totalVolume.add(volumes[stat])
  })
  console.log("Total Volume", ethers.utils.formatUnits(totalVolume, 30));
  console.log('\n')

  console.log('*** FEES ***')
  let totalFees = ethers.BigNumber.from(0);
  Object.keys(fees).map((stat) => {
    console.log(stat, ethers.utils.formatUnits(fees[stat], 30));
    totalFees = totalFees.add(fees[stat])
  })
  console.log("Total fees", ethers.utils.formatUnits(totalFees, 30));

  console.log('\n')
  console.log('*** FEES 2 ***')
  Object.keys(fees2).map((stat) => {
    console.log(stat, ethers.utils.formatUnits(fees2[stat], 30));
  })
}

main();

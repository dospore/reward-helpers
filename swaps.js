import fetch from 'node-fetch';
import { getRoundTimes } from './helpers.js';

const round = 3;
const { from, to } = getRoundTimes(round);
console.log(`*** Fetching from: ${from}(${new Date(from * 1000)}), to: ${to}(${new Date(to * 1000)})`);

const graphUrl = 'https://api.thegraph.com/subgraphs/name/mycelium-ethereum/myc-swaps-stats';

export const fetchGraphSwaps = async (from) => {

  let fromTime = from;
  let allSwaps = [];
  while (true) {
    console.log(`Fetching from: ${fromTime}`);
    const query = `
        {
          swaps(first: 1000, orderBy: timestamp, orderDirection: asc, where:{ timestamp_gt: ${fromTime}}) {
                account
                id
                transaction {
                from
                id
                to
                }
                amountIn
                amountOut
                feeBasisPoints
                tokenInPrice
                tokenIn
                tokenOut
                timestamp
          }
        }
    `;

    const response = await fetch(graphUrl, {
      method: 'POST',
      body: JSON.stringify({ query })
    }).then((res) => res.json());

    const swapsLength = response.data.swaps.length

    allSwaps = [...allSwaps, ...response.data.swaps]

    if (swapsLength === 0 || swapsLength !== 1000) {
      break;
    }
    fromTime = response.data.swaps[swapsLength - 1].timestamp;
  }

  const swapsByAccount = allSwaps.reduce((o, swap) => {
    if (o[swap.account]) {
      o[swap.account].push(swap)
    } else {
      o[swap.account] = [swap];
    }
    return o;
  }, {}) 
  console.log(swapsByAccount);

  return ({
    swapsByAccount,
    allSwaps
  })
}

const main = async () => {
  const { allSwaps, swapsByAccount } = await fetchGraphSwaps(0);

  console.log("Unique traders", Object.keys(swapsByAccount).length);
  console.log("Total swaps", allSwaps.length);
}

main();

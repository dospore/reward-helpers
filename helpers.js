import fetch from 'node-fetch';
import ethers from 'ethers';

const GLOBAL_START = 1660694400;
export const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

export const getRoundTimes = (round) => {
  const from = GLOBAL_START + round * SECONDS_PER_WEEK;
  // fortnightly rewards if more than round two
  const to = round < 3 ? from + SECONDS_PER_WEEK : from + SECONDS_PER_WEEK * 2;
  return ({
    from, to
  })
}

export const fetchGraphVolumes = async (from, to) => {
  const graphUrl = 'https://api.thegraph.com/subgraphs/name/mycelium-ethereum/myc-swaps-stats';
  // const graphUrl = 'https://api.thegraph.com/subgraphs/id/QmSiK9jZYe4bdyCfcMj2u8sSA4Kk4xZgUqw58NrtYq8M1q'
  const query = `
      {
        volumeStats(first: 1000, where: { id_gte: ${from}, id_lt: ${to}}) {
          id 
          margin
          liquidation
          mint
          burn
          swap
        },
        feeStats(first: 1000, where: { id_gte: ${from}, id_lt: ${to}, period: daily }) {
          id
          margin
          marginAndLiquidation
          swapMintAndBurn
          swap
          mint
          burn
        }
        hourlyFees(first: 1000, where: { id_gte: ${from}, id_lt: ${to} }) {
          id
          margin
          marginAndLiquidation
          swap
          mint
          burn
        }
      }
  `;

  const response = await fetch(graphUrl, {
    method: 'POST',
    body: JSON.stringify({ query })
  }).then((res) => res.json());

  const { volumeStats, feeStats, hourlyFees } = response.data;

  const fees = feeStats.reduce((o, fee) => ({
    swap: o.swap.add(fee.swap),
    buy: o.buy.add(fee.mint),
    sell: o.sell.add(fee.burn),
    trading: o.trading.add(fee.marginAndLiquidation),
    liquidation: o.liquidation.add(fee.marginAndLiquidation).sub(fee.margin),
    trueSwaps: o.trueSwaps.add(fee.swapMintAndBurn).sub(fee.mint).sub(fee.burn)
  }), {
    swap: ethers.BigNumber.from(0),
    buy: ethers.BigNumber.from(0),
    sell: ethers.BigNumber.from(0),
    trading: ethers.BigNumber.from(0),
    liquidation: ethers.BigNumber.from(0),
    trueSwaps: ethers.BigNumber.from(0)
  });

  const fees2 = hourlyFees.reduce((o, fee) => ({
    swap: o.swap.add(fee.swap),
    buy: o.buy.add(fee.mint),
    sell: o.sell.add(fee.burn),
    trading: o.trading.add(fee.marginAndLiquidation),
    liquidation: o.liquidation.add(fee.marginAndLiquidation).sub(fee.margin)
  }), {
    swap: ethers.BigNumber.from(0),
    buy: ethers.BigNumber.from(0),
    sell: ethers.BigNumber.from(0),
    trading: ethers.BigNumber.from(0),
    liquidation: ethers.BigNumber.from(0)
  });

  const volumes = volumeStats.reduce((o, volume) => ({
    swap: o.swap.add(volume.swap),
    buy: o.buy.add(volume.mint),
    sell: o.sell.add(volume.burn),
    trading: o.trading.add(volume.margin).add(volume.liquidation),
  }), {
    swap: ethers.BigNumber.from(0),
    buy: ethers.BigNumber.from(0),
    sell: ethers.BigNumber.from(0),
    trading: ethers.BigNumber.from(0),
  });

  return ({
    volumes,
    fees,
    fees2
  })
}

export const fetchGraphReferrals = async (from, to) => {
  const query = `
  {
    referrerStats(first: 1000, where: {
      period: daily,
      timestamp_gte: ${from},
      timestamp_lt: ${to}
    }) {
      id
      totalRebateUsd
      discountUsd
      timestamp
      volume
      tradedReferralsCount
      trades
      referrer
    }
    referralStats(first: 1000, where: {
      period: daily,
      timestamp_gte: ${from},
      timestamp_lt: ${to}
    }) {
      id
      discountUsd
      timestamp
      referral
      volume
    }
  }
  `;

  const graphUrl = 'https://api.thegraph.com/subgraphs/name/mycelium-ethereum/myc-swaps-referrals'

  const response = await fetch(graphUrl, {
    method: 'POST',
    body: JSON.stringify({ query })
  }).then((res) => res.json());

  let { referrerStats: graphReferrerStats, referralStats: graphReferralStats } = response.data;

  const referrerStats = graphReferrerStats.reduce((o, stat) => ({
    ...o,
    volume: o.volume.add(stat.volume),
    totalCommissions: o.totalCommissions.add(stat.totalRebateUsd).sub(stat.discountUsd),
  }), {
    volume: ethers.BigNumber.from(0),
    totalCommissions: ethers.BigNumber.from(0)
  })

  const referralStats = graphReferralStats.reduce((o, stat) => ({
    ...o,
    volume: o.volume.add(stat.volume),
    totalRebates: o.totalRebates.add(stat.discountUsd),
  }), {
    volume: ethers.BigNumber.from(0),
    totalRebates: ethers.BigNumber.from(0)
  })

  return ({
    referrerStats,
    referralStats
  });
}



export const fetchMintBurns = async () => {
  const graphUrl = 'https://api.thegraph.com/subgraphs/name/mycelium-ethereum/myc-swaps-stats';
  const query = `
      {
        hourlyVolumes(first: 1000, where: { id_gte: 1663143487, id_lte: 1663555608 }) {
          id 
          mint
          burn
        },
      }
  `;

  const response = await fetch(graphUrl, {
    method: 'POST',
    body: JSON.stringify({ query })
  }).then((res) => res.json());

  const { hourlyVolumes: volumeStats } = response.data;

  const totalMintBurn = volumeStats.reduce((o, stat) => {
    console.log("")
    console.log("mint", ethers.utils.formatUnits(stat.mint, 30));
    console.log("burn", ethers.utils.formatUnits(stat.burn, 30));
    return ({
      ...o,
      burn: o.burn.add(stat.burn),
      mint: o.mint.add(stat.mint),
    })
  }, {
    burn: ethers.BigNumber.from(0),
    mint: ethers.BigNumber.from(0),
  })

  return totalMintBurn;
}

export const fetchReferralRound = async (round, prod) => {
  const apiUrl = prod 
    ? `https://api.tracer.finance/trs/referralRewards?network=42161&round=${round}`
    // : `http://localhost:3030/trs/referralRewards?network=42161&round=${round}`
    : `https://dev.api.tracer.finance/trs/referralRewards?network=42161&round=${round}`

  const response = await fetch(apiUrl).then((res) => res.json());
  const { rewards, merkle_root: merkleRoot } = response;

  const totalRewards = rewards.reduce((o, reward) => o.add(reward.commissions).add(reward.rebates), ethers.BigNumber.from(0))

  return {
    totalRewards,
    merkleRoot
  };
}

export const fetchTradingRound = async (round, prod) => {
  const apiUrl = prod 
    ? `https://api.tracer.finance/trs/tradingRewards?network=42161&round=${round}`
    // : `http://localhost:3030/trs/tradingRewards?network=42161&round=${round}`
    : `https://dev.api.tracer.finance/trs/tradingRewards?network=42161&round=${round}`

  const response = await fetch(apiUrl).then((res) => res.json());
  const { rewards, fees, volume, merkle_root: merkleRoot } = response;

  const totalRewards = rewards.reduce((o, reward) => o.add(reward.reward).add(reward.degen_reward), ethers.BigNumber.from(0))

  return {
    totalRewards,
    fees,
    volume,
    merkleRoot
  };
}

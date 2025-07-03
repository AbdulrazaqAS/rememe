import { formatEther, type Address } from "viem";
import {
  getCoin,
  getCoins,
  getCoinsLastTraded,
  getCoinsLastTradedUnique,
  getCoinsMostValuable,
  getCoinsNew,
  getCoinsTopGainers,
  getCoinsTopVolume24h,
  getProfile,
  getProfileBalances,
} from "@zoralabs/coins-sdk";
import type { CoinMetadata, ProfileData, Zora20Token } from "./utils";

export async function fetchUserProfile(
  identifier: Address | string
): Promise<ProfileData> {
  const response = await getProfile({
    identifier,
  });

  // TODO: fix profile graphql types
  const profile: any = response?.data?.profile;

  if (!profile)
    console.error("Profile not found or user has not set up a profile");

  return response?.data?.profile as unknown as ProfileData;
}

export async function fetchAllUserBalances(
  identifier: Address | string
): Promise<CoinMetadata[]> {
  let allBalances: any[] = [];
  let cursor = undefined;
  const pageSize = 20;

  // Continue fetching until no more pages
  do {
    const response = await getProfileBalances({
      identifier, // UserAddress or zora handle
      count: pageSize,
      after: cursor,
    });

    const profile: any = response.data?.profile;

    // Add balances to our collection
    if (profile && profile.coinBalances) {
      allBalances = [
        ...allBalances,
        ...profile.coinBalances.edges.map((edge: any) => edge.node),
      ];
    }

    // Update cursor for next page
    cursor = profile?.coinBalances?.pageInfo?.endCursor;

    // Break if no more results
    if (!cursor || profile?.coinBalances?.edges?.length === 0) {
      break;
    }
  } while (true);

  const formatted = allBalances.map((bal) => {
    const balanceEther = formatEther(BigInt(Number(bal.balance)));
    const price = Number(bal.coin!.marketCap) / Number(bal.coin!.totalSupply);
    const value = Number(balanceEther) * price; // Value of user holding/balance in USD

    return {
      ...bal,
      balanceEther,
      price,
      value,
    };
  });

  return formatted as unknown as CoinMetadata[];
}

export function getCoinPrice(coin: Zora20Token) {
  if (!coin || coin.marketCap === "0") return 0;
  return Number(coin.marketCap) / Number(coin.totalSupply);
}

export async function fetchSingleCoin(addr: Address, chainId: number) {
  const response = await getCoin({
    address: addr,
    chain: chainId, // Optional: Base chain set by default
  });

  const coin = response.data?.zora20Token;
  return coin;
}

export async function fetchMultipleCoins(
  coinsAddr: Address[],
  chainId: number
) {
  const coins = coinsAddr.map((addr) => {
    return { chainId, collectionAddress: addr };
  });

  const response = await getCoins({
    coins,
  });

  return response.data?.zora20Tokens;
}

export async function fetchTopGainers(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsTopGainers({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchMostValuableCoins(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsMostValuable({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchNewCoins(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsNew({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchTopVolumeCoins(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsTopVolume24h({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchLastTradedCoins(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsLastTraded({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchLastTradedUniqueCoins(
  amount?: number
): Promise<Zora20Token[] | undefined> {
  const response = await getCoinsLastTradedUnique({
    count: amount ?? 10, // Optional: number of coins per page
    after: undefined, // Optional: for pagination
  });

  const tokens = response.data?.exploreList?.edges?.map(
    (edge: any) => edge.node
  );

  return tokens as Zora20Token[] | undefined;
}

export async function fetchMetadata(uri: string): Promise<any> {
  const result = await fetch(uri);
  const metadata = await result.json();
  return metadata;
}

import { PortisConnector } from '@web3-react/portis-connector'
import { configureChains, createConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { SafeConnector } from 'wagmi/connectors/safe'
import { WalletConnectConnector as WC } from 'wagmi/connectors/walletConnect'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import { NETWORK_URL_SEPOLIA, PORTIS_ID, WALLET_CONNECT_PROJECT_ID } from '../constants/config'
import {
  ChainId,
  NETWORK_CONFIGS,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  gnosis,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  sepolia,
} from './../utils/networkConfig'

const { chains, publicClient } = configureChains(
  [
    mainnet,
    polygonMumbai,
    gnosis,
    goerli,
    polygon,
    avalanche,
    avalancheFuji,
    bsc,
    bscTestnet,
    sepolia,
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        // Use Snapshot RPC for Sepolia (falls back to publicProvider for other chains)
        if (chain.id === sepolia.id) return { http: NETWORK_URL_SEPOLIA }
        return null
      },
    }),
    publicProvider(),
  ],
)

export { chains }

// MetaMask connector - will only work if MetaMask is installed
export const injected = new InjectedConnector({
  chains,
  options: {
    shimDisconnect: true,
    name: 'MetaMask',
  },
})

// Generic injected connector for other wallets
const injectedGeneric = new InjectedConnector({
  chains,
  options: {
    shimDisconnect: true,
    name: 'Injected',
  },
})

const coinbaseWalletConnector = new CoinbaseWalletConnector({
  chains,
  options: {
    appName: 'gnosis-auction.eth',
    jsonRpcUrl: `${mainnet.rpcUrls.public.http}`,
  },
})
export const walletConnectConnector = new WC({
  chains,
  options: {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
      name: 'gnosis-auction',
      description: 'Decentralised token price discovery platform',
      url: 'gnosis-auction.eth',
      icons: [],
    },
  },
})

const safeConnector = new SafeConnector({
  chains,
  options: {
    allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
    debug: true,
  },
})

export const wagmiClient = createConfig({
  autoConnect: true,
  connectors: [
    injected,
    injectedGeneric,
    coinbaseWalletConnector,
    walletConnectConnector,
    safeConnector,
  ],
  publicClient,
  storage: {
    getItem: <T>(key: string): T | null => {
      try {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (err) {
        console.error('Error getting item from storage:', err)
        return null
      }
    },
    setItem: <T>(key: string, value: T | null): void => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.error('Error setting item in storage:', err)
      }
    },
    removeItem: (key: string): void => {
      try {
        window.localStorage.removeItem(key)
      } catch (err) {
        console.error('Error removing item from storage:', err)
      }
    },
  },
})

const urls: string[] = []

// TOOD Try to use reduce to improve types
const rpcs: any = {}

const chainIds = Object.keys(NETWORK_CONFIGS).map(Number)
chainIds.forEach((chainId: ChainId) => {
  if (NETWORK_CONFIGS[chainId].rpcUrls.default) {
    urls[chainId] = `${NETWORK_CONFIGS[chainId].rpcUrls.default.http}`
    rpcs[chainId] = NETWORK_CONFIGS[chainId].rpcUrls.default.http
  }
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID,
  networks: [1],
})

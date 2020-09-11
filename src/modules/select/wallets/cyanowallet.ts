import { mobileWalletInstallMessage } from '../content'
import {
  WalletModule,
  Helpers,
  InjectedWithBalanceOptions
} from '../../../interfaces'

import cyanowalletIcon from '../wallet-icons/icon-cyanowallet'

function cyanowallet(options: InjectedWithBalanceOptions): WalletModule {
  const { preferred, label, svg, rpcUrl } = options

  return {
    name: label || 'Cyano Wallet',
    svg: svg || cyanowalletIcon,
    wallet: async (helpers: Helpers) => {
      const { getProviderName, getAddress, getNetwork, getBalance } = helpers
      const cyanowalletProvider =
        (window as any).ethereum ||
        ((window as any).web3 && (window as any).web3.currentProvider)

      const isCyanoWallet =
        getProviderName(cyanowalletProvider) === 'cyanowallet'
      let createProvider

      if (isCyanoWallet && rpcUrl) {
        createProvider = (await import('./providerEngine')).default
      }

      const provider = createProvider ? createProvider({ rpcUrl }) : null

      let warned = false

      return {
        provider: cyanowalletProvider,
        interface: isCyanoWallet
          ? {
              address: {
                get: () => getAddress(cyanowalletProvider)
              },
              network: {
                get: () => getNetwork(cyanowalletProvider)
              },
              balance: {
                get: async () => {
                  if (!provider) {
                    if (!warned) {
                      console.warn(
                        'The cyano Wallet provider does not allow rpc calls preventing Onboard.js from getting the balance. You can pass in a "rpcUrl" to the cyano Wallet initialization object to get the balance.'
                      )
                      warned = true
                    }

                    return null
                  }

                  const address = await getAddress(cyanowalletProvider)

                  return getBalance(provider, address)
                }
              },
              name: getProviderName(cyanowalletProvider)
            }
          : null
      }
    },
    type: 'injected',
    link: 'https://www.cyanowallet.com',
    installMessage: mobileWalletInstallMessage,
    mobile: true,
    preferred
  }
}

export default cyanowallet

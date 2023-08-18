import './tasks'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import * as dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/types'

dotenv.config()

const forkingConfig = {
  url: <string>process.env.FORK_URL,
  // blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER!),
}

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  namedAccounts: {
    deployer: 0,
    owner: 1,
    user: 2,
  },
  networks: {
    hardhat: {
      chainId: process.env.FORK ? parseInt(process.env.FORK_CHAINID!) : 31337,
      // gas: "auto",
      // allowUnlimitedContractSize: true,
      forking: process.env.FORK ? forkingConfig : undefined,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        accountsBalance: '1000000000000000000000000000000',
      },
      live: false,
      saveDeployments: false,
      tags: ['hardhat'],
    },
    sepolia: {
      url: process.env.JSON_RPC_PROVIDER_URL ?? 'https://rpc2.sepolia.org	',
      gasPrice: 'auto',
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
      accounts: {
        mnemonic: process.env.MNEMONIC ?? 'test test test test test test test test test test test junk',
        count: 20,
      },
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: 'USD',
  },
}

export default config

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

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    sepolia: {
      url: process.env.JSON_RPC_PROVIDER_URL ?? '',
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
      accounts: {
        mnemonic: process.env.MNEMONIC ?? '',
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

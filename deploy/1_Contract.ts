import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { deployAndVerify } from './helpers'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  await deployAndVerify(hre, 'Contract', {
    constructorArguments: [123, 321],
  })
}

export default func
func.tags = ['mainnet', 'Contract']
func.id = 'Contract'

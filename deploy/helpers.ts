import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { CONFIRMATIONS_BEFORE_VERIFICATION } from './config';

export async function deployAndVerify(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options?: {
    constructorArguments?: any[]; // eslint-disable-line
    fromNamedAccount?: string;
    deploymentName?: string;
  },
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const deployer = (await getNamedAccounts())[options?.fromNamedAccount ?? 'deployer'];

  let waitConfirmations: number | undefined = CONFIRMATIONS_BEFORE_VERIFICATION;
  // In hardhat we don't need to verify therefore wait for confirmations
  if (isHardhatNetwork(hre)) {
    waitConfirmations = undefined;
  }

  // Deploy the contract
  const deploymentReceipt = await deploy(options?.deploymentName ?? contractName, {
    from: deployer,
    contract: contractName,
    waitConfirmations,
    args: options?.constructorArguments,
  });

  // If we are not on the Hardhat network, verify the contract
  if (!isHardhatNetwork(hre)) {
    await hre.run('verify:verify', {
      address: deploymentReceipt.address,
      constructorArguments: options?.constructorArguments,
    });
  }
}

export function isHardhatNetwork(hre: HardhatRuntimeEnvironment): boolean {
  return hre.network.name === 'hardhat';
}

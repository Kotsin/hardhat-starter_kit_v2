# Hardhat Starter Kit

## ℹ️ Table of Contents

- [Hardhat Starter Kit](#hardhat-starter-kit)
  - [ℹ️ Table of Contents](#ℹ️-table-of-contents)
  - [👋🏻 Introduction](#-introduction)
  - [🚨 Environment variables](#-environment-variables)
    - [Contracts `.env` file](#contracts-env-file)
  - [👾 Contracts](#-contracts)
    - [📦 Dependencies installation](#-dependencies-installation)
    - [🧪 Running the Contracts tests](#-running-the-contracts-tests)
    - [🚀 Compiling the contracts](#-compiling-the-contracts)
    - [⚡️ Deploying the contracts on testnet](#️-deploying-the-contracts-on-testnet)
    - [❓ How tests work](#-how-tests-work)

## 👋🏻 Introduction

This is the Hardhat Starter Kit with some Github actions, autolinting using Husky and other features.

## 🚨 Environment variables

The project uses environment variables to configure the different packages. You must create the needed `.env` file in the root folder. **This step is mandatory and cannot be skipped, otherwise the app won't compile, run or work properly.**

### Contracts `.env` file

This is the list of the environment variables that must be set in the `packages/contracts/.env` file:

```bash
FORK_ETH_URL=<FORK_ETH_URL> # The URL of the Ethereum node to fork, can be local or Alchemy or Infura.
MNEMONIC="" # The mnemonic of the account to use to deploy the contracts, in case you want to run the deploy script. Must be left as an empty string if you don't want to run the deploy script.
JSON_RPC_PROVIDER_URL=<JSON_RPC_PROVIDER_URL> # The url of the node to use while testing. Check the "Running the Tests" section for more info.
ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY> # API Key used to verify the contracts.
```

## 👾 Contracts

The smart contracts are written in [Solidity](https://solidity.readthedocs.io/en/v0.5.3/) and are compiled/tested using [Hardhat](https://hardhat.org/).

### 📦 Dependencies installation

To install the contracts dependencies, you need to have [Node.js](https://nodejs.org/en/) installed. Then, you can run the following commands:

```bash
npm i -d
```

### 🧪 Running the Contracts tests

Running the contracts tests requires a valid mnemonic set in the .env inside packages/contracts and can be as simple as
following example:

```bash
MNEMONIC="test test test test test test test test test test test test"
```

To run the tests, you can run the following command:

```bash
npm run test
```

You should see in your terminal all the tests being executed.

If you want to test single contracts and not the whole suite, you can run one of the following commands, one for each test file:

```bash
npm run test:test-case1 # those must be set in package.json
npm run test:test-case2 #
```

### 🚀 Compiling the contracts

To compile the contracts, you can run the following command:

```bash
npm run compile # npm run compile
```

### ⚡️ Deploying the contracts on testnet

In order to deploy the contracts on a testnet, you can use the `deploy` script. We'll use
Sepolia testnet as the default in this readme and the repository.

For this you must have the mnemonic in the Contracts .env set to a valid wallet secret recovery phrase which contains
ETH (or relevant currency) for the testnet that you are deploying to. This can be done via creating a new wallet with
[MetaMask](https://support.metamask.io/hc/en-us/articles/360015489531), adding your secret recovery phrase to both
.env files as the `MNEMONIC` and using the [Sepolia faucet](https://sepoliafaucet.com/) to send yourself Sepolia ETH.

The faucet requires an [Alchemy](https://www.alchemy.com/) account which can be setup for free. You will also need to
setup an App inside Alchemy for Sepolia, which will give you an HTTPS url which can be set in `FORK_ETH_URL` and
`JSON_RPC_PROVIDER_URL` in `contracts/.env`.

Here's an example of how to deploy the contracts on Sepolia testnet:

```bash
npm run deploy:t
```

Once the script has finished, you can find the addresses of the deployed contracts in the `deployments` folder,
or they are prompted out to you in the terminal.

If you check in the `deployments` folder, you'll find a `mumbai` or `sepolia` folder inside of it. Then, there's a
`.json` file that contains a JSON object with the address of the deployed contract as one of the first
keys.

Then to run the tests use the following command:

```bash
yarn test // or npm run test
```

The tests can be run inside the docker container as well, but you must first build the image as stated above in the [Running with Docker](#🐳-running-with-docker) section.

### ❓ How tests work

The tests for the contracts are written using the [Hardhat](https://hardhat.org/) framework. They are located in the `test` folder of the `contracts` package.

Running the tests in the `contracts` package will automatically deploy the contracts on a local blockchain instance and run the tests against it. The blockchain instance is created using [Hardhat's built-in node](https://hardhat.org/hardhat-network/).

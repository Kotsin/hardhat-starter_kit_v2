import { expect } from 'chai'
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'
import { MyToken, Farming } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

// variables
let stakingToken: MyToken
let rewardToken: MyToken
let farming: Farming
let owner: SignerWithAddress
let accounts: SignerWithAddress[]

// constants
const totalAmount = ethers.utils.parseEther('1000')
const percentage = 1000
const HUNDRED_PERCENT = 10000
const epochDuration = 2592000
const amountOfEpochs = 3

describe('Farming', function () {
  async function deployFixture() {
    ;[owner, ...accounts] = await ethers.getSigners()
    const Token = await ethers.getContractFactory('MyToken')
    stakingToken = await Token.deploy()
    rewardToken = await Token.deploy()
    const Farming = await ethers.getContractFactory('Farming')
    farming = await Farming.deploy(stakingToken.address, rewardToken.address)
    await farming.deployed()

    for (let i = 0; i < 10; i++) {
      await stakingToken.mint(accounts[0].address, ethers.utils.parseEther('100'))
    }
  }

  async function deployInitFixture() {
    const Token = await ethers.getContractFactory('MyToken')
    stakingToken = await Token.deploy()
    rewardToken = await Token.deploy()
    const Farming = await ethers.getContractFactory('Farming')
    farming = await Farming.deploy(stakingToken.address, rewardToken.address)
    await farming.deployed()

    await rewardToken
      .connect(owner)
      .approve(farming.address, totalAmount.mul(percentage).mul(amountOfEpochs).div(HUNDRED_PERCENT))
    const startTime = (await time.latest()) + 100
    await farming.connect(owner).initialize(totalAmount, percentage, epochDuration, amountOfEpochs, startTime)

    for (let i = 0; i < 10; i++) {
      await stakingToken.mint(accounts[i].address, ethers.utils.parseEther('100'))
    }
  }
  describe('Initialize', () => {
    it('Should be only callable by owner', async () => {
      await loadFixture(deployFixture)
      const startTime = (await time.latest()) + 100
      await rewardToken
        .connect(accounts[0])
        .approve(farming.address, totalAmount.mul(percentage).mul(amountOfEpochs).div(HUNDRED_PERCENT))
      await expect(
        farming.connect(accounts[0]).initialize(totalAmount, percentage, epochDuration, amountOfEpochs, startTime),
      ).to.be.revertedWith('Not an owner')
    })

    it('Should be initialized correctly', async () => {
      await loadFixture(deployFixture)
      const startTime = (await time.latest()) + 100
      await rewardToken.approve(farming.address, totalAmount.mul(percentage).mul(amountOfEpochs).div(HUNDRED_PERCENT))
      await farming.initialize(totalAmount, percentage, epochDuration, amountOfEpochs, startTime)
      expect(await farming.tokensLeft()).to.be.eq(totalAmount)
      expect(await farming.percentage()).to.be.eq(percentage)
      expect(await farming.epochDuration()).to.be.eq(epochDuration)
      expect(await farming.amountOfEpochs()).to.be.eq(amountOfEpochs)
      expect(await farming.startTime()).to.be.eq(startTime)
    })

    it('Should be unable to initialize twice', async () => {
      await loadFixture(deployInitFixture)
      await expect(farming.initialize(totalAmount, percentage, epochDuration, amountOfEpochs, 0)).to.be.revertedWith(
        'Already initialized',
      )
    })
  })

  describe('Deposit', async () => {
    it('Should deposit correctly', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))
      expect(await farming.tokensLeft()).to.be.eq(totalAmount.sub(ethers.utils.parseEther('100')))
    })

    it('Should be unable to deposit before startTime', async () => {
      await loadFixture(deployInitFixture)
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await expect(farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))).to.be.revertedWith(
        'Farming is not up yet',
      )
    })

    it('Should be unable to deposit more tokens than left', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await expect(farming.connect(accounts[0]).deposit(ethers.utils.parseEther('1001'))).to.be.revertedWith(
        'Too many tokens contributed',
      )
    })
  })

  describe('Withdrawal and Claim', () => {
    it('Should withdraw correctly', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))

      await time.increaseTo(
        (
          await farming.users(accounts[0].address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )
      expect(await rewardToken.balanceOf(accounts[0].address)).to.be.eq(0)
      expect(await stakingToken.balanceOf(accounts[0].address)).to.be.eq(0)
      await farming.connect(accounts[0]).claimRewards()
      await farming.connect(accounts[0]).withdraw()
      expect(await rewardToken.balanceOf(accounts[0].address)).to.be.eq(ethers.utils.parseEther('30'))
      expect(await stakingToken.balanceOf(accounts[0].address)).to.be.eq(ethers.utils.parseEther('100'))
    })

    it('Should be unable to claim twice', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))

      await time.increaseTo(
        (
          await farming.users(accounts[0].address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )

      await farming.connect(accounts[0]).claimRewards()
      await expect(farming.connect(accounts[0]).claimRewards()).be.revertedWith('already claimed')
      await farming.connect(accounts[0]).withdraw()
    })

    it('Should be unable to withdraw before claim', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))

      await time.increaseTo(
        (
          await farming.users(accounts[0].address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )
      await expect(farming.connect(accounts[0]).withdraw()).to.be.revertedWith('not claimed yet')
      await farming.connect(accounts[0]).claimRewards()
    })

    it('Should be unable to claim without a stake', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))

      await time.increaseTo(
        (
          await farming.users(accounts[0].address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )
      await farming.connect(accounts[1]).claimRewards()
      await expect(farming.connect(accounts[1]).withdraw()).to.be.revertedWith('nothing to withdraw')
    })

    it('Should be unable to claim too early', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())
      await stakingToken.connect(accounts[0]).approve(farming.address, ethers.utils.parseEther('100'))
      await farming.connect(accounts[0]).deposit(ethers.utils.parseEther('100'))

      await time.increaseTo((await farming.users(accounts[0].address)).depositTime.add(await farming.epochDuration()))
      await expect(farming.connect(accounts[0]).claimRewards()).to.be.revertedWith('too early to claim')
    })
  })

  describe('Full Cycle', () => {
    it('10 users should deposit, claim and withdraw w/o issues', async () => {
      await loadFixture(deployInitFixture)
      await time.increaseTo(await farming.startTime())

      for (let i = 0; i < 10; i++) {
        const stakeAmount = getRandomArbitrary(1, 100)

        await stakingToken
          .connect(accounts[i])
          .approve(farming.address, ethers.utils.parseEther(stakeAmount.toString()))
        await farming.connect(accounts[i]).deposit(ethers.utils.parseEther(stakeAmount.toString()))
      }

      await time.increaseTo(
        (
          await farming.users(accounts[9].address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )

      for (let i = 0; i < 10; i++) {
        const amount = (await farming.users(accounts[i].address)).amount
        await farming.connect(accounts[i]).claimRewards()
        await farming.connect(accounts[i]).withdraw()
        expect(await rewardToken.balanceOf(accounts[i].address)).to.be.eq(
          amount.mul(percentage).mul(amountOfEpochs).div(HUNDRED_PERCENT),
        )
        expect(await stakingToken.balanceOf(accounts[i].address)).to.be.eq(ethers.utils.parseEther('100'))
      }

      const stakeAmount = await farming.tokensLeft()
      await stakingToken.connect(owner).approve(farming.address, stakeAmount)
      await farming.connect(owner).deposit(stakeAmount)
      await time.increaseTo(
        (
          await farming.users(owner.address)
        ).depositTime.add((await farming.epochDuration()).mul(await farming.amountOfEpochs())),
      )
      const balanceBeforeClaim = await rewardToken.balanceOf(owner.address)
      await farming.connect(owner).claimRewards()
      await farming.connect(owner).withdraw()
      expect((await rewardToken.balanceOf(owner.address)).sub(balanceBeforeClaim)).to.be.eq(
        stakeAmount.mul(percentage).mul(amountOfEpochs).div(HUNDRED_PERCENT),
      )

      expect(await stakingToken.balanceOf(farming.address)).to.be.eq(0)
      expect(await rewardToken.balanceOf(farming.address)).to.be.eq(0)
    })
  })
})

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

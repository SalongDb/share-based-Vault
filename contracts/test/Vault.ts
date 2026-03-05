import { beforeEach, describe, it } from "node:test";
import hre from "hardhat";
import assert from "node:assert";

const { viem, networkHelpers } = await hre.network.connect();

describe("Vault", function () {

  let vault: any;
  let deployer: any;
  let user: any[] = [];
  let publicClient: any;

  beforeEach(async function () {
    const allClients = await viem.getWalletClients();
    deployer = allClients[0];
    user = allClients.slice(1, 6);
    vault = await viem.deployContract("Vault");
    publicClient = await viem.getPublicClient();
  })

  describe("Deposits", function () {

    it("Should mint shares correctly for the first deposit", async function () {
      const deposited = 1n * 10n ** 18n;

      await vault.write.deposit({
        account: user[1].account,
        value: deposited,
      });

      const totalShares = await vault.read.totalShares();
      const userShare = await vault.read.shares([user[1].account.address]);
      const totalAsset = await vault.read.totalAsset();

      assert.strictEqual(totalShares, deposited);
      assert.strictEqual(userShare, deposited);
      assert.strictEqual(totalAsset, deposited);
    });

    it("Should revert when deeposited 0", async function () {

      const deposited = 0n;

      await assert.rejects(
        vault.write.deposit({
          account: user[1].account,
          value: deposited,
        })
      )
    })

    it("Should calculate and update correctly on second deposit by same user", async function () {

      const deposited1 = 1n * 10n ** 18n;
      await vault.write.deposit({
        account: user[1].account,
        value: deposited1,
      });

      const deposited2 = 2n * 10n ** 18n;
      await vault.write.deposit({
        account: user[1].account,
        value: deposited2,
      });

      const totalShares = await vault.read.totalShares();
      const userShare = await vault.read.shares([user[1].account.address]);
      const totalAsset = await vault.read.totalAsset();

      assert.strictEqual(totalShares, deposited1 + deposited2);
      assert.strictEqual(userShare, deposited1 + deposited2);
      assert.strictEqual(totalAsset, deposited1 + deposited2);
    })

    it("Should calculate and update correctly on deposit by another user", async function () {

      const deposited1 = 1n * 10n ** 18n;
      await vault.write.deposit({
        account: user[1].account,
        value: deposited1,
      });

      const deposited2 = 2n * 10n ** 18n;
      await vault.write.deposit({
        account: user[2].account,
        value: deposited2,
      });

      const totalShares = await vault.read.totalShares();
      const user1Share = await vault.read.shares([user[1].account.address]);
      const user2Share = await vault.read.shares([user[2].account.address]);
      const totalAsset = await vault.read.totalAsset();

      assert.strictEqual(totalShares, deposited1 + deposited2);
      assert.strictEqual(user1Share, deposited1);
      assert.strictEqual(user2Share, deposited2);
      assert.strictEqual(totalAsset, deposited1 + deposited2);
    })

    it("Should calculate and update correctly when deposited sequentially by multiple users", async function () {
      const deposited1 = 1n * 10n ** 18n;
      await vault.write.deposit({
        account: user[1].account,
        value: deposited1,
      });

      const deposited2 = 2n * 10n ** 18n;
      await vault.write.deposit({
        account: user[2].account,
        value: deposited2,
      });

      const deposited3 = 3n * 10n ** 18n;
      await vault.write.deposit({
        account: user[3].account,
        value: deposited3,
      });

      const deposited4 = 2n * 10n ** 18n;
      await vault.write.deposit({
        account: user[4].account,
        value: deposited4,
      });

      const totalShares = await vault.read.totalShares();
      const user1Share = await vault.read.shares([user[1].account.address]);
      const user2Share = await vault.read.shares([user[2].account.address]);
      const user3Share = await vault.read.shares([user[3].account.address]);
      const user4Share = await vault.read.shares([user[4].account.address]);
      const totalAsset = await vault.read.totalAsset();

      assert.strictEqual(totalShares, deposited1 + deposited2 + deposited3 + deposited4);
      assert.strictEqual(user1Share, deposited1);
      assert.strictEqual(user2Share, deposited2);
      assert.strictEqual(user3Share, deposited3);
      assert.strictEqual(user4Share, deposited4);
      assert.strictEqual(totalAsset, deposited1 + deposited2 + deposited3 + deposited4);
    })
  })

  describe("Withdraw", function () {

    it("Should withdraw right amount of asset", async function () {
      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })

      const shareAmount = 10n * 10n ** 18n;
      await vault.write.withdraw(
        [shareAmount],
        { account: user[0].account },
      )

      const totalAsset = await vault.read.totalAsset();
      const totalShares = await vault.read.totalShares();
      const userShare = await vault.read.shares([user[0].account.address]);

      assert.strictEqual(totalAsset, 0n);
      assert.strictEqual(totalShares, 0n);
      assert.strictEqual(userShare, depositedAmount - shareAmount);
    })

    it("Should allow partial withdraw", async function () {

      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })
      const totalAssetBefore = await vault.read.totalAsset();
      const totalSharesBefore = await vault.read.totalShares();

      const shareAmount = 4n * 10n ** 18n;
      await vault.write.withdraw(
        [shareAmount],
        { account: user[0].account },
      )

      const totalAsset = await vault.read.totalAsset();
      const totalShares = await vault.read.totalShares();
      const userShare = await vault.read.shares([user[0].account.address]);

      assert.strictEqual(totalAsset, totalAssetBefore - shareAmount);
      assert.strictEqual(totalShares, totalSharesBefore - shareAmount);
      assert.strictEqual(userShare, depositedAmount - shareAmount);
    })

    it("Should allow multi-user withdraw", async function () {

      const amount1 = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: amount1,
      })

      const amount2 = 20n * 10n ** 18n;
      await vault.write.deposit({
        account: user[1].account,
        value: amount2,
      })

      const amount3 = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[2].account,
        value: amount3,
      })

      const amount4 = 30n * 10n ** 18n;
      await vault.write.deposit({
        account: user[3].account,
        value: amount4,
      })

      const totalAssetBefore = await vault.read.totalAsset();
      const totalSharesBefore = await vault.read.totalShares();

      const withdrawAmount1 = 10n * 10n ** 18n;
      await vault.write.withdraw(
        [withdrawAmount1],
        { account: user[0].account },
      )
      const withdrawAmount2 = 15n * 10n ** 18n;
      await vault.write.withdraw(
        [withdrawAmount2],
        { account: user[1].account },
      )
      const withdrawAmount3 = 10n * 10n ** 18n;
      await vault.write.withdraw(
        [withdrawAmount3],
        { account: user[2].account },
      )
      const withdrawAmount4 = 20n * 10n ** 18n;
      await vault.write.withdraw(
        [withdrawAmount4],
        { account: user[3].account },
      )

      const totalAsset = await vault.read.totalAsset();
      const totalShares = await vault.read.totalShares();
      const user1Share = await vault.read.shares([user[0].account.address]);
      const user2Share = await vault.read.shares([user[1].account.address]);
      const user3Share = await vault.read.shares([user[2].account.address]);
      const user4Share = await vault.read.shares([user[3].account.address]);

      assert.strictEqual(totalAsset, totalAssetBefore - (withdrawAmount1 + withdrawAmount2 + withdrawAmount3 + withdrawAmount4));
      assert.strictEqual(totalShares, user1Share + user2Share + user3Share + user4Share);
      assert.strictEqual(user1Share, amount1 - withdrawAmount1);
      assert.strictEqual(user2Share, amount2 - withdrawAmount2);
      assert.strictEqual(user3Share, amount3 - withdrawAmount3);
      assert.strictEqual(user4Share, amount4 - withdrawAmount4);
    })

    it("Should revert if 0 withdraw", async function () {

      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })

      await assert.rejects(
        vault.write.withdraw(
          [0n],
          { account: user[0].account }
        )
      )
    })

    it("Should revert if totalAsset is 0", async function () {

      await assert.rejects(
        vault.write.withdraw(
          [10n * 10n ** 18n],
          { account: user[0].account }
        )
      )
    })

    it("Should revert if withdraw more than owned", async function () {
      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })

      await assert.rejects(
        vault.write.withdraw(
          [12n * 10n ** 18n],
          { account: user[0].account }
        )
      )
    })

    it("Should not allow user to withdraw another user's shares", async function () {

      const depositAmount = 10n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: depositAmount,
      });

      await assert.rejects(
        vault.write.withdraw(
          [depositAmount],
          { account: user[1].account }
        )
      )
    })

    it("Should increase share price if ETH directly sent to contract", async function () {

      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })

      const forceSentETH = 20n * 10n ** 18n;
      await user[1].sendTransaction({
        to: vault.address,
        value: forceSentETH,
      })

      const totalAssetBefore = await vault.read.totalAsset();
      const totalShares = await vault.read.totalShares();
      const sharePrice = totalAssetBefore / totalShares;

      await vault.write.withdraw(
        [depositedAmount],
        { account: user[0].account },
      )

      const totalAssetAfter = await vault.read.totalAsset();

      assert.strictEqual(totalAssetAfter, 0n);
      assert.strictEqual(sharePrice, 3n);
    })

    it("Should distribute donated ETH proportionally", async function () {

      const depositA = 10n * 10n ** 18n;
      const depositB = 10n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: depositA,
      });

      await vault.write.deposit({
        account: user[1].account,
        value: depositB,
      });

      const donation = 20n * 10n ** 18n;

      await user[2].sendTransaction({
        to: vault.address,
        value: donation,
      });

      await vault.write.withdraw(
        [depositA],
        { account: user[0].account }
      );
      const totalAssetBefore = await vault.read.totalAsset();

      await vault.write.withdraw(
        [depositB],
        { account: user[1].account }
      );
      const totalAssetAfter = await vault.read.totalAsset();

      assert.strictEqual(totalAssetBefore, 20n * 10n ** 18n);
      assert.strictEqual(totalAssetAfter, 0n);
    })
  })
});
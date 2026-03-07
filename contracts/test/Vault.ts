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

    it("Should lock minimum liquidity on first deposit", async function () {

      const deposit = 1n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: deposit,
      });

      const burnedShares = await vault.read.balanceOf([
        "0x000000000000000000000000000000000000dEaD"
      ]);

      assert.strictEqual(burnedShares, 1000n);

    });

    it("Should mint balanceOf correctly for the first deposit", async function () {
      const deposited = 1n * 10n ** 18n;

      await vault.write.deposit({
        account: user[1].account,
        value: deposited,
      });

      const totalSupply = await vault.read.totalSupply();
      const userShare = await vault.read.balanceOf([user[1].account.address]);
      const totalAssets = await vault.read.totalAssets();

      assert.strictEqual(totalSupply, deposited);
      assert.strictEqual(userShare, deposited - 1000n);
      assert.strictEqual(totalAssets, deposited);
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

    it("Should revert if first deposit <= MINIMUM_LIQUIDITY", async function () {

      await assert.rejects(
        vault.write.deposit({
          account: user[0].account,
          value: 1000n
        })
      );

    });

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

      const totalSupply = await vault.read.totalSupply();
      const userShare = await vault.read.balanceOf([user[1].account.address]);
      const totalAssets = await vault.read.totalAssets();

      assert.strictEqual(totalSupply, deposited1 + deposited2);
      assert.strictEqual(userShare, (deposited1 + deposited2) - 1000n);
      assert.strictEqual(totalAssets, deposited1 + deposited2);
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

      const totalSupply = await vault.read.totalSupply();
      const user1Share = await vault.read.balanceOf([user[1].account.address]);
      const user2Share = await vault.read.balanceOf([user[2].account.address]);
      const totalAssets = await vault.read.totalAssets();

      assert.strictEqual(totalSupply, deposited1 + deposited2);
      assert.strictEqual(user1Share, deposited1 - 1000n);
      assert.strictEqual(user2Share, deposited2);
      assert.strictEqual(totalAssets, deposited1 + deposited2);
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

      const totalSupply = await vault.read.totalSupply();
      const user1Share = await vault.read.balanceOf([user[1].account.address]);
      const user2Share = await vault.read.balanceOf([user[2].account.address]);
      const user3Share = await vault.read.balanceOf([user[3].account.address]);
      const user4Share = await vault.read.balanceOf([user[4].account.address]);
      const totalAssets = await vault.read.totalAssets();

      assert.strictEqual(totalSupply, deposited1 + deposited2 + deposited3 + deposited4);
      assert.strictEqual(user1Share, deposited1 - 1000n);
      assert.strictEqual(user2Share, deposited2);
      assert.strictEqual(user3Share, deposited3);
      assert.strictEqual(user4Share, deposited4);
      assert.strictEqual(totalAssets, deposited1 + deposited2 + deposited3 + deposited4);
    })
  })

  describe("Withdraw", function () {

    it("Should withdraw right amount of asset", async function () {
      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })

      const shareAmount = depositedAmount - 1000n;
      await vault.write.withdraw(
        [shareAmount],
        { account: user[0].account },
      )

      const totalAssets = await vault.read.totalAssets();
      const totalSupply = await vault.read.totalSupply();
      const userShare = await vault.read.balanceOf([user[0].account.address]);

      assert.strictEqual(totalAssets, 1000n);
      assert.strictEqual(totalSupply, 1000n);
      assert.strictEqual(userShare, 0n);
    })

    it("Should allow partial withdraw", async function () {

      const depositedAmount = 10n * 10n ** 18n;
      await vault.write.deposit({
        account: user[0].account,
        value: depositedAmount,
      })
      const totalAssetBefore = await vault.read.totalAssets();
      const totalSharesBefore = await vault.read.totalSupply();

      const shareAmount = 4n * 10n ** 18n;
      await vault.write.withdraw(
        [shareAmount],
        { account: user[0].account },
      )

      const totalAssets = await vault.read.totalAssets();
      const totalSupply = await vault.read.totalSupply();
      const userShare = await vault.read.balanceOf([user[0].account.address]);

      assert.strictEqual(totalAssets, totalAssetBefore - shareAmount);
      assert.strictEqual(totalSupply, totalSharesBefore - shareAmount);
      assert.strictEqual(userShare, depositedAmount - 1000n - shareAmount);
    })

    it("Should allow multi-user withdraw", async function () {

      const amount1 = 10n * 10n ** 18n;
      const amount2 = 20n * 10n ** 18n;
      const amount3 = 10n * 10n ** 18n;
      const amount4 = 30n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: amount1,
      })
      await vault.write.deposit({
        account: user[1].account,
        value: amount2,
      })
      await vault.write.deposit({
        account: user[2].account,
        value: amount3,
      })
      await vault.write.deposit({
        account: user[3].account,
        value: amount4,
      })

      const withdraw1 = amount1 - 1000n;
      const withdraw2 = 15n * 10n ** 18n;
      const withdraw3 = 10n * 10n ** 18n;
      const withdraw4 = 20n * 10n ** 18n;

      await vault.write.withdraw(
        [withdraw1],
        { account: user[0].account },
      )
      await vault.write.withdraw(
        [withdraw2],
        { account: user[1].account },
      )
      await vault.write.withdraw(
        [withdraw3],
        { account: user[2].account },
      )
      await vault.write.withdraw(
        [withdraw4],
        { account: user[3].account },
      )

      const totalSupply = await vault.read.totalSupply();

      const user1Share = await vault.read.balanceOf([user[0].account.address]);
      const user2Share = await vault.read.balanceOf([user[1].account.address]);
      const user3Share = await vault.read.balanceOf([user[2].account.address]);
      const user4Share = await vault.read.balanceOf([user[3].account.address]);

      const burnedShares = await vault.read.balanceOf([
        "0x000000000000000000000000000000000000dEaD"
      ]);

      assert.strictEqual(
        totalSupply,
        user1Share + user2Share + user3Share + user4Share + burnedShares
      );
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

    it("Should revert if totalAssets is 0", async function () {

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

    it("Should not allow user to withdraw another user's balanceOf", async function () {

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

      const totalAssetBefore = await vault.read.totalAssets();
      const totalSupply = await vault.read.totalSupply();

      const sharePrice = totalAssetBefore / totalSupply;

      const withdrawShares = depositedAmount - 1000n;

      await vault.write.withdraw(
        [withdrawShares],
        { account: user[0].account },
      )

      const totalAssetAfter = await vault.read.totalAssets();

      assert.strictEqual(sharePrice, 3n);
      assert.strictEqual(totalAssetAfter, 3000n);
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

      const withdrawA = depositA - 1000n;
      const withdrawB = depositB;

      await vault.write.withdraw(
        [withdrawA],
        { account: user[0].account }
      );
      const totalAssetBefore = await vault.read.totalAssets();

      await vault.write.withdraw(
        [withdrawB],
        { account: user[1].account }
      );
      const totalAssetAfter = await vault.read.totalAssets();

      assert(totalAssetBefore > 0n);
      assert(totalAssetAfter > 0n);
    })
  })

  describe("Audits", async function () {
    it("previewDeposit should match actual minted shares", async () => {
      const deposit = 5n * 10n ** 18n;

      const previewShares = await vault.read.previewDeposit([deposit]);

      await vault.write.deposit({
        account: user[0].account,
        value: deposit
      });

      const userShares = await vault.read.balanceOf([user[0].account.address]);

      assert.strictEqual(userShares, previewShares);
    });

    it("convertToShares and convertToAssets should be inverse", async () => {

      const deposit = 10n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: deposit
      });

      const assets = 3n * 10n ** 18n;

      const shares = await vault.read.convertToShares([assets]);

      const assetsBack = await vault.read.convertToAssets([shares]);

      assert(assetsBack <= assets);
    });

    it("maxWithdraw should match user withdrawable assets", async () => {

      const deposit = 10n * 10n ** 18n;

      await vault.write.deposit({
        account: user[0].account,
        value: deposit
      });

      const maxWithdraw = await vault.read.maxWithdraw([
        user[0].account.address
      ]);

      const shares = await vault.read.balanceOf([user[0].account.address]);

      const expected = await vault.read.convertToAssets([shares]);

      assert.strictEqual(maxWithdraw, expected);
    });

    it("should handle small deposits correctly", async () => {

      const deposit = 10000n;

      await vault.write.deposit({
        account: user[0].account,
        value: deposit
      });

      const shares = await vault.read.balanceOf([user[0].account.address]);

      assert(shares > 0n);
    });
  })
});
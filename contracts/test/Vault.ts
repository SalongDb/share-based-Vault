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
});
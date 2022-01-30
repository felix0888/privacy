const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Privacy", function () {
  let Privacy, privacy;
  let deployer, alice, signers;
  let data0, data1, data2;
  const data0Str = "First Data";
  const data1Str = "Second Data";
  const data2Str = "Third Data";

  beforeEach(async function () {
    [deployer, alice, signers] = await ethers.getSigners();
    data0 = stringToBytesN(data0Str, 32);
    data1 = stringToBytesN(data1Str, 32);
    data2 = stringToBytesN(data2Str, 32);
    Privacy = await ethers.getContractFactory("Privacy");
    privacy = await Privacy.deploy([data0, data1, data2]);
  });

  describe("deployment", function () {
    it("should lock", async function () {
      expect(await privacy.locked()).to.equal(true);
    });
  });

  describe("#unlock", function () {
    it("should be reverted if wrong key param is given", async function () {
      await expect(privacy.unlock(stringToBytesN("Wrong Data", 16))).to.be.reverted;
    });

    it("should unlock if correct data(data[2]) is given", async function () {
      await privacy.connect(alice).unlock(data2.slice(0, 16));
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

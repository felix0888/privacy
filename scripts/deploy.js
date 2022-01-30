const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ", deployer.address
  );

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Privacy = await ethers.getContractFactory("Privacy");
  const privacy = await Privacy.deploy();
  console.log("Privacy address: ", await privacy.address);
  console.log("Account balance after Privacy deploy: ", (await deployer.getBalance()).toString());

  const PrivacyAttack = await ethers.getContractFactory("PrivacyAttack");
  const privacyAttack = await PrivacyAttack.deploy();
  console.log("PrivacyAttack address: ", await privacyAttack.address);
  console.log("Account balance after PrivacyAttack deploy: ", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

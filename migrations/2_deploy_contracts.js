const CarbonCreditToken = artifacts.require('CarbonCreditToken');

module.exports = async function (deployer) {
  try {
    // Deploy the CarbonCreditToken contract
    await deployer.deploy(CarbonCreditToken);

    // Get the deployed contract instance
    const instance = await CarbonCreditToken.deployed();

    console.log('CarbonCreditToken deployed to:', instance.address);
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
};

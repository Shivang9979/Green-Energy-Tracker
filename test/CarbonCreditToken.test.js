const CarbonCreditToken = artifacts.require('CarbonCreditToken');
const truffleAssert = require('truffle-assertions');

contract('CarbonCreditToken', (accounts) => {
  let tokenInstance;
  const owner = accounts[0];
  const company1 = accounts[1];
  const company2 = accounts[2];

  beforeEach(async () => {
    tokenInstance = await CarbonCreditToken.new();
  });

  it('should allow recording emissions', async () => {
    const emissionAmount = 100;
    await tokenInstance.recordEmission(emissionAmount, { from: company1 });
    const emissions = await tokenInstance.getEmissions(company1);
    assert.equal(
      emissions.toNumber(),
      emissionAmount,
      'Emissions not recorded correctly'
    );
  });

  it('should mint carbon credits', async () => {
    const result = await tokenInstance.mintCredit(50, 'Solar Project A', 100, {
      from: company1,
    });

    truffleAssert.eventEmitted(result, 'CreditMinted', (ev) => {
      return ev.company === company1 && ev.amount.toNumber() === 50;
    });

    const tokenId = result.logs[0].args.tokenId;
    const creditDetails = await tokenInstance.getCreditDetails(tokenId);

    assert.equal(
      creditDetails[0].toNumber(),
      50,
      'Minted credit amount mismatch'
    );
    assert.equal(
      creditDetails[1],
      'Solar Project A',
      'Minted credit source mismatch'
    );
    assert.isTrue(creditDetails[4], 'Minted credit should be active');
  });

  it('should allow offsetting emissions', async () => {
    // First record emissions
    await tokenInstance.recordEmission(100, { from: company1 });

    // Then mint a credit
    const mintResult = await tokenInstance.mintCredit(
      50,
      'Solar Project A',
      100,
      { from: company1 }
    );
    const tokenId = mintResult.logs[0].args.tokenId;

    // Offset emissions
    await tokenInstance.offsetEmissions(tokenId, { from: company1 });

    const emissions = await tokenInstance.getEmissions(company1);
    assert.equal(emissions.toNumber(), 50, 'Emissions not offset correctly');

    // Ensure credit is now inactive
    const creditDetails = await tokenInstance.getCreditDetails(tokenId);
    assert.isFalse(
      creditDetails[4],
      'Credit should be inactive after offsetting'
    );
  });

  it('should not allow offsetting emissions without sufficient credits', async () => {
    // Record emissions
    await tokenInstance.recordEmission(100, { from: company1 });

    // Attempt to mint a credit that exceeds emissions
    await tokenInstance.mintCredit(150, 'Wind Project B', 200, {
      from: company1,
    });

    // Attempt to offset emissions with a credit that is greater than recorded emissions
    const tokenId = 1; // Assuming tokenId starts at 1
    await truffleAssert.fails(
      tokenInstance.offsetEmissions(tokenId, { from: company1 }),
      truffleAssert.ErrorType.REVERT,
      'Insufficient emissions to offset'
    );
  });

  it('should not allow non-owners to offset emissions', async () => {
    // Record emissions
    await tokenInstance.recordEmission(100, { from: company1 });

    // Mint a credit
    const mintResult = await tokenInstance.mintCredit(
      50,
      'Solar Project A',
      100,
      { from: company1 }
    );
    const tokenId = mintResult.logs[0].args.tokenId;

    // Attempt to offset emissions by another account
    await truffleAssert.fails(
      tokenInstance.offsetEmissions(tokenId, { from: company2 }),
      truffleAssert.ErrorType.REVERT,
      'Not token owner'
    );
  });

  it('should allow getting company tokens', async () => {
    await tokenInstance.recordEmission(100, { from: company1 });
    const mintResult = await tokenInstance.mintCredit(
      50,
      'Solar Project A',
      100,
      { from: company1 }
    );
    const tokenId = mintResult.logs[0].args.tokenId;

    const tokens = await tokenInstance.getCompanyTokens(company1);
    assert.equal(tokens.length, 1, 'Company should have one token');
    assert.equal(tokens[0].toNumber(), tokenId, 'Token ID does not match');
  });

  it('should set and get token URI', async () => {
    const mintResult = await tokenInstance.mintCredit(
      50,
      'Solar Project A',
      100,
      { from: company1 }
    );
    const tokenId = mintResult.logs[0].args.tokenId;

    const tokenURI = 'https://example.com/token/1';
    await tokenInstance.setTokenURI(tokenId, tokenURI, { from: company1 });

    const retrievedURI = await tokenInstance.tokenURI(tokenId);
    assert.equal(retrievedURI, tokenURI, 'Token URI mismatch');
  });
});

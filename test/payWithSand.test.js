const test = require('node:test');
const assert = require('node:assert/strict');
const realEthers = require('ethers');

// Mocks for ethers
const payMock = async () => ({ hash: '0xpay' });
const payWithPermitMock = async () => ({ hash: '0xpermit' });
const mockContract = function () {
  return { pay: payMock, payWithPermit: payWithPermitMock };
};
const mockWeb3Provider = function () {
  return {
    send: async () => {},
    getSigner: () => ({}),
  };
};
const mockEthers = {
  ...realEthers,
  Contract: mockContract,
  providers: { Web3Provider: mockWeb3Provider },
  ethers: {
    ...realEthers.ethers,
    providers: { Web3Provider: mockWeb3Provider },
  },
};
require.cache[require.resolve('ethers')].exports = mockEthers;

const { payWithSand } = require('../dist/payWithSand');

const validArgs = {
  amount: '1',
  orderId: '1',
  recipient: '0x1234567890abcdef1234567890abcdef12345678',
};

test('throws on invalid recipient address', async () => {
  await assert.rejects(
    payWithSand({ ...validArgs, recipient: 'invalid' }),
    /Invalid recipient address/
  );
});

test('calls pay when no permit params provided', async () => {
  global.window = { ethereum: {} };
  process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
  const hash = await payWithSand(validArgs);
  assert.strictEqual(hash, '0xpay');
});

test('calls payWithPermit when permit params provided', async () => {
  global.window = { ethereum: {} };
  process.env.REACT_APP_PAYMENT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
  const hash = await payWithSand({
    ...validArgs,
    deadline: 1,
    v: 27,
    r: '0x' + '0'.repeat(64),
    s: '0x' + '0'.repeat(64),
  });
  assert.strictEqual(hash, '0xpermit');
});

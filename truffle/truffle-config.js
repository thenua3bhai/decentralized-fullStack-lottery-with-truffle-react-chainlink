/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation, and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 */
require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_build_directory: "../client/src/contracts",
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache, geth, or parity) in a separate terminal
    //For running test cases run command of truffle test

    // development: {
    //   host: "127.0.0.1", // Localhost (default: none)
    //   port: 7545, // Standard Ethereum port (default: none)
    //   network_id: "1337", // Any network (default: none)
    // },

    goerli: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_PROVIDER),
      network_id: 5,
      chain_id: 5,
      gas: 5500000, // Gas limit used for deploys.
      confirmations: 2, // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets)
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.14", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about
    },
  },
};

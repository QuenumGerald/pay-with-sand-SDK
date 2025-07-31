import { getDefaultProvider, Contract, isAddress, formatUnits } from 'ethers';

// ethers v6+ does not export Web3Provider from root, it's from 'ethers/providers'.
// But in v6, you import from 'ethers' and use 'BrowserProvider' instead of Web3Provider.
// We'll alias it for compatibility.
import { BrowserProvider } from 'ethers';

export { Contract, isAddress, formatUnits, BrowserProvider as Web3Provider, getDefaultProvider };

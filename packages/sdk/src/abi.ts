/**
 * Minimal MultiVault ABI — only the functions AgentID needs.
 * Extracted from the Intuition Protocol MultiVault contract.
 */
export const MultiVaultAbi = [
  {
    type: 'function',
    name: 'createAtoms',
    inputs: [
      { name: 'data', type: 'bytes[]', internalType: 'bytes[]' },
      { name: 'assets', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    outputs: [{ name: '', type: 'bytes32[]', internalType: 'bytes32[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createTriples',
    inputs: [
      { name: 'subjectIds', type: 'bytes32[]', internalType: 'bytes32[]' },
      { name: 'predicateIds', type: 'bytes32[]', internalType: 'bytes32[]' },
      { name: 'objectIds', type: 'bytes32[]', internalType: 'bytes32[]' },
      { name: 'assets', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    outputs: [{ name: '', type: 'bytes32[]', internalType: 'bytes32[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'termId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'curveId', type: 'uint256', internalType: 'uint256' },
      { name: 'minShares', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'redeem',
    inputs: [
      { name: 'shares', type: 'uint256', internalType: 'uint256' },
      { name: 'receiver', type: 'address', internalType: 'address' },
      { name: 'termId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'curveId', type: 'uint256', internalType: 'uint256' },
      { name: 'minAssets', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAtomCost',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTripleCost',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCounterIdFromTriple',
    inputs: [
      { name: 'tripleId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  // Events we need to parse
  {
    type: 'event',
    name: 'AtomCreated',
    inputs: [
      { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'termId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'atomData', type: 'bytes', indexed: false, internalType: 'bytes' },
      { name: 'atomWallet', type: 'address', indexed: false, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TripleCreated',
    inputs: [
      { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'termId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'subjectId', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'predicateId', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'objectId', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],0x06b
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'sender', type: 'address', indexed: true, internalType: 'address' },
      { name: 'receiver', type: 'address', indexed: true, internalType: 'address' },
      { name: 'termId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'curveId', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'assets', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'assetsAfterFees', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'shares', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'totalShares', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'vaultType', type: 'uint8', indexed: false, internalType: 'enum VaultType' },
    ],
    anonymous: false,
  },
] as const

# privacy
Smart Contract Security Practice | Lv12 Privacy
```
!!! DON'T TRY ON MAINNET !!!
```

## Summary
The creator of this contract was careful enough to protect sensitive areas of its storage.
The goal of this level is to unlock the `Privacy` contract.

### Things that might help:
- Understanding how storage works
- Understanding how parameter parsing works
- Understanding how casting works

> **Hint**: It is quite similar to level 8 Vault, isn't it?

### What you will learn:
- visibility modifiers and storage layout what we've seen lv 8 `Vault`.
- Parameter parsing
- Casting

## Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Privacy {

  bool public locked = true;
  uint256 public ID = block.timestamp;
  uint8 private flattening = 10;
  uint8 private denomination = 255;
  uint16 private awkwardness = uint16(now);
  bytes32[3] private data;

  constructor(bytes32[3] memory _data) public {
    data = _data;
  }
  
  function unlock(bytes16 _key) public {
    require(_key == bytes16(data[2]));
    locked = false;
  }

  /*
    A bunch of super advanced solidity algorithms...

      ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
      .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
      *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
      `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
      ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
  */
}
```

## Solidity Concepts
### Visibility Modifier
Learn from here [Vault - Visibility Modifier](https://github.com/felix0888/vault-attack#visibility-modifier).

### Storage Layout
Learn from here [Vault - Storage Layout](https://github.com/felix0888/vault-attack#storage-layout)

> **! Important !** Except for dynamically-sized arrays and mappings, data is stored contiguously item after item starting with the first state variable, which is stored in slot 0. Multiple, contiguous items that need less than 32 bytes are packed into a single storage slot if possible.

### Casting
#### Implicit Conversion
If an operator is applied to different types, the compiler tries to implicitly convert one of the operators to the type of the other ( the same is true for assignments). In general, an implicit conversion between value-types is possible if it makes sense semantically and no information is lost.
`uint8` is convertable to `uint16` and `int128` to `int256`, but `int8` is not convertible to `uint256` (because `uint256` cannot hold negative numbers)

#### Explicit Conversion
If the compiler does not allow implicit conversion but you know what you are doing, an explicit type conversion is sometimes possible. Note that this may give you some unexpected behaviour and allows you to bypass some security features of the compiler, so be sure to test that the result is what you want!

## Security & Gas Consideration
### Security Consideration
Please refer [Vault](https://github.com/felix0888/vault-attack#security-risk-in-the-contract)

### Gas Efficiency
#### Contract(Current)
```solidity
    ...
    bool public locked = true;
    uint256 public ID = block.timestamp;
    uint8 private flattening = 10;
    uint8 private denomination = 255;
    uint16 private awkwardness = uint16(block.timestamp);
    bytes32[3] private data;
    ...
```

Slot # | Unused(in bits) | Used (in bits) => Sum
--- | --- | --- 
0 | 255 | locked(1) => 1 bit
1 | 0 | ID(256) => 256 bits
2 | 224 | awkwardness(8), denomination(8), flattening(16) => 32 bits
3 | 0 | data0(256)
4 | 0 | data1(256)
5 | 0 | data2(256)

We could see the contract uses 6 storage slots, but it has 479 bits(more than 1 slot) is unused.
Re-ordering the definition of the state variables helps us to save storage slot(s) to save gas, for example like this.
```solidity
    ...
    bool public locked = true;
    uint8 private flattening = 10;
    uint8 private denomination = 255;
    uint16 private awkwardness = uint16(block.timestamp);
    uint256 public ID = block.timestamp;
    bytes32[3] private data;
    ...
```

The first 4 variables which 33 bits in total occupies a single slot in storage, then we save a slot.

Slot # | Unused(in bits) | Used (in bits) => Sum
--- | --- | --- 
0 | 223 | locked(1), awkwardness(8), denomination(8), flattening(16) => 33 bits
1 | 0 | ID(256) => 256 bits
2 | 0 | data0(256)
3 | 0 | data1(256)
4 | 0 | data2(256)

Occupying a storage slot costs ~ 20,000 gas and modifying it costs ~5,000 gas.

### What we can say
- Security: [Vault - What we can say](https://github.com/felix0888/vault-attack#what-we-can-say)
- Gas efficiency
  - Order variables efficiently so that several variables(smaller than 32 bytes) can be packed into a single slot.
  - Use state variable only when data has to be stored permanently, if not use `memory`.

## Deployment & Test
### Installation
```console
npm install
npx hardhat node
```

### Deployment
```console
npx hardhat run --network [NETWORK-NAME] scripts/deploy.js
```

### Test
You should see the contract is unlocked.
```console
dev@ubuntu:~/Documents/practice/privacy$ npx hardhat test


  Privacy
    deployment
      ✓ should lock
    #unlock
      ✓ should be reverted if wrong key param is given
      ✓ should unlock if correct data(data[2]) is given

  Privacy
    deployment
      ✓ should set the attacker
    #attack
      ✓ should be reverted if non-attacker tries
      ✓ should unlock Privacy contract if valid password given


  6 passing (1s)
```

If you're familiar with hardhat console, you can test `Privacy` on your hardhat local node by using `npx hardhat node` and `npx hardhat console`.

// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IContract} from "contracts/interfaces/IContract.sol";

contract Contract is IContract {
    uint256 public value;
    uint256 public immutable immutableValue;

    constructor(uint256 _value, uint256 _immutableValue) {
        value = _value;
        immutableValue = _immutableValue;
    }

    function updateValue(uint256 _value) external override {
        value = _value;
    }
}

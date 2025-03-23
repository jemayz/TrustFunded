// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityDonation {
    address public owner;
    
    struct Donation {
        address donor;
        uint amount;
        uint timestamp;
    }
    
    Donation[] public donations;
    uint public totalDonations;

    event Donated(address donor, uint amount, uint timestamp);

    constructor() {
        owner = msg.sender;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        donations.push(Donation(msg.sender, msg.value, block.timestamp));
        totalDonations += msg.value;
        emit Donated(msg.sender, msg.value, block.timestamp);
    }
    
    function withdrawFunds(address payable _to) public {
        require(msg.sender == owner, "Only owner can withdraw");
        _to.transfer(address(this).balance);
    }

    function getDonationsCount() public view returns (uint) {
        return donations.length;
    }

    function getDonation(uint _index) public view returns (address, uint, uint) {
        require(_index < donations.length, "Invalid index");
        Donation memory d = donations[_index];
        return (d.donor, d.amount, d.timestamp);
    }
}

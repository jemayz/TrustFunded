let web3;
let donationContract;
let userAccount;

// contract address
const contractAddress = "0xD848DFb4E9d0c8E1c30DbF3D086f8cEA09080029"; 

// Load ABI from abi.json
async function loadABI() {
  const response = await fetch('./abi.json');
  return await response.json();
}

// Connect Wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      document.getElementById('walletAddress').innerText = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);

      web3 = new Web3(window.ethereum);

      const abi = await loadABI();
      donationContract = new web3.eth.Contract(abi, contractAddress);

      getTotalDonations();
      fetchDonationHistory(); // Load donation history immediately

    } catch (err) {
      console.error(err);
      alert("Wallet connection failed.");
    }
  } else {
    alert("MetaMask not detected!");
  }
}

// Disconnect Wallet (UI only)
function disconnectWallet() {
  userAccount = null;
  document.getElementById('walletAddress').innerText = "Not Connected";
  document.getElementById('totalDonations').innerText = "0 ETH";
  document.getElementById('donationHistory').innerHTML = "";
}

// Make Donation
async function makeDonation() {
  const amount = document.getElementById('donationAmount').value;
  if (!userAccount) {
    alert("Connect wallet first!");
    return;
  }
  if (amount <= 0) {
    alert("Enter valid amount!");
    return;
  }

  try {
    // Send donation transaction
    const tx = await donationContract.methods.donate().send({
      from: userAccount,
      value: web3.utils.toWei(amount, 'ether')
    });

    alert("Donation successful!");

    // Refresh data after donation
    getTotalDonations();
    fetchDonationHistory();

  } catch (err) {
    console.error(err);
    alert("Transaction failed.");
  }
}

// Get Total Donations
async function getTotalDonations() {
  try {
    const total = await donationContract.methods.totalDonations().call();
    document.getElementById('totalDonations').innerText = web3.utils.fromWei(total, 'ether') + " ETH";
  } catch (err) {
    console.error("Error fetching total donations:", err);
  }
}

// Fetch Donation History and populate the table
async function fetchDonationHistory() {
  try {
    const events = await donationContract.getPastEvents('Donated', {
      fromBlock: 'earliest',
      toBlock: 'latest'
    });

    const tableBody = document.getElementById('donationHistoryTable');
    tableBody.innerHTML = ""; // Clear previous history

    if (events.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="3" class="py-2 px-4 text-center">No donations yet!</td>`;
      tableBody.appendChild(row);
      return;
    }

    // Loop through events and populate table
    for (let i = events.length - 1; i >= 0; i--) { // Latest first
      const event = events[i];
      const donor = event.returnValues.donor;
      const amount = web3.utils.fromWei(event.returnValues.amount, 'ether');

      // Get block timestamp
      const block = await web3.eth.getBlock(event.blockNumber);
      const timestamp = new Date(block.timestamp * 1000).toLocaleString();

      // Create table row
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b border-gray-600">${donor.slice(0, 6)}...${donor.slice(-4)}</td>
        <td class="py-2 px-4 border-b border-gray-600">${amount}</td>
        <td class="py-2 px-4 border-b border-gray-600">${timestamp}</td>
      `;
      tableBody.appendChild(row);
    }

  } catch (err) {
    console.error("Failed to fetch donation history", err);
  }
}

// Event Listeners
window.addEventListener('load', () => {
  connectWallet();
});

// Buttons
document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);
document.getElementById('donateNowBtn').addEventListener('click', makeDonation);
document.getElementById('donateBtn').addEventListener('click', makeDonation);

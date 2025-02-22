function parseSignature(signature) {
  var r = signature.substring(0, 64);
  var s = signature.substring(64, 128);
  var v = signature.substring(128, 130);

  return {
    r: "0x" + r,
    s: "0x" + s,
    v: parseInt(v, 16),
  };
}

function genSolidityVerifier(signature, signer, chainId) {
  return solidityCode
    .replace("<CHAINID>", chainId)
    .replace("<SIGR>", signature.r)
    .replace("<SIGS>", signature.s)
    .replace("<SIGV>", signature.v)
    .replace("<SIGNER>", signer);
}

window.onload = async function (e) {
  const ethereum = window.ethereum;
  const chainId = 1;

  var response = document.getElementById("response");
  response.style.display = "none";

  if (ethereum && ethereum.isMetaMask) {
    console.log("Ethereum successfully detected!");
    // Access the decentralized web!
  } else {
    console.log("Please install MetaMask!");
  }

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  let account;
  console.log(accounts);

  // force the user to unlock their MetaMask
  if (accounts == null) {
    alert("Please unlock MetaMask first");
    // Trigger login request with MetaMask
    web3.currentProvider.enable().catch(alert);
  } else {
    account = accounts[0];
  }

  var signBtn = document.getElementById("signBtn");

  signBtn.onclick = async function (e) {
    if (!ethereum && account == null) return;

    const messagebody = JSON.stringify({
      domain: {
        chainId: chainId,
        name: "EIP712-demo",
        version: "1",
      },
      message: {
        text: "Hello World",
      },
      primaryType: "Message",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        Message: [{ name: "text", type: "string" }],
      },
    });

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ];

    const bid = [
      { name: "amount", type: "uint256" },
      { name: "bidder", type: "Identity" },
    ];

    const identity = [
      { name: "userId", type: "uint256" },
      { name: "wallet", type: "address" },
    ];

    const domainData = {
      name: "My amazing dApp",
      version: "2",
      chainId: chainId,
      verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
      salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558",
    };

    var message = {
      amount: 100,
      bidder: {
        userId: 323,
        wallet: "0x3333333333333333333333333333333333333333",
      },
    };

    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Bid: bid,
        Identity: identity,
      },
      domain: domainData,
      primaryType: "Bid",
      message: message,
    });

    const res = await window.ethereum
      .request({
        method: "eth_signTypedData_v4",
        // params: [account, messagebody],
        params: [account, data],
      })
      .catch((err) => {
        console.log(err);
      });

    console.log(res);

    const signature = parseSignature(res);

    response.style.display = "block";
    response.value = genSolidityVerifier(signature, account, chainId);
  };
};

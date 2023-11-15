const sodium = require("libsodium-wrappers-sumo");
const { JIFFClient } = require("jiff-mpc");
const axios = require("axios");

async function submitData(token, analystShare, serverShare) {
  const url = "http://localhost:8080/submit";
  axios
    .post(url, {
      token: token,
      analystShare: analystShare,
      serverShare: serverShare,
    })
    .then((response) => console.log("submit response: ", response.statusText))
    .catch((error) => console.log("failed to submit data: ", error.code));
}

// Function to delete data
async function deleteData(token) {
  const url = `http://localhost:8080/delete/${token}`;

  axios
    .delete(url)
    .then((response) => console.log("delete response: ", response.statusText))
    .catch((error) => console.log("failed to delete data: ", error.code));
}

// Read command line arguments
async function main() {
  const command = process.argv[2];
  let input = process.argv[3];

  await sodium.ready;

  // Share the input with server
  if (command === "input") {
    input = parseInt(input, 10);

    // create fake jiffclient for computing shares
    const jiffClient = new JIFFClient("fakeurl", "fakecomputation", {
      autoConnect: false,
    });

    // send shares along with random token to server via some http request.
    const shares = jiffClient.hooks.computeShares(
      jiffClient,
      input,
      [1, "s1"],
      2,
      jiffClient.Zp,
    );
    const token = Buffer.from(sodium.randombytes_buf(32)).toString("base64");
    submitData(token, shares[1], shares["s1"]);
    console.log("to delete submission, use token: ", token);
  } else if (command === "delete") {
    deleteData(input);
  }
}

main();

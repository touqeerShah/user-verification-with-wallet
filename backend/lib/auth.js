const { Header, Payload, SIWWeb3 } = require("@web3auth/sign-in-with-web3");

const domain = "localhost";
const origin = "https://localhost/login";

createWeb3Message = async (req, res) => {
  const header = new Header();
  header.t = "eip191";

  const payload = new Payload();
  payload.domain = domain;
  payload.address = req.query.address;
  payload.uri = origin;
  payload.statement = `This just for verification of account ${req.query.address}`;
  payload.version = "1";
  payload.chainId = req.query.chainId;

  const message = new SIWWeb3({
    header,
    payload,
    network: "ethereum", // allowed values "solana", "ethereum", "starkware"
  });
  // return message.prepareMessage();
  res.send(message.prepareMessage());
};

module.exports = {
  createWeb3Message,
};

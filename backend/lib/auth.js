const { Header, Payload, SIWWeb3 } = require("@web3auth/sign-in-with-web3");
const jwt = require("jsonwebtoken");

const domain = "localhost";
const origin = "https://localhost/login";
let jwtSecret = "test my £$@£ secret DSG U@t 123";
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
  // console.log("payload", payload);
  // return message.prepareMessage();
  res.send({
    message: message.prepareMessage(),
    nonce: payload.nonce,
    issuedAt: payload.issuedAt,
    statement: payload.statement,
    chainId: payload.chainId,
    uri: payload.uri,
  });
};

async function verifyMessage(jsonPayload) {
  console.log("jsonPayload", jsonPayload);
  const { header, payload, signature, network } = JSON.parse(jsonPayload);
  const message = new SIWWeb3({
    header,
    payload,
    network,
  });
  return await message.verify(payload, signature, network);
}

const verify = async (req, res) => {
  const isVerified = await verifyMessage(`{
    "header":{
       "t":"eip191"
    },
    "payload":{
       "domain":"${domain}",
       "address":"${req.body.address}",
       "statement":"${req.body.statement}",
       "uri":"${origin}",
       "version":"1",
       "chainId":${req.body.chainId},
       "nonce":"${req.body.nonce}",
       "issuedAt": "${req.body.issuedAt}"
    },
     "signature":{
        "s":"${req.body.signature}",
        "t":"eip191"
     },
     "network": "ethereum"
    }`);
  console.log("isVerified", isVerified);
  if (isVerified.success) {
    let verifiedAddress = req.body.address;
    const token = jwt.sign({ verifiedAddress }, jwtSecret, { expiresIn: "1d" });
    res.json({ status: 200, token: token });
    console.log("Verified!");
  } else {
    res.json({ status: 400, token: token });

    console.log("Not Verified!");
  }
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, authData) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.authData = authData;

    next();
  });
}
module.exports = {
  createWeb3Message,
  verify,
};

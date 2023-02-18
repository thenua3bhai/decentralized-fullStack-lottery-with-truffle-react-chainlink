import web3 from "./web3";
import Lottery from "../contracts/Lottery.json";

const createLotteryInstance = async () => {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Lottery.networks[networkId];
    const lotteryInstance = new web3.eth.Contract(
      Lottery.abi,
      deployedNetwork && deployedNetwork.address
    );
    console.log("Contract deployed to : ", deployedNetwork.address);
    return lotteryInstance;
  } catch (err) {
    console.log(err);
  }
};
export default createLotteryInstance;

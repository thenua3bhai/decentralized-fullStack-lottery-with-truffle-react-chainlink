import React, { useEffect, useState } from "react";
import "semantic-ui-css/semantic.min.css";
import { Form, Input, Message } from "semantic-ui-react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import web3 from "./utils/web3";

import createLotteryInstance from "./utils/lotteryContract";
import { Paper } from "@mui/material";

export default function LotteryMainPage() {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState(0);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [runUseEffect, setRunUseEffect] = useState(true);
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    async function getData() {
      const lotteryInstance = await createLotteryInstance();
      const m = await lotteryInstance.methods.manager().call();
      const p = await lotteryInstance.methods.getPlayers().call();

      const b = await web3.eth.getBalance(lotteryInstance.options.address);

      setBalance(web3.utils.fromWei(b, "ether"));

      setManager(m);
      setPlayers(p.length);
    }
    getData();
  }, [runUseEffect]);
  const entry = async (e) => {
    e.preventDefault();

    try {
      const lotteryInstance = await createLotteryInstance();
      setLoading(true);
      setErrorMsg("");
      const accounts = await web3.eth.getAccounts();
      await lotteryInstance.methods
        .enter()
        .send({ from: accounts[0], value: web3.utils.toWei(amount, "ether") });
    } catch (err) {
      console.log(err);
      setErrorMsg(err);
    }
    setAmount("");
    setRunUseEffect(!runUseEffect);
    console.log("Entry registered successfully");
    setLoading(false);
  };
  const pickWinner = async (e) => {
    try {
      const lotteryInstance = await createLotteryInstance();
      setLoading(true);
      setErrorMsg("");
      const accounts = await web3.eth.getAccounts();
      await lotteryInstance.methods
        .requestRandomWords()
        .send({ from: accounts[0] });
      console.log("Random req. call success");
      await lotteryInstance.methods.pickWinner().send({ from: accounts[0] });
      console.log("Winner picked success");
      const randomNumber = await lotteryInstance.methods.rand().call();
      console.log("My Random Number", randomNumber);
    } catch (err) {
      console.log(err);
      setErrorMsg(err);
    }
    setRunUseEffect(!runUseEffect);
    console.log("winner is picked");
    setLoading(false);
  };

  const getEthPrice = async () => {
    const lotteryInstance = await createLotteryInstance();
    const price = await lotteryInstance.methods.getLatestPrice().call();
    setEthPrice(price / 100000000);
  };

  return (
    <div>
      <Button variant="contained" onClick={getEthPrice} disabled={loading}>
        Get ETH price latest
      </Button>
      <div>
        <b>Price: ${ethPrice}</b>
      </div>
      <Paper style={{ padding: "25px" }}>
        <link
          async
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
        />
        LotteryMainPage
        <h1>Lottery Contract</h1>
        <p>
          This contract is managed by <b> {manager}</b>. There are{" "}
          <b> {players}</b> people entered, competing to win <b>{balance}</b>{" "}
          ether!
        </p>
        <Form onSubmit={entry} error={!!errorMsg}>
          <Form.Field>
            <label>Enter Ether</label>
            <Input
              placeholder="amount"
              label="ether"
              labelPosition="right"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
            ></Input>
          </Form.Field>
          <Message error header="Something went wrong!!" content={errorMsg} />
          <Button variant="contained" onClick={entry} disabled={loading}>
            Enter
          </Button>
        </Form>
        <Stack spacing={2} direction="row" justifyContent="end">
          <Button
            onClick={pickWinner}
            variant="contained"
            color="success"
            disabled={loading}
          >
            Pick Winner
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react'
import Head from 'next/head';
// material ui
import { makeStyles } from "@material-ui/core/styles";
import { Button, Input } from "@material-ui/core";
// components
import Navbar from "@components/Navbar";
import { neoContext } from "@contexts/neoContext";

const Account = () => {
  const classes = useStyles();
  const { neoLine, address, isAuth } = useContext(neoContext);
  const [isLoacked, setIsLoacked] = useState(false);
  const [res, setRes] = useState('');

  useEffect(() => {
    const fetchLock = async () => {
      const { stack } = await neoLine.invokeRead({
        scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
        operation: "getLockPoolAmount",
        args: [{
          type: "Address",
          value: address.key
        }],
        signers: []
      });
      console.log("here", stack[0].value);
      if (stack[0].value === "1")
        setIsLoacked(true);
      else setIsLoacked(false);
    }
    if (neoLine) fetchLock()
  }, [neoLine, address])

  const lock = async (e) => {
    e.preventDefault();
    const result = await neoLine.invoke({
      scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
      operation: "lockToken",
      args: [
        {
          type: "Address",
          value: address.key
        },
        {
          type: "Any",
          value: null
        }
      ],
      signers: [{ account: address.publicKey, scopes: 128 }]
    });
    if (result)
      setIsLoacked(true);
    console.log(result);
    setRes(result.txid);
  }

  return (
    <React.Fragment>
      <Head>
        <title>~/cattery/register/</title>
      </Head>
      <Navbar />
      {console.log("isLoacked", isLoacked)}
      <section className={classes.boxContainer}>
        <h1 className={classes.title}>Register</h1>
        <hr className={classes.break} />
        <div className={classes.descText}>
          {!isLoacked && 'Please, first lock your Whisker (WSK) tokens to start accepting NFT invites.'}
          {isLoacked && 'You have already locked the WSK tokens, go ask for NFT referals.'}
        </div>

        {!isLoacked && <Button onClick={lock} className={classes.btn}>Lock tokens</Button>}
        <div className={classes.descText}>
          <br />
          {res && "You have locked WSK, go ask for referal nft."}
          <br />
          {res && <>"Tx Id - " + {res}</>}
        </div>
      </section>
    </React.Fragment>
  )
}

const useStyles = makeStyles((theme) => ({
  ...theme.overrides.customRule,
  title: {
    fontSize: 40,
    fontWeight: 400,
    margin: 0,
    ["@media (max-width:599px)"]: {
      fontSize: 25,
    },
  },
  break: {
    border: "none",
    height: 1.2,
    background: "linear-gradient(to right, rgb(80, 250, 123), rgb(21, 101, 192))"
  },
  descText: {
    fontSize: 17,
    color: "#EEEEEE",
    fontWeight: 400,
    padding: "20px 20px 0 0"
  },
  roomList: {
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    display: "grid",
    gridGap: "1.25rem",
    gridTemplateColumns: "repeat(2, 1fr)",
    marginTop: "2rem",
    transition: "0.4s ease-in-out",
    marginTop: 20,
    ["@media (max-width:599px)"]: {
      gridTemplateColumns: "repeat(1, 1fr)",
    },
  },
  room: {
    width: "100%",
    minHeight: "200px",
    borderRadius: 12,
    background: "linear-gradient(180deg,#efa971,#e4cafe)",
    padding: "1.25rem 1.25rem 60px",
    animation: "$bottom_up 1s ease-in-out",

    "&:nth-child(1)": {
      background: "linear-gradient(180deg,#dbb4f3,#efb7d7)"
    },
    "&:nth-child(2)": {
      background: "linear-gradient(180deg,#efa971,#e4cafe)"
    },
    "&:nth-child(3)": {
      background: "linear-gradient(180deg,#b1e5f9,#f4d2fe)"
    },
    "&:nth-child(4)": {
      background: "linear-gradient(90deg,#b1e5f9,#f4d2fe)"
    },
    "&:nth-child(5)": {
      background: "linear-gradient(180deg,#f3cbab,#feedca)"
    },

    "&:hover": {
      transform: "scale(1.02)"
    }
  },
  "@keyframes bottom_up": {
    "0%": {
      opacity: 0,
      transform: "translateY(40px)"
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)"
    }
  },
  roomTitle: {
    color: "#000",
    fontSize: 25,
    fontWeight: 300,
    letterSpacing: "-.5px",
    margin: 0,
    ["@media (max-width:599px)"]: {
      fontSize: 20,
    },
  }
}));

export default Account;

import React, { useState, useEffect, useContext } from 'react'
import Head from 'next/head';
// material ui
import { makeStyles } from "@material-ui/core/styles";
import { Button, Input } from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
// components
import Navbar from "@components/Navbar";
import { neoContext } from "@contexts/neoContext";

const Account = () => {
  const classes = useStyles();
  const { neoLine, address, userNft } = useContext(neoContext);
  const [isMinted, setIsMinted] = useState(false);
  const [inviteUri, setInviteUri] = useState('askReferal');
  const [loading, setLoading] = useState(false);
  const [inviteLeft, setInviteLeft] = useState(2);
  const [imgBlob, setImgBlob] = useState({ a: '', b: '' });
  const [res, setRes] = useState('');
  const [inp, setInp] = useState('');

  // 1 image -> from context [getOwnerNftDetails]
  // 2 image -> inviteUri [getInviteeNftDetails]
  useEffect(() => {
    const fetchLock = async () => {
      setLoading(true);
      console.log("check getInviteeNftDetails");
      const { stack } = await neoLine.invokeRead({
        scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
        operation: "getInviteeNftDetails",
        args: [{
          type: "Address",
          value: address.key
        }],
        signers: []
      });
      console.log("invitee NFTs url", stack[0]);
      if (stack[0].value) {
        setIsMinted(true);
        let bal = atob(stack[0].value);
        bal = bal.substring(1, bal.length - 1);
        setInviteUri(bal);
      } else {
        setInviteUri('askReferal')
      }
      setLoading(false);
    }
    if (neoLine) fetchLock()
  }, [address])
  // number of nft Image left
  useEffect(() => {
    const fetchInviteLeft = async () => {
      setLoading(true);
      const { stack } = await neoLine.invokeRead({
        scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
        operation: "getOwnerInviteeLeft",
        args: [{
          type: "Address",
          value: address.key
        }],
        signers: []
      });
      console.log("invites left", stack[0]);
      if (stack[0].value) {
        setInviteLeft(stack[0].value);
      }
      setLoading(false);
    }
    if (neoLine && isMinted) fetchInviteLeft()
  }, [address, isMinted])

  // transfer nft
  const transferNFT = async (e) => {
    // take input for address 
    console.log(inp);
    e.preventDefault();
    const result = await neoLine.invoke({
      scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
      operation: "transferNft",
      args: [
        {
          type: "Address",
          value: inp
        },
      ],
      signers: [{ account: address.publicKey, scopes: 128 }]
    });
    setIsMinted(true);
    console.log(result);
    setRes(result.txid);
  }
  const convertBase64ToBlob = async (base64Image) => {
    const decodedData = window.atob(base64Image);
    const uInt8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    return new Blob([uInt8Array]);
  }
  useEffect(() => {
    const fetchImg = async () => {
      console.log("here")
      let res = await fetch(`https://www.cattery-backend.ml/getImage/${userNft}`);
      res = await res.json();
      let img = res.image;
      let end = await img.length;
      let b = await img.substring(2, end - 1)
      let blob = await convertBase64ToBlob(b);
      console.log(blob);
      let objectURL1 = URL.createObjectURL(blob)

      res = await fetch(`https://www.cattery-backend.ml/getImage/${inviteUri}`);
      res = await res.json();
      img = res.image;
      end = await img.length;
      b = await img.substring(2, end - 1)
      blob = await convertBase64ToBlob(b);
      console.log(blob);
      let objectURL2 = URL.createObjectURL(blob)

      setImgBlob({ a: objectURL1, b: objectURL2 });
    }
    if (userNft && inviteUri !== 'askReferal' && isMinted) fetchImg();
    console.log(userNft, inviteUri)
  }, [userNft, inviteUri])

  // mint
  const mint = async (e) => {
    console.log("minting")
    e.preventDefault();
    const result = await neoLine.invoke({
      scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
      operation: "mint",
      args: [{
        type: "String",
        value: `https://www.cattery-backend.ml/generate/${address.key}`
      }],
      signers: [{ account: address.publicKey, scopes: 128 }]
    });
    setIsMinted(true);
    // setRes(result);
    console.log(result);
  }

  const NotValid = (
    <section className={classes.boxContainer}>
      <h1 className={classes.title}>Wallet</h1>
      <hr className={classes.break} />
      <div className={classes.descText}>
        Looks like you have not minted the NFT.
      </div>

      <div style={{ margin: "auto", textAlign: "center" }}>
        <img src="/cat.png" className={classes.img} />
      </div>
      <div className={classes.descText}>
        <Button onClick={mint} className={classes.btn}>Mint your NFT</Button>
      </div>
    </section>
  )
  return (
    <React.Fragment>
      <Head>
        <title>~/cattery/all-rooms/</title>
      </Head>
      <Navbar />
      {inviteUri === 'askReferal' ? NotValid :
        <section className={classes.boxContainer}>
          <h1 className={classes.title}>Wallet</h1>
          <hr className={classes.break} />
          <div className={classes.descText}>
            {loading && <CircularProgress />}
            <br />
            Congratulations 🥳 you are now part of the system.
          </div>
          {/* <div style={{ margin: "auto", textAlign: "center" }}>
            <img src="/cat.png" className={classes.img} />
          </div> */}
          <div style={{ margin: "auto", textAlign: "center" }}>
            <img src={imgBlob.a} className={classes.img} style={{ width: 200, marginTop: 20 }} />
          </div>
          <div className={classes.descText}>
            You have → {inviteLeft} invites. You can invite your friends with this.
            <br />
            <img src={imgBlob.b} className={classes.img} style={{ width: 200, marginTop: 20 }} />
            <br />
            <br />
            <Input value={inp} onChange={(e) => setInp(e.target.value)} style={{ color: '#fff' }} />
            <br />
            {
              <Button onClick={transferNFT} className={classes.btn}>Tranfer refer NFT</Button>
            }
          </div>

          <div className={classes.descText}>
            <br />
            {res && "Tranfered referal nft."}
            <br />
            {res && <>"Tx Id - " + {res}</>}
          </div>
        </section>
      }
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
    padding: "20px 20px 0 0",
    textAlign: "center"
  },
  img: {
    margin: "auto",
    // width: 50,
    animation: "$bottom_up 1s ease-in-out",
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

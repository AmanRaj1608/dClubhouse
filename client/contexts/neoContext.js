import { createContext, useEffect, useRef, useState } from "react";
import { NeoLineN3Init } from "@utils/neoline";

export const neoContext = createContext();

export default function Neo({ children }) {
  const [neoLine, setNeoLine] = useState(null);
  const [address, setAddress] = useState({});
  const [userNft, setUserNft] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  const initNeoLine = async () => {
    console.info('initializing neoline...');
    const neoLineObj = await NeoLineN3Init();
    setNeoLine(neoLineObj);

    const addr = await neoLineObj.getPublicKey();
    const { scriptHash: publicKey } = await neoLineObj.AddressToScriptHash({ address: addr.address });
    setAddress({
      key: addr.address,
      publicKey
    });
    console.info("Address found", addr.address, publicKey);

    const { stack } = await neoLineObj.invokeRead({
      scriptHash: "0x7d5cbdae1671be0da45c36228adf4da6d613ce85",
      operation: "getOwnerNftDetails",
      args: [
        {
          type: "Address",
          value: addr.address
        }
      ],
      signers: []
    });
    console.log(stack)
    if (stack[0].value) {
      let bal = atob(stack[0].value);
      bal = bal.substring(1, bal.length - 1)
      console.info("ownerNFT", bal);
      setIsAuth(true);
      setUserNft(bal);
    } else {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    if (window.NEOLineN3) {
      console.info('NEOLineN3 is already initialized...');
      initNeoLine();
    } else {
      console.info('NEOLineN3 is not yet initialized...');
      window.addEventListener('NEOLine.NEO.EVENT.READY', initNeoLine, true);
    }
    return function cleanUp() {
      // window.removeEventListener('NEOLine.NEO.EVENT.BLOCK_HEIGHT_CHANGED', updateContractsState, true);
      window.removeEventListener('NEOLine.NEO.EVENT.READY', initNeoLine, true);
    };
  }, []);

  return (
    <neoContext.Provider value={{ neoLine, address, isAuth, userNft }}>
      {children}
    </neoContext.Provider>
  );
}

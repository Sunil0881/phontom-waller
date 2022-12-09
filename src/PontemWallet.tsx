import React, { useEffect, useState, useCallback } from 'react';

import './styles.scss';
import { IPontemWalletProvider, IWindow, TAptosCreateTx } from './types';
import { camelCaseKeysToUnderscore, detectPontemProvider } from './utils';
import { Hint, SendTransaction, Address } from './components';

export function PontemWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>('');
  const [walletProvider, setWalletProvider] = useState<IPontemWalletProvider | undefined>();

  const handleAddressChange = useCallback((currentAddress: string | any) => {
    if (typeof address === 'string' && currentAddress) {
      if (currentAddress !== address) {
        setAddress(currentAddress);
      }
      setConnected(true);
    } else {
      setAddress(undefined);
      setConnected(false);
    }
  }, [address]);

  const handleSendTransaction = useCallback(async (tx: TAptosCreateTx) => {
    const payload = camelCaseKeysToUnderscore(tx.payload);
    const options = {
      max_gas_amount: tx?.maxGasAmount,
      gas_unit_price: tx?.gasUnitPrice,
      expiration_timestamp_secs: tx?.expiration,
    };

    return walletProvider?.signAndSubmit(payload, options)
      .then((response: any) => response.result.hash);
  }, [walletProvider]);

  const handleConnect = useCallback(() => {
    detectPontemProvider({ timeout: 100 }).then(async (provider) => {
      if (!provider) {
        setWalletProvider(undefined);
        setConnected(false);
        return;
      }

      setWalletProvider(provider);
      try {
        const newAddress = await provider.connect();
        setAddress(newAddress);
        setConnected(true);
      } catch (e) {
        setAddress('');
        setConnected(false);
        console.log(e);
      }

      provider.onChangeAccount(handleAddressChange);

      localStorage.setItem('pontemWallet', 'connected');
    });
  }, [handleAddressChange]);

  const handleDisconnect = () => {
    setAddress(undefined);
    setConnected(false);
    setWalletProvider(undefined);
    localStorage.setItem('pontemWallet', 'disconnected');
  };

  const getHint = () => {
    if (!connected && (window as IWindow).pontem === undefined) {
      return <Hint hint="download extension" />;
    }
    if (!connected && (window as IWindow).pontem !== undefined) {
      return <Hint hint="connect wallet" />;
    }

    return null;
  };

  useEffect(() => {
    const status = localStorage.getItem('pontemWallet');
    if (status === 'connected') {
      handleConnect();
    }
  }, [handleConnect]);

  return (
    <div className="wallet">
      {connected
        ? <button className="w-button" onClick={handleDisconnect} type="button">Disconnect wallet</button>
        : <button className="w-button" onClick={handleConnect} type="button">Connect wallet</button>}
      <Address address={address} walletName="Pontem Wallet" />
      {connected && <SendTransaction sender={address} onSendTransaction={handleSendTransaction} />}
      {getHint()}
    </div>
  );
}

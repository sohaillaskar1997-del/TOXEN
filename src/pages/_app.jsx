import '../styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {PhantomWalletAdapter} from '@solana/wallet-adapter-phantom';
import {useMemo} from 'react';
import { DEFAULT_RPC } from '../lib/solana';

export default function MyApp({Component,pageProps}){
  const wallets = useMemo(()=>[new PhantomWalletAdapter()],[]);
  return (
    <ConnectionProvider endpoint={DEFAULT_RPC}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <Component {...pageProps} />
      </WalletProvider>
    </ConnectionProvider>
  );
}

import React, {useEffect, useState} from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { DEFAULT_RPC, SELLER_SOL, DEMO_TOKEN_MINT, SELLER_TOKEN_ACCOUNT } from '../lib/solana';
import { getAssociatedTokenAddress, getMint, createTransferCheckedInstruction } from '@solana/spl-token';

export default function PhantomConnect(){
  const { publicKey, connected, signTransaction } = useWallet();
  const [balance,setBalance] = useState(null);
  const [conn,setConn] = useState(null);

  useEffect(()=>{ setConn(new Connection(DEFAULT_RPC,'confirmed')); },[]);

  useEffect(()=>{
    let mounted=true;
    async function load(){
      if(!publicKey || !conn){ setBalance(null); return; }
      try{ const b = await conn.getBalance(publicKey); if(!mounted) return; setBalance(b / LAMPORTS_PER_SOL); }catch(e){console.error(e)}
    }
    load(); return ()=> mounted=false;
  },[publicKey,conn]);

  const handleBuy = async ()=>{
    if(!publicKey) return alert('Connect Phantom (Devnet)');
    if(!SELLER_SOL) return alert('Seller SOL not configured');
    try{
      const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(SELLER_SOL), lamports: Math.round(0.01 * LAMPORTS_PER_SOL) })
      );
      tx.feePayer = publicKey;
      const { blockhash } = await conn.getRecentBlockhash('finalized');
      tx.recentBlockhash = blockhash;
      const signed = await signTransaction(tx);
      const sig = await conn.sendRawTransaction(signed.serialize());
      await conn.confirmTransaction(sig,'confirmed');
      alert('Buy tx sent: ' + sig);
    }catch(e){ alert('Buy failed: '+(e.message || e)); }
  };

  const handleSell = async ()=>{
    if(!publicKey) return alert('Connect Phantom (Devnet)');
    if(!DEMO_TOKEN_MINT || !SELLER_TOKEN_ACCOUNT) return alert('Demo token or seller token account not set');
    try{
      const mint = new PublicKey(DEMO_TOKEN_MINT);
      const userAta = await getAssociatedTokenAddress(mint, publicKey);
      const sellerAta = new PublicKey(SELLER_TOKEN_ACCOUNT);
      const mintInfo = await getMint(conn, mint);
      const decimals = mintInfo.decimals;
      const amount = BigInt(1) * BigInt(Math.pow(10, decimals));
      const ix = createTransferCheckedInstruction(userAta, mint, sellerAta, publicKey, amount, decimals);
      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;
      const { blockhash } = await conn.getRecentBlockhash('finalized');
      tx.recentBlockhash = blockhash;
      const signed = await signTransaction(tx);
      const sig = await conn.sendRawTransaction(signed.serialize());
      await conn.confirmTransaction(sig,'confirmed');
      alert('Sell tx sent: ' + sig);
    }catch(e){ alert('Sell failed: '+(e.message || e)); }
  };

  return (
    <div className="card" style={{textAlign:'center'}}>
      <div style={{marginBottom:12 }}><WalletMultiButton /></div>
      <div><strong>Connected:</strong> {connected ? 'Yes' : 'No'}</div>
      <div style={{marginTop:6}}><strong>Address:</strong> {publicKey ? publicKey.toString() : '—'}</div>
      <div style={{marginTop:6}}><strong>SOL:</strong> {balance===null ? '—' : balance}</div>
      <div style={{marginTop:12, display:'flex', gap:8, justifyContent:'center'}}>
        <button className="btn" onClick={handleBuy} disabled={!connected}>Buy TOXEN (0.01 SOL)</button>
        <button className="btn" onClick={handleSell} disabled={!connected}>Sell 1 TOXEN</button>
      </div>
      <div className="small" style={{marginTop:10}}>Set Phantom network to Devnet. This demo sends a SOL transfer (Buy) and an SPL token transfer (Sell).</div>
    </div>
  );
}

import React, {useEffect, useState} from 'react';
import PhantomConnect from '../components/PhantomConnect';
import MultiWalletBatch from '../components/MultiWalletBatch';
import { PUMP_API } from '../lib/solana';

export default function Home(){
  const [tokens,setTokens] = useState([]);
  useEffect(()=>{ async function fetchTokens(){ if(!PUMP_API){ setTokens([{symbol:'TOXEN_DEV',name:'TOXEN Dev Token',price:'0.001 SOL',change:'+120%','url':'https://pump.fun/token/TOXEN_DEV'}]); return; } try{ const r = await fetch(PUMP_API); const j = await r.json(); setTokens(j.data || []); }catch(e){ console.error(e);} } fetchTokens(); },[]);
  return (
    <main className="container">
      <header className="header"><div className="brand"><img src="/logo.svg" className="logo"/><div><h1>TOXEN</h1><div className="tag">Devnet Demo</div></div></div><div><a className="btn" href="https://pump.fun" target="_blank" rel="noreferrer">Open pump.fun</a></div></header>
      <div className="grid">
        <div className="card">
          <h3>Pump.fun — Trending (view-only)</h3>
          <div className="small">Mock list by default. Set NEXT_PUBLIC_PUMP_API_URL to proxy a real feed.</div>
          <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
            {tokens.map(t=>(<div key={t.symbol} className="pump-item"><strong>{t.symbol}</strong><div style={{fontSize:13,color:'#9AA7B2'}}>{t.name}</div><div style={{marginTop:8,display:'flex',gap:8'}}><a className="btn" href={t.url} target="_blank" rel="noreferrer">Open</a></div></div>))}
          </div>
        </div>
        <aside>
          <PhantomConnect/>
          <div style={{height:12}}/>
          <MultiWalletBatch/>
        </aside>
      </div>
    </main>
  )
}

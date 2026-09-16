'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Camera, Check, ChevronLeft, Package, ShieldCheck, Sparkles, Tag, TrendingUp, Upload, Zap } from 'lucide-react';

const examples = [
  { icon: '🎮', name: 'Gaming', item: 'Nintendo Switch OLED', price: 185 },
  { icon: '📱', name: 'Electronics', item: 'iPhone 14 128GB', price: 315 },
  { icon: '👟', name: 'Fashion', item: 'Nike Dunk Low', price: 72 },
];

const conditions = [
  ['New', 'Unused, sealed or never worn', 1.15],
  ['Like new', 'Barely used, excellent condition', 1.05],
  ['Good', 'Normal signs of use, fully working', 0.95],
  ['Fair', 'Noticeable wear or cosmetic damage', 0.75],
];

export default function Home() {
  const [step, setStep] = useState('home');
  const [item, setItem] = useState('');
  const [condition, setCondition] = useState(2);
  const [box, setBox] = useState(true);
  const [charger, setCharger] = useState(true);
  const [mode, setMode] = useState('sell');
  const [paid, setPaid] = useState('');

  const base = useMemo(() => {
    const text = item.toLowerCase();
    if (text.includes('iphone')) return 330;
    if (text.includes('switch')) return 190;
    if (text.includes('playstation') || text.includes('ps5')) return 350;
    if (text.includes('xbox')) return 280;
    if (text.includes('airpods')) return 90;
    if (text.includes('dunk') || text.includes('nike')) return 75;
    if (text.includes('macbook')) return 520;
    return 120;
  }, [item]);

  const estimate = Math.round(base * conditions[condition][2] * (charger ? 1 : 0.9) * (box ? 1 : 0.95));
  const low = Math.max(15, Math.round(estimate * 0.9 / 5) * 5);
  const high = Math.round(estimate * 1.1 / 5) * 5;
  const tradeIn = Math.round(estimate * 0.78 / 5) * 5;
  const profit = paid ? Math.max(0, estimate - Number(paid)) : null;

  function start(value = '') { setItem(value); setStep('identify'); }

  if (step === 'home') return <main className="shell">
    <nav className="nav"><div className="logo">Worth<span>It</span></div><div className="nav-pill"><Zap size={14}/> UK resale + trade-in</div></nav>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={15}/> Know before you sell</div>
      <h1>Find out what your<br/><span>stuff is worth.</span></h1>
      <p className="hero-copy">Get a realistic UK resale estimate — then compare it with a quick trade-in offer.</p>
      <div className="search-card">
        <button className="upload" onClick={() => start()}><Camera size={22}/><div><b>Upload photos</b><small>1–4 photos · JPG, PNG</small></div><ArrowRight/></button>
        <div className="or"><i/>or<i/></div>
        <div className="describe"><Tag size={20}/><input value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && start(item)} placeholder="Describe your item · e.g. Nintendo Switch OLED"/><button onClick={() => start(item)} disabled={!item.trim()}>Check value <ArrowRight size={17}/></button></div>
      </div>
      <div className="trust"><span>✓ Free estimates</span><span>✓ UK prices</span><span>✓ No account required</span></div>
    </section>
    <section className="examples"><div className="section-head"><div><small>TRY IT OUT</small><h2>What are you selling?</h2></div></div><div className="example-grid">{examples.map(x => <button key={x.name} className="example" onClick={() => start(x.item)}><div className="example-icon">{x.icon}</div><div><b>{x.name}</b><span>{x.item}</span></div><strong>£{x.price}</strong></button>)}</div></section>
    <section className="how"><div><small>THE WORTHIT FLOW</small><h2>Value it. Trade it. Sell it.</h2><p>One simple check gives you two routes: maximise your price yourself, or take the convenience of a trade-in.</p></div><div className="flow"><div><b>01</b><span>Identify</span></div><div><b>02</b><span>Condition</span></div><div><b>03</b><span>Get offers</span></div></div></section>
    <footer>WorthIt · Built for UK resale · Estimates are indicative, not guaranteed.</footer>
  </main>;

  if (step === 'identify') return <main className="shell"><div className="topline"><button onClick={() => setStep('home')} className="back"><ChevronLeft/> Back</button><span>1 / 3</span></div><section className="wizard"><div className="progress"><i className="on"/><i/><i/></div><div className="wizard-icon"><Camera/></div><h1>What are we looking at?</h1><p>Upload up to 4 photos or tell us what the item is.</p><div className="drop" onClick={() => document.getElementById('file').click()}><Upload size={30}/><b>Drop photos here</b><span>or click to browse</span><input id="file" type="file" accept="image/*" multiple hidden onChange={() => setStep('condition')}/></div><div className="describe"><Tag size={20}/><input value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Nintendo Switch OLED white"/><button onClick={() => setStep('condition')}>Continue <ArrowRight size={17}/></button></div></section></main>;

  if (step === 'condition') return <main className="shell"><div className="topline"><button onClick={() => setStep('identify')} className="back"><ChevronLeft/> Back</button><span>2 / 3</span></div><section className="wizard"><div className="progress"><i className="on"/><i className="on"/><i/></div><div className="identified"><div className="mini-photo">📦</div><div><small>IDENTIFIED</small><b>{item || 'Your item'}</b><span>Confidence: High · UK market</span></div></div><h2>How would you describe its condition?</h2><div className="condition-grid">{conditions.map((c,i)=><button key={c[0]} className={condition===i?'selected':''} onClick={()=>setCondition(i)}><span className="radio">{condition===i && <Check size={14}/>}</span><div><b>{c[0]}</b><small>{c[1]}</small></div></button>)}</div><h2 className="extras-title">What's included?</h2><div className="toggles"><button onClick={()=>setBox(!box)} className={box?'active':''}><Package/> Original box <span>{box?'Yes':'No'}</span></button><button onClick={()=>setCharger(!charger)} className={charger?'active':''}><Zap/> Charger / essentials <span>{charger?'Yes':'No'}</span></button></div><button className="primary full" onClick={()=>setStep('result')}>Get my estimate <ArrowRight/></button></section></main>;

  return <main className="shell result-shell"><nav className="nav"><div className="logo">Worth<span>It</span></div><button className="new-check" onClick={()=>setStep('home')}>+ Check another</button></nav><section className="result-head"><div className="eyebrow"><Sparkles size={15}/> WorthIt estimate</div><h1>{item || 'Your item'}</h1><p>Based on UK second-hand market signals, condition and included accessories.</p></section><section className="result-grid"><div className="value-card"><div className="card-label">ESTIMATED UK RESALE VALUE</div><div className="big-price">£{estimate}</div><div className="range">Likely selling range: <b>£{low}–£{high}</b></div><div className="price-bars"><div><span>Quick sale</span><b>£{low}</b></div><div className="featured"><span>Typical listing</span><b>£{estimate}</b></div><div><span>Patient seller</span><b>£{high}</b></div></div><div className="affects"><b>What affects your price</b><span>✓ {conditions[condition][0]} condition</span>{box?<span>✓ Original box included</span>:<span>× No original box</span>}{charger?<span>✓ Charger included</span>:<span>× Missing charger</span>}</div></div><div className="trade-card"><div className="trade-top"><div><small>THE EASY ROUTE</small><h2>Trade it in</h2></div><ShieldCheck/></div><p>Skip the listing, messages and waiting. Get an indicative trade-in value from a reseller.</p><div className="trade-price">£{tradeIn}<span>estimated trade-in</span></div><button className="trade-button" onClick={()=>setMode('trade')}>Compare trade-in offers <ArrowRight/></button><small className="note">Trade-in offers are usually lower than private-sale prices.</small></div></section><section className="sell-section"><div className="sell-head"><div><small>MAXIMISE YOUR RETURN</small><h2>Sell it yourself</h2></div><div className="mode-switch"><button className={mode==='sell'?'active':''} onClick={()=>setMode('sell')}>Resale</button><button className={mode==='trade'?'active':''} onClick={()=>setMode('trade')}>Trade-in</button></div></div><div className="market-grid"><div><b>eBay</b><span>£{estimate}–£{high}</span><small>Largest buyer pool</small></div><div><b>Vinted</b><span>£{Math.round(estimate*.9/5)*5}–£{Math.round(high*.95/5)*5}</span><small>Low-friction selling</small></div><div><b>Facebook Marketplace</b><span>£{Math.round(low*.95/5)*5}–£{estimate}</span><small>Local collection</small></div></div><div className="listing"><div><div className="listing-icon"><TrendingUp/></div><div><b>Sell it faster</b><p>Generate a ready-to-copy listing with a suggested asking price of <strong>£{Math.round(high*.97/5)*5}</strong>.</p></div></div><button className="outline">Generate listing <ArrowRight/></button></div></section><section className="profit"><div><small>RESELLER TOOL</small><h2>💰 Profit calculator</h2><p>See what you'd actually make after buying the item.</p></div><div className="profit-input"><label>I paid</label><div>£<input type="number" min="0" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="120"/></div></div><div className="profit-result"><small>EST. PROFIT BEFORE SELLING FEES</small><b>{profit === null ? '£—' : `£${profit}`}</b></div></section><footer>WorthIt · UK resale estimates · Always check the final offer and marketplace fees before selling.</footer></main>;
}
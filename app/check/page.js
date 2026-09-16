'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, Check, ChevronLeft, Database, Package, Sparkles, Tag, Upload, Zap } from 'lucide-react';

const conditions = [
  ['New', 'Unused or sealed', 1.15],
  ['Like new', 'Barely used', 1.05],
  ['Good', 'Normal signs of use', 0.95],
  ['Fair', 'Visible wear', 0.75],
];

const fallbackBases = [
  ['iphone', 330], ['switch', 190], ['playstation', 350], ['ps5', 350],
  ['xbox', 280], ['airpods', 90], ['dunk', 75], ['nike', 75], ['macbook', 520],
];

function CheckFlow() {
  const params = useSearchParams();
  const [step, setStep] = useState('identify');
  const [item, setItem] = useState('');
  const [condition, setCondition] = useState(2);
  const [box, setBox] = useState(true);
  const [charger, setCharger] = useState(true);
  const [market, setMarket] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState('');

  useEffect(() => {
    const value = params.get('item');
    if (value) setItem(value);
  }, [params]);

  const fallbackEstimate = useMemo(() => {
    const base = fallbackBases.find(([key]) => item.toLowerCase().includes(key))?.[1] ?? 120;
    return Math.round(base * conditions[condition][2] * (charger ? 1 : 0.9) * (box ? 1 : 0.95));
  }, [item, condition, box, charger]);

  const estimate = market?.median ?? fallbackEstimate;
  const low = market?.low ?? Math.max(15, Math.round(estimate * 0.9 / 5) * 5);
  const high = market?.high ?? Math.round(estimate * 1.1 / 5) * 5;
  const tradeIn = Math.round(estimate * 0.78 / 5) * 5;

  async function loadMarket() {
    setLoadingMarket(true);
    setMarketError('');
    try {
      const response = await fetch(`/api/market?q=${encodeURIComponent(item)}`);
      const data = await response.json();
      if (data.source === 'ebay-live') setMarket(data);
      else if (data.message) setMarketError(data.message);
    } catch {
      setMarketError('Live market data is unavailable right now.');
    } finally {
      setLoadingMarket(false);
    }
  }

  function showResult() {
    setStep('result');
    loadMarket();
  }

  return (
    <main className="app-shell clean-check">
      <div className="app-top">
        <Link href="/" className="logo">Worth<span>It</span></Link>
        <div className="simple-progress"><span className={step !== 'identify' ? 'done' : 'active'} /><span className={step === 'result' ? 'done' : step === 'condition' ? 'active' : ''} /><span className={step === 'result' ? 'active' : ''} /></div>
        <Link href="/" className="exit">Exit</Link>
      </div>

      {step === 'identify' && (
        <section className="simple-flow">
          <button className="back-link" onClick={() => window.history.back()}><ChevronLeft size={16} /> Back</button>
          <div className="simple-heading">
            <div className="eyebrow"><Sparkles size={13} /> 1 · Identify</div>
            <h1>What are you selling?</h1>
            <p>Tell us the item. We’ll check the market before giving you a number.</p>
          </div>
          <div className="simple-input-card">
            <div className="photo-button"><Camera size={22} /><div><b>Add a photo</b><span>Photo identification coming next</span></div><Upload size={17} /></div>
            <div className="or-line"><span>or</span></div>
            <div className="text-input"><Tag size={18} /><input autoFocus value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && item.trim() && setStep('condition')} placeholder="e.g. Nintendo Switch OLED white" /><button disabled={!item.trim()} onClick={() => setStep('condition')}><ArrowRight size={18} /></button></div>
          </div>
          <div className="small-trust"><span>UK market</span><span>No account</span><span>~30 seconds</span></div>
        </section>
      )}

      {step === 'condition' && (
        <section className="simple-flow">
          <button className="back-link" onClick={() => setStep('identify')}><ChevronLeft size={16} /> Back</button>
          <div className="simple-heading left">
            <div className="eyebrow">2 · Condition</div>
            <h1>How is it?</h1>
            <p>Be honest. Condition changes what buyers will actually pay.</p>
          </div>
          <div className="condition-list">
            {conditions.map((entry, index) => (
              <button key={entry[0]} className={condition === index ? 'selected' : ''} onClick={() => setCondition(index)}>
                <span className="condition-radio">{condition === index && <Check size={12} />}</span>
                <span><b>{entry[0]}</b><small>{entry[1]}</small></span>
              </button>
            ))}
          </div>
          <div className="extras-row">
            <button className={box ? 'on' : ''} onClick={() => setBox(!box)}><Package size={17} /> Box <span>{box ? 'Yes' : 'No'}</span></button>
            <button className={charger ? 'on' : ''} onClick={() => setCharger(!charger)}><Zap size={17} /> Charger <span>{charger ? 'Yes' : 'No'}</span></button>
          </div>
          <button className="big-continue" onClick={showResult}>Check real market <ArrowRight size={18} /></button>
        </section>
      )}

      {step === 'result' && (
        <section className="simple-results">
          <div className="result-top"><button className="back-link" onClick={() => setStep('condition')}><ChevronLeft size={16} /> Change details</button><Link href="/check" className="new-check">New check</Link></div>
          <div className="result-heading"><span className="eyebrow"><Database size={13} /> Live market check</span><h1>{item}</h1><p>{market ? `Compared with ${market.listingCount} current eBay UK listings.` : loadingMarket ? 'Checking current eBay UK listings…' : 'Your live market connection is not configured yet.'}</p></div>

          <div className="main-value">
            <div><small>ESTIMATED RESALE</small><strong>£{estimate}</strong><span>Likely range £{low}–£{high}</span></div>
            <div className="data-status">{market ? <><Check size={15} /> Live eBay UK data</> : loadingMarket ? 'Loading…' : 'Modelled estimate'}</div>
          </div>

          <div className="market-source">
            <div><b>Where this number comes from</b><p>{market?.note || marketError || 'WorthIt can use live marketplace listings instead of pretending a fixed price is current.'}</p></div>
            <span>{market ? 'LIVE' : 'SETUP NEEDED'}</span>
          </div>

          <div className="simple-breakdown">
            <div><span>Condition</span><b>{conditions[condition][0]}</b></div>
            <div><span>Original box</span><b>{box ? 'Included' : 'Missing'}</b></div>
            <div><span>Charger</span><b>{charger ? 'Included' : 'Missing'}</b></div>
          </div>

          <div className="sell-choice">
            <div><small>WHAT NEXT?</small><h2>Choose your route</h2></div>
            <div className="route-options">
              <div><b>Sell yourself</b><strong>£{high}</strong><span>More return, more work</span><button>See selling options <ArrowRight size={16} /></button></div>
              <div><b>Trade in</b><strong>£{tradeIn}</strong><span>Less hassle, indicative value</span><button>Compare trade-in <ArrowRight size={16} /></button></div>
            </div>
          </div>

          <div className="data-note"><Database size={16} /><span>WorthIt is being built around platform data, not made-up marketplace prices. eBay’s public Browse API provides current listings; completed-sale data is available through eBay’s restricted Marketplace Insights API, so WorthIt will use that when access is approved.</span></div>
          <footer>WorthIt · UK resale estimates · Indicative values, not guaranteed offers.</footer>
        </section>
      )}
    </main>
  );
}

export default function CheckPage() {
  return <Suspense fallback={<main className="app-shell clean-check"><div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link></div></main>}><CheckFlow /></Suspense>;
}

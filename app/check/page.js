'use client';

import Link from 'next/link';
import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, Check, ChevronLeft, ImagePlus, LoaderCircle, Sparkles, Upload } from 'lucide-react';

const conditions = [
  ['New', 'Unused or sealed', 1.15],
  ['Like new', 'Barely used', 1.05],
  ['Good', 'Normal signs of use', 0.95],
  ['Fair', 'Visible wear', 0.75],
];

function CheckFlow() {
  const params = useSearchParams();
  const inputRef = useRef(null);
  const [step, setStep] = useState('identify');
  const [item, setItem] = useState(params.get('item') || '');
  const [condition, setCondition] = useState(2);
  const [box, setBox] = useState(true);
  const [charger, setCharger] = useState(true);
  const [market, setMarket] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [error, setError] = useState('');

  async function identifyImage(file) {
    if (!file) return;
    setError('');
    setIdentifying(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await fetch('/api/identify', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not identify the item.');
      const name = [data.brand, data.product, data.model, data.variant].filter(v => v && v !== 'unknown').join(' ');
      setItem(name || 'Unknown item');
      if (data.condition && data.condition !== 'unknown') {
        const index = { new: 0, like_new: 1, good: 2, fair: 3 }[data.condition];
        if (index !== undefined) setCondition(index);
      }
      setStep('condition');
    } catch (e) {
      setError(e.message || 'Could not identify the item.');
    } finally {
      setIdentifying(false);
    }
  }

  async function loadMarket() {
    setLoadingMarket(true);
    setError('');
    try {
      const response = await fetch(`/api/market?q=${encodeURIComponent(item)}`);
      setMarket(await response.json());
    } catch {
      setMarket({ source: 'none', note: 'Live market data is unavailable right now.', sources: [] });
    } finally {
      setLoadingMarket(false);
    }
  }

  function showResult() {
    setStep('result');
    loadMarket();
  }

  const baseEstimate = market?.estimate ?? null;
  const conditionAdjusted = baseEstimate ? Math.round(baseEstimate * conditions[condition][2] * (charger ? 1 : 0.9) * (box ? 1 : 0.95) / 5) * 5 : null;
  const low = conditionAdjusted ? Math.max(5, Math.round(conditionAdjusted * 0.9 / 5) * 5) : null;
  const high = conditionAdjusted ? Math.round(conditionAdjusted * 1.1 / 5) * 5 : null;
  const tradeIn = conditionAdjusted ? Math.round(conditionAdjusted * 0.78 / 5) * 5 : null;

  return (
    <main className="app-shell clean-check">
      <div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link><div className="simple-progress"><span className={step !== 'identify' ? 'done' : 'active'} /><span className={step === 'result' ? 'done' : step === 'condition' ? 'active' : ''} /><span className={step === 'result' ? 'active' : ''} /></div><Link href="/" className="exit">Exit</Link></div>

      {step === 'identify' && (
        <section className="simple-flow">
          <button className="back-link" onClick={() => window.history.back()}><ChevronLeft size={16} /> Back</button>
          <div className="simple-heading"><div className="eyebrow"><Sparkles size={13} /> 1 · Identify</div><h1>What are you selling?</h1><p>Take a photo. We’ll identify it and check what it could sell for in the UK.</p></div>
          <div className="simple-input-card">
            <button className="photo-button" onClick={() => inputRef.current?.click()} disabled={identifying}>
              {identifying ? <LoaderCircle className="spin" size={25} /> : <Camera size={25} />}
              <span><b>{identifying ? 'Identifying your item…' : 'Take or upload a photo'}</b><small>{identifying ? 'Qwen AI is analysing the image' : 'Works best with a clear photo of the item'}</small></span><Upload size={17} />
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => identifyImage(e.target.files?.[0])} />
            <div className="or-line"><span>or type it</span></div>
            <div className="text-input"><input autoFocus value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && item.trim() && setStep('condition')} placeholder="Nintendo Switch OLED white" /><button disabled={!item.trim()} onClick={() => setStep('condition')}><ArrowRight size={18} /></button></div>
          </div>
          {error && <p className="check-error">{error}</p>}
          <div className="small-trust"><span>UK market</span><span>Real listings</span><span>No account</span></div>
        </section>
      )}

      {step === 'condition' && (
        <section className="simple-flow">
          <button className="back-link" onClick={() => setStep('identify')}><ChevronLeft size={16} /> Back</button>
          <div className="simple-heading left"><div className="eyebrow">2 · Condition</div><h1>How is it?</h1><p>One quick detail makes the estimate more useful.</p></div>
          <div className="identified-item"><ImagePlus size={18} /><span>{item}</span><button onClick={() => setStep('identify')}>Change</button></div>
          <div className="condition-list">{conditions.map((entry, index) => <button key={entry[0]} className={condition === index ? 'selected' : ''} onClick={() => setCondition(index)}><span className="condition-radio">{condition === index && <Check size={12} />}</span><span><b>{entry[0]}</b><small>{entry[1]}</small></span></button>)}</div>
          <div className="extras-row"><button className={box ? 'on' : ''} onClick={() => setBox(!box)}>Box <span>{box ? 'Yes' : 'No'}</span></button><button className={charger ? 'on' : ''} onClick={() => setCharger(!charger)}>Charger <span>{charger ? 'Yes' : 'No'}</span></button></div>
          <button className="big-continue" onClick={showResult}>Get my estimate <ArrowRight size={18} /></button>
        </section>
      )}

      {step === 'result' && (
        <section className="simple-results">
          <div className="result-top"><button className="back-link" onClick={() => setStep('condition')}><ChevronLeft size={16} /> Change details</button><Link href="/check" className="new-check">New check</Link></div>
          <div className="result-heading"><span className="eyebrow">Your estimate</span><h1>{item}</h1><p>{loadingMarket ? 'Checking current UK marketplace listings…' : market?.liveSourceCount ? `Compared with ${market.liveSourceCount} live marketplace${market.liveSourceCount === 1 ? '' : 's'}.` : 'No live marketplace data is connected yet.'}</p></div>
          <div className="main-value"><div><small>TYPICAL RESALE VALUE</small><strong>{conditionAdjusted ? `£${conditionAdjusted}` : '—'}</strong><span>{low && high ? `Likely range £${low}–£${high}` : 'Waiting for live market data'}</span></div>{loadingMarket && <LoaderCircle className="spin" size={19} />}</div>
          {market?.liveSourceCount > 0 && <div className="compact-sources"><Check size={16} /><span>{market.liveSourceCount} live marketplace{market.liveSourceCount === 1 ? '' : 's'} checked</span>{market.sources.filter(s => s.status === 'live').map(s => <b key={s.name}>{s.name}</b>)}</div>}
          {market?.liveSourceCount > 0 && <div className="simple-breakdown"><div><span>Condition</span><b>{conditions[condition][0]}</b></div><div><span>Box</span><b>{box ? 'Included' : 'Missing'}</b></div><div><span>Charger</span><b>{charger ? 'Included' : 'Missing'}</b></div></div>}
          {conditionAdjusted && <div className="sell-choice"><div><small>WHAT NEXT?</small><h2>How do you want to sell?</h2></div><div className="route-options"><div><b>Sell yourself</b><strong>£{high}</strong><span>More return, more work</span><button>See options <ArrowRight size={15} /></button></div><div><b>Trade in</b><strong>£{tradeIn}</strong><span>Less hassle, indicative value</span><button>Compare trade-ins <ArrowRight size={15} /></button></div></div></div>}
          {market?.liveSourceCount === 0 && !loadingMarket && <div className="no-data">Live marketplace data isn’t connected yet, so WorthIt won’t make up a number. Add your marketplace data providers in Vercel to enable the estimate.</div>}
          <details className="how-calculated"><summary>How we calculate it</summary><p>WorthIt combines comparable UK marketplace asking prices, removes extreme listings, then adjusts the market estimate for condition and completeness. Asking prices are not the same as completed sale prices.</p></details>
          <footer>WorthIt · UK resale estimates · Indicative values, not guaranteed offers.</footer>
        </section>
      )}
    </main>
  );
}

export default function CheckPage() { return <Suspense fallback={<main className="app-shell clean-check"><div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link></div></main>}><CheckFlow /></Suspense>; }

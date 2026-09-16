'use client';

import Link from 'next/link';
import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, Check, ChevronLeft, ImagePlus, LoaderCircle, Sparkles, Upload } from 'lucide-react';

const conditions = [['New', 'Unused or sealed', 1.15], ['Like new', 'Barely used', 1.05], ['Good', 'Normal signs of use', 0.95], ['Fair', 'Visible wear', 0.75]];

const checkStyles = `
.clean-check{--cream:#f5f0e5;--forest:#17382d;--forest-soft:#e5ebe0;--line:#ddd8ca;--white:#fffdf8;--muted:#718078;min-height:100vh;background:var(--cream);color:var(--forest)}
.clean-check .app-top{max-width:1040px;margin:auto;padding:0 25px}.clean-check .logo{color:var(--forest)}.clean-check .logo span{color:#6d8975}.clean-check .simple-progress{display:flex;gap:5px;width:100px}.clean-check .simple-progress span{height:3px;background:#d8d2c4;border-radius:9px;flex:1}.clean-check .simple-progress .active,.clean-check .simple-progress .done{background:var(--forest)}
.clean-check .simple-flow{max-width:620px;margin:65px auto 100px;padding:0 25px}.clean-check .back-link{border:0;background:none;padding:0;color:#7c867f;font-size:12px;display:flex;align-items:center;gap:3px;cursor:pointer}.clean-check .simple-heading{text-align:center;margin:34px 0 30px}.clean-check .simple-heading.left{text-align:left}.clean-check .eyebrow{background:var(--forest-soft);color:var(--forest);border-radius:999px;padding:8px 11px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px}.clean-check .simple-heading h1{font:600 clamp(40px,7vw,60px)/.98 'Space Grotesk';letter-spacing:-3.5px;margin:17px 0 12px}.clean-check .simple-heading p{color:var(--muted);font-size:14px;line-height:1.55;max-width:520px;margin:auto}.clean-check .simple-heading.left p{margin:0}
.clean-check .simple-input-card{background:var(--white);border:1px solid var(--line);border-radius:22px;padding:10px;box-shadow:0 20px 50px #17382d0b}.clean-check .photo-button{width:100%;border:0;background:var(--forest);color:#fff;border-radius:16px;padding:25px 20px;display:flex;align-items:center;gap:15px;text-align:left;cursor:pointer}.clean-check .photo-button span{display:grid;gap:4px;flex:1}.clean-check .photo-button b{font-size:15px}.clean-check .photo-button small{font-size:11px;color:#bdc9bf}.clean-check .photo-button>svg:last-child{opacity:.65}.clean-check .or-line{display:flex;align-items:center;gap:10px;color:#9a9e96;font-size:10px;padding:12px 4px}.clean-check .or-line:before,.clean-check .or-line:after{content:'';height:1px;background:var(--line);flex:1}.clean-check .text-input{display:flex;align-items:center;border:1px solid var(--line);border-radius:13px;background:#fff;padding:5px 6px 5px 14px}.clean-check .text-input input{border:0;outline:0;min-width:0;flex:1;background:transparent;color:var(--forest);font-size:13px}.clean-check .text-input button{width:40px;height:40px;border:0;border-radius:10px;background:var(--forest);color:#fff;display:grid;place-items:center;cursor:pointer}.clean-check .text-input button:disabled{opacity:.25}.clean-check .small-trust{display:flex;justify-content:center;gap:20px;color:#858e87;font-size:10px;margin-top:17px}.clean-check .check-error{color:#8c493e;background:#f3e2dc;border-radius:10px;padding:10px 12px;font-size:11px;text-align:center}.clean-check .spin{animation:worthitspin 1s linear infinite}@keyframes worthitspin{to{transform:rotate(360deg)}}
.clean-check .identified-item{display:flex;align-items:center;gap:10px;background:var(--white);border:1px solid var(--line);border-radius:13px;padding:12px 14px;margin-bottom:18px;font-size:13px}.clean-check .identified-item svg{color:#6c8574}.clean-check .identified-item span{flex:1;font-weight:600}.clean-check .identified-item button{border:0;background:transparent;color:#718078;font-size:11px;cursor:pointer}.clean-check .condition-list{display:grid;gap:8px}.clean-check .condition-list button{border:1px solid var(--line);background:var(--white);border-radius:13px;padding:15px;display:flex;align-items:center;gap:11px;text-align:left;cursor:pointer}.clean-check .condition-list button.selected{border-color:var(--forest);box-shadow:0 0 0 2px #dce5d9}.clean-check .condition-radio{width:20px;height:20px;border:1px solid #c6c5ba;border-radius:50%;display:grid;place-items:center;flex:none}.clean-check .selected .condition-radio{background:var(--forest);border-color:var(--forest);color:#fff}.clean-check .condition-list b,.clean-check .condition-list small{display:block}.clean-check .condition-list b{font-size:13px}.clean-check .condition-list small{font-size:10px;color:#87908a;margin-top:3px}.clean-check .extras-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.clean-check .extras-row button{border:1px solid var(--line);background:transparent;border-radius:12px;padding:12px;text-align:left;color:var(--forest);font-size:12px;cursor:pointer}.clean-check .extras-row button span{float:right;color:#87908a}.clean-check .extras-row button.on{background:#e8eee3;border-color:#cfd9ca}.clean-check .big-continue{width:100%;border:0;background:var(--forest);color:#fff;border-radius:13px;padding:15px;margin-top:18px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;cursor:pointer}
.clean-check .simple-results{max-width:760px;margin:28px auto 80px;padding:0 25px}.clean-check .result-top{display:flex;justify-content:space-between;align-items:center}.clean-check .new-check{border:1px solid var(--line);background:var(--white);border-radius:999px;padding:8px 12px;font-size:11px}.clean-check .result-heading{margin:62px 0 28px}.clean-check .result-heading h1{font:600 clamp(35px,6vw,52px)/1 'Space Grotesk';letter-spacing:-3px;margin:15px 0 10px}.clean-check .result-heading p{color:var(--muted);font-size:13px;margin:0}.clean-check .main-value{background:var(--forest);color:#fff;border-radius:22px;padding:30px;display:flex;align-items:center;justify-content:space-between}.clean-check .main-value small{display:block;color:#b8c8bc;font-size:9px;letter-spacing:1.5px;font-weight:700}.clean-check .main-value strong{display:block;font:600 72px/1 'Space Grotesk';letter-spacing:-4px;margin:7px 0}.clean-check .main-value span{color:#c4d0c7;font-size:12px}.clean-check .compact-sources{display:flex;align-items:center;gap:9px;margin-top:10px;padding:12px 14px;background:#e7ece1;border-radius:12px;color:var(--forest);font-size:11px}.clean-check .compact-sources span{margin-right:auto}.clean-check .compact-sources b{font-size:10px;background:#f7f3e9;padding:6px 8px;border-radius:7px}.clean-check .simple-breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.clean-check .simple-breakdown div{background:var(--white);border:1px solid var(--line);border-radius:12px;padding:13px}.clean-check .simple-breakdown span,.clean-check .simple-breakdown b{display:block}.clean-check .simple-breakdown span{font-size:9px;color:#89918b;text-transform:uppercase;letter-spacing:.8px}.clean-check .simple-breakdown b{font-size:12px;margin-top:5px}.clean-check .sell-choice{margin-top:22px}.clean-check .sell-choice>div:first-child{margin-bottom:10px}.clean-check .sell-choice small{font-size:9px;color:#87918a;letter-spacing:1.4px;font-weight:700}.clean-check .sell-choice h2{font:600 25px 'Space Grotesk';letter-spacing:-1px;margin:5px 0}.clean-check .route-options{display:grid;grid-template-columns:1fr 1fr;gap:9px}.clean-check .route-options>div{background:var(--white);border:1px solid var(--line);border-radius:15px;padding:18px}.clean-check .route-options b,.clean-check .route-options strong,.clean-check .route-options span{display:block}.clean-check .route-options b{font-size:12px}.clean-check .route-options strong{font:600 30px 'Space Grotesk';margin:6px 0}.clean-check .route-options span{font-size:10px;color:#849089;margin-bottom:13px}.clean-check .route-options button{border:0;background:#e5ebe0;color:var(--forest);border-radius:9px;padding:9px 10px;font-size:10px;font-weight:700;display:flex;align-items:center;gap:5px;cursor:pointer}.clean-check .no-data{margin-top:12px;padding:14px;background:#eee8dc;border-radius:12px;color:#68736b;font-size:11px;line-height:1.5}.clean-check .how-calculated{margin-top:12px;border-top:1px solid var(--line);padding:14px 0;color:#647069}.clean-check .how-calculated summary{cursor:pointer;font-size:11px;font-weight:700}.clean-check .how-calculated p{font-size:11px;line-height:1.6;max-width:650px}.clean-check footer{text-align:center;color:#929a94;font-size:10px;margin-top:45px}
@media(max-width:650px){.clean-check .app-top{padding:0 16px}.clean-check .simple-flow,.clean-check .simple-results{padding:0 16px}.clean-check .simple-flow{margin-top:45px}.clean-check .simple-heading h1{letter-spacing:-2.5px}.clean-check .main-value{padding:24px}.clean-check .main-value strong{font-size:58px}.clean-check .simple-breakdown,.clean-check .route-options{grid-template-columns:1fr}.clean-check .compact-sources{flex-wrap:wrap}.clean-check .compact-sources span{flex-basis:100%;margin:0 0 3px}}
`;

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
    setError(''); setIdentifying(true);
    try {
      const form = new FormData(); form.append('image', file);
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
    } catch (e) { setError(e.message || 'Could not identify the item.'); } finally { setIdentifying(false); }
  }

  async function loadMarket() {
    setLoadingMarket(true); setError('');
    try { const response = await fetch(`/api/market?q=${encodeURIComponent(item)}`); setMarket(await response.json()); }
    catch { setMarket({ source: 'none', note: 'Live market data is unavailable right now.', sources: [] }); }
    finally { setLoadingMarket(false); }
  }

  function showResult() { setStep('result'); loadMarket(); }
  const baseEstimate = market?.estimate ?? null;
  const conditionAdjusted = baseEstimate ? Math.round(baseEstimate * conditions[condition][2] * (charger ? 1 : 0.9) * (box ? 1 : 0.95) / 5) * 5 : null;
  const low = conditionAdjusted ? Math.max(5, Math.round(conditionAdjusted * 0.9 / 5) * 5) : null;
  const high = conditionAdjusted ? Math.round(conditionAdjusted * 1.1 / 5) * 5 : null;
  const tradeIn = conditionAdjusted ? Math.round(conditionAdjusted * 0.78 / 5) * 5 : null;

  return <main className="app-shell clean-check">
    <style>{checkStyles}</style>
    <div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link><div className="simple-progress"><span className={step !== 'identify' ? 'done' : 'active'} /><span className={step === 'result' ? 'done' : step === 'condition' ? 'active' : ''} /><span className={step === 'result' ? 'active' : ''} /></div><Link href="/" className="exit">Exit</Link></div>

    {step === 'identify' && <section className="simple-flow">
      <button className="back-link" onClick={() => window.history.back()}><ChevronLeft size={16} /> Back</button>
      <div className="simple-heading"><div className="eyebrow"><Sparkles size={13} /> 1 · Identify</div><h1>What are you selling?</h1><p>Take a photo. We’ll identify it and check what it could sell for in the UK.</p></div>
      <div className="simple-input-card"><button className="photo-button" onClick={() => inputRef.current?.click()} disabled={identifying}>{identifying ? <LoaderCircle className="spin" size={25} /> : <Camera size={25} />}<span><b>{identifying ? 'Identifying your item…' : 'Take or upload a photo'}</b><small>{identifying ? 'Qwen AI is analysing the image' : 'Works best with a clear photo of the item'}</small></span><Upload size={17} /></button><input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => identifyImage(e.target.files?.[0])} /><div className="or-line"><span>or type it</span></div><div className="text-input"><input autoFocus value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && item.trim() && setStep('condition')} placeholder="Nintendo Switch OLED white" /><button disabled={!item.trim()} onClick={() => setStep('condition')}><ArrowRight size={18} /></button></div></div>
      {error && <p className="check-error">{error}</p>}<div className="small-trust"><span>UK market</span><span>Real listings</span><span>No account</span></div>
    </section>}

    {step === 'condition' && <section className="simple-flow">
      <button className="back-link" onClick={() => setStep('identify')}><ChevronLeft size={16} /> Back</button><div className="simple-heading left"><div className="eyebrow">2 · Condition</div><h1>How is it?</h1><p>One quick detail makes the estimate more useful.</p></div>
      <div className="identified-item"><ImagePlus size={18} /><span>{item}</span><button onClick={() => setStep('identify')}>Change</button></div>
      <div className="condition-list">{conditions.map((entry, index) => <button key={entry[0]} className={condition === index ? 'selected' : ''} onClick={() => setCondition(index)}><span className="condition-radio">{condition === index && <Check size={12} />}</span><span><b>{entry[0]}</b><small>{entry[1]}</small></span></button>)}</div>
      <div className="extras-row"><button className={box ? 'on' : ''} onClick={() => setBox(!box)}>Box <span>{box ? 'Yes' : 'No'}</span></button><button className={charger ? 'on' : ''} onClick={() => setCharger(!charger)}>Charger <span>{charger ? 'Yes' : 'No'}</span></button></div><button className="big-continue" onClick={showResult}>Get my estimate <ArrowRight size={18} /></button>
    </section>}

    {step === 'result' && <section className="simple-results">
      <div className="result-top"><button className="back-link" onClick={() => setStep('condition')}><ChevronLeft size={16} /> Change details</button><Link href="/check" className="new-check">New check</Link></div>
      <div className="result-heading"><span className="eyebrow">Your estimate</span><h1>{item}</h1><p>{loadingMarket ? 'Checking current UK marketplace listings…' : market?.liveSourceCount ? `Compared with ${market.liveSourceCount} live marketplace${market.liveSourceCount === 1 ? '' : 's'}.` : 'No live marketplace data is connected yet.'}</p></div>
      <div className="main-value"><div><small>TYPICAL RESALE VALUE</small><strong>{conditionAdjusted ? `£${conditionAdjusted}` : '—'}</strong><span>{low && high ? `Likely range £${low}–£${high}` : 'Waiting for live market data'}</span></div>{loadingMarket && <LoaderCircle className="spin" size={19} />}</div>
      {market?.liveSourceCount > 0 && <div className="compact-sources"><Check size={16} /><span>{market.liveSourceCount} live marketplace{market.liveSourceCount === 1 ? '' : 's'} checked</span>{market.sources.filter(s => s.status === 'live').map(s => <b key={s.name}>{s.name}</b>)}</div>}
      {market?.liveSourceCount > 0 && <div className="simple-breakdown"><div><span>Condition</span><b>{conditions[condition][0]}</b></div><div><span>Box</span><b>{box ? 'Included' : 'Missing'}</b></div><div><span>Charger</span><b>{charger ? 'Included' : 'Missing'}</b></div></div>}
      {conditionAdjusted && <div className="sell-choice"><div><small>WHAT NEXT?</small><h2>How do you want to sell?</h2></div><div className="route-options"><div><b>Sell yourself</b><strong>£{high}</strong><span>More return, more work</span><button>See options <ArrowRight size={15} /></button></div><div><b>Trade in</b><strong>£{tradeIn}</strong><span>Less hassle, indicative value</span><button>Compare trade-ins <ArrowRight size={15} /></button></div></div></div>}
      {market?.liveSourceCount === 0 && !loadingMarket && <div className="no-data">Live marketplace data isn’t connected yet, so WorthIt won’t make up a number. Add your marketplace data providers in Vercel to enable the estimate.</div>}
      <details className="how-calculated"><summary>How we calculate it</summary><p>WorthIt combines comparable UK marketplace asking prices, removes extreme listings, then adjusts the market estimate for condition and completeness. Asking prices are not the same as completed sale prices.</p></details><footer>WorthIt · UK resale estimates · Indicative values, not guaranteed offers.</footer>
    </section>}
  </main>;
}

export default function CheckPage(){return <Suspense fallback={<main className="app-shell clean-check"><div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link></div></main>}><CheckFlow/></Suspense>;}

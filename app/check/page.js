'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, Check, ChevronLeft, Database, Package, Sparkles, Tag, Upload, Zap } from 'lucide-react';

const conditions = [
  ['New', 'Unused or sealed', 1.15],
  ['Like new', 'Barely used', 1.05],
  ['Good', 'Normal signs of use', 0.95],
  ['Fair', 'Visible wear', 0.75],
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

  useEffect(() => {
    const value = params.get('item');
    if (value) setItem(value);
  }, [params]);

  async function loadMarket() {
    setLoadingMarket(true);
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
            <p>Tell us the item. We’ll compare real marketplace prices before giving you a number.</p>
          </div>
          <div className="simple-input-card">
            <div className="photo-button"><Camera size={22} /><div><b>Add a photo</b><span>Photo identification coming next</span></div><Upload size={17} /></div>
            <div className="or-line"><span>or</span></div>
            <div className="text-input"><Tag size={18} /><input autoFocus value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && item.trim() && setStep('condition')} placeholder="e.g. Nintendo Switch OLED white" /><button disabled={!item.trim()} onClick={() => setStep('condition')}><ArrowRight size={18} /></button></div>
          </div>
          <div className="small-trust"><span>UK market</span><span>Multiple platforms</span><span>No account</span></div>
        </section>
      )}

      {step === 'condition' && (
        <section className="simple-flow">
          <button className="back-link" onClick={() => setStep('identify')}><ChevronLeft size={16} /> Back</button>
          <div className="simple-heading left">
            <div className="eyebrow">2 · Condition</div>
            <h1>How is it?</h1>
            <p>Condition changes what buyers will actually pay.</p>
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
          <div className="result-heading"><span className="eyebrow"><Database size={13} /> Multi-market check</span><h1>{item}</h1><p>{loadingMarket ? 'Checking eBay, Vinted and Facebook Marketplace…' : market?.liveSourceCount ? `Compared with live prices from ${market.liveSourceCount} marketplace${market.liveSourceCount === 1 ? '' : 's'}.` : 'No live marketplace connection is available yet.'}</p></div>

          <div className="main-value">
            <div><small>ESTIMATED RESALE</small><strong>{conditionAdjusted ? `£${conditionAdjusted}` : '—'}</strong><span>{low && high ? `Likely range £${low}–£${high}` : 'Waiting for live market data'}</span></div>
            <div className="data-status">{loadingMarket ? 'Loading…' : market?.liveSourceCount ? <><Check size={15} /> Multi-market data</> : 'No live data'}</div>
          </div>

          <div className="market-source">
            <div><b>Real market sources</b><p>{market?.note || 'WorthIt only shows a price when it has connected marketplace data.'}</p></div>
            <span>{market?.liveSourceCount ? `${market.liveSourceCount}/3 LIVE` : '0/3 LIVE'}</span>
          </div>

          <div className="market-sources-grid">
            {(market?.sources || [
              { name: 'eBay', status: 'unavailable', note: 'Not connected yet.' },
              { name: 'Vinted', status: 'unavailable', note: 'Provider connection needed.' },
              { name: 'Facebook Marketplace', status: 'unavailable', note: 'Provider connection needed.' },
            ]).map(source => (
              <div className="market-source-card" key={source.name}>
                <div><b>{source.name}</b><span className={source.status === 'live' ? 'live-dot' : ''}>{source.status === 'live' ? 'LIVE' : 'NOT CONNECTED'}</span></div>
                {source.status === 'live' ? <><strong>£{source.median}</strong><small>{source.count} listings · £{source.low}–£{source.high}</small></> : <small>{source.note}</small>}
              </div>
            ))}
          </div>

          <div className="simple-breakdown">
            <div><span>Condition</span><b>{conditions[condition][0]}</b></div>
            <div><span>Original box</span><b>{box ? 'Included' : 'Missing'}</b></div>
            <div><span>Charger</span><b>{charger ? 'Included' : 'Missing'}</b></div>
          </div>

          {conditionAdjusted && <div className="sell-choice">
            <div><small>WHAT NEXT?</small><h2>Choose your route</h2></div>
            <div className="route-options">
              <div><b>Sell yourself</b><strong>£{high}</strong><span>More return, more work</span><button>See selling options <ArrowRight size={16} /></button></div>
              <div><b>Trade in</b><strong>£{tradeIn}</strong><span>Less hassle, indicative value</span><button>Compare trade-in <ArrowRight size={16} /></button></div>
            </div>
          </div>}

          <div className="data-note"><Database size={16} /><span>WorthIt never fills missing platforms with guessed prices. eBay has an official Browse API for current listings. Vinted's official integration is restricted to allowlisted Pro businesses, and Meta does not provide a general public Marketplace listings API, so those sources need an approved or compliant third-party data connection.</span></div>
          <footer>WorthIt · UK resale estimates · Indicative values, not guaranteed offers.</footer>
        </section>
      )}
    </main>
  );
}

export default function CheckPage() {
  return <Suspense fallback={<main className="app-shell clean-check"><div className="app-top"><Link href="/" className="logo">Worth<span>It</span></Link></div></main>}><CheckFlow /></Suspense>;
}

'use client'

import { useMemo, useState } from 'react'

const ITEMS = {
  'iPhone 15': { base: 410, range: [365, 455], storage: { '128GB': 0, '256GB': 45, '512GB': 105 }, battery: { '90%+': 0, '80–89%': -28, 'Below 80%': -65 } },
  'iPhone 13': { base: 285, range: [245, 325], storage: { '128GB': 0, '256GB': 35, '512GB': 70 }, battery: { '90%+': 0, '80–89%': -20, 'Below 80%': -50 } },
  'PlayStation 5': { base: 365, range: [315, 405], storage: { 'Disc edition': 0, 'Digital edition': -55 }, battery: {}, },
  'MacBook Air M2': { base: 650, range: [570, 740], storage: { '256GB': 0, '512GB': 85 }, battery: {}, },
  'AirPods Pro 2': { base: 135, range: [105, 160], storage: { 'USB-C case': 0, 'Lightning case': -12 }, battery: {}, },
}

const CONDITIONS = { 'Like new': 1.08, 'Good': 1, 'Fair': .84, 'Heavily used': .68 }

export default function Home() {
  const [item, setItem] = useState('iPhone 15')
  const [condition, setCondition] = useState('Good')
  const [variant, setVariant] = useState('128GB')
  const [battery, setBattery] = useState('90%+')
  const [purchase, setPurchase] = useState('')
  const [copied, setCopied] = useState(false)

  const data = ITEMS[item]
  const value = useMemo(() => {
    const modifier = (data.storage?.[variant] || 0) + (data.battery?.[battery] || 0)
    return Math.max(35, Math.round((data.base + modifier) * CONDITIONS[condition]))
  }, [data, variant, battery, condition])

  const low = Math.round(value * .91)
  const high = Math.round(value * 1.08)
  const fee = Math.round(value * .13)
  const profit = purchase ? value - fee - Number(purchase) : null
  const trend = item === 'PlayStation 5' ? '-3.2%' : item === 'AirPods Pro 2' ? '+1.8%' : '+4.6%'

  function changeItem(next) {
    setItem(next)
    const first = Object.keys(ITEMS[next].storage || {})[0]
    if (first) setVariant(first)
    if (!ITEMS[next].battery) setBattery('90%+')
  }

  return <main>
    <nav className="nav"><div className="brand">worth<span>it</span></div><div className="nav-note">UK resale intelligence</div></nav>

    <section className="hero">
      <div className="eyebrow">THE SECOND-HAND MARKET, SIMPLIFIED</div>
      <h1>What could your tech <em>sell for?</em></h1>
      <p className="lede">Get a realistic UK resale estimate, see how the market is moving, and find a price worth listing at.</p>
      <div className="searchbox"><span>⌕</span><select value={item} onChange={e => changeItem(e.target.value)}>{Object.keys(ITEMS).map(x => <option key={x}>{x}</option>)}</select><span className="search-hint">Try iPhone 15, PS5, MacBook…</span></div>
      <div className="chips">{Object.keys(ITEMS).slice(0,4).map(x => <button key={x} onClick={() => changeItem(x)}>{x}</button>)}</div>
    </section>

    <section className="workspace">
      <div className="config card">
        <div className="section-label">01 / CONFIGURE</div>
        <h2>Tell us about it</h2>
        <p className="muted">Only details that meaningfully affect resale value.</p>
        <label>Condition</label><div className="seg">{Object.keys(CONDITIONS).map(x => <button className={condition === x ? 'active' : ''} onClick={() => setCondition(x)} key={x}>{x}</button>)}</div>
        {Object.keys(data.storage || {}).length > 0 && <><label>Model / storage</label><select className="field" value={variant} onChange={e => setVariant(e.target.value)}>{Object.keys(data.storage).map(x => <option key={x}>{x}</option>)}</select></>}
        {Object.keys(data.battery || {}).length > 0 && <><label>Battery health</label><select className="field" value={battery} onChange={e => setBattery(e.target.value)}>{Object.keys(data.battery).map(x => <option key={x}>{x}</option>)}</select></>}
      </div>

      <div className="result card">
        <div className="result-top"><div><div className="section-label">02 / ESTIMATED RESALE VALUE</div><div className="price">£{value}</div><div className="range">Typical range <strong>£{low}–£{high}</strong></div></div><div className="confidence"><span>●</span> High confidence</div></div>
        <div className="market-line"><span>30-day market trend</span><strong>{trend}</strong></div>
        <div className="chart"><div className="gridline g1"/><div className="gridline g2"/><svg viewBox="0 0 700 180" preserveAspectRatio="none"><polyline points="0,138 55,130 105,143 160,112 215,120 270,98 330,106 385,79 440,87 495,61 550,72 610,42 700,52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="chart-labels"><span>30 days ago</span><span>Today</span></div></div>
        <div className="signals"><div><span>Demand</span><b>Strong</b></div><div><span>Supply</span><b>Moderate</b></div><div><span>Volatility</span><b>Low</b></div></div>
      </div>
    </section>

    <section className="compare card">
      <div className="section-label">03 / WHERE TO SELL</div><h2>Price it for the market, not a guess.</h2>
      <div className="market-grid"><div><span>eBay</span><strong>£{Math.round(value * 1.03)}</strong><small>Highest reach · fees apply</small></div><div><span>Vinted</span><strong>£{Math.round(value * .98)}</strong><small>Low seller fees · fast-moving</small></div><div><span>Facebook Marketplace</span><strong>£{Math.round(value * .94)}</strong><small>Local sale · no platform fee</small></div><div><span>Trade-in</span><strong>£{Math.round(value * .72)}</strong><small>Fastest · less money</small></div></div>
    </section>

    <section className="tools">
      <div className="card calculator"><div className="section-label">04 / PROFIT CHECK</div><h2>What would you actually make?</h2><p className="muted">Enter what you paid. We’ll estimate the result after a typical marketplace fee.</p><input className="field" inputMode="decimal" placeholder="Purchase price £" value={purchase} onChange={e => setPurchase(e.target.value.replace(/[^0-9.]/g,''))}/>{profit !== null && <div className="profit"><span>Estimated profit</span><strong>£{profit}</strong><small>{Math.round((profit / Number(purchase)) * 100)}% ROI · based on eBay-style fees</small></div>}</div>
      <div className="card listing"><div className="section-label">05 / READY TO LIST</div><h2>Recommended ask: £{Math.round(value * 1.05)}</h2><p>List slightly above the fair market price so you have room to negotiate.</p><div className="listing-box"><b>{item} — {condition}</b><span>Great condition and ready for its next owner. Message for any questions.</span></div><button className="copy" onClick={() => {navigator.clipboard?.writeText(`${item} — ${condition}\nGreat condition and ready for its next owner. Asking £${Math.round(value * 1.05)}.`);setCopied(true);setTimeout(()=>setCopied(false),1500)}}>{copied ? 'Copied ✓' : 'Copy listing'}</button></div>
    </section>

    <footer><span>worth<span>it</span></span><small>Market estimates are illustrative in this MVP. Live comparable-sale data will replace seeded data as the data layer is connected.</small></footer>
  </main>
}

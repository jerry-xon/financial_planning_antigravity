import re

file_path = r'c:\financial_planning_antigravity\src\components\ReportModule\ReportView.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """            {/* New Premium Dashboard Header Area (Module 12) */}
            <div className="welcome-hero" style={{ marginBottom: '2rem' }}>
                <div className="hero-top">
                    <h1 className="hero-greeting">Welcome Back, {familyMembers[0]?.name?.split(' ')[0] || 'Client'}!</h1>
                    <p className="hero-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</p>
                </div>
                
                <div className="top-kpis">
                    <div className="kpi-pill">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.8}}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        <div className="kpi-pill-col">
                            <span className="kpi-label">Total Net Worth</span>
                            <span className="kpi-val">{formatCurrency(assetResults.netWorth)}</span>
                        </div>
                    </div>
                    <div className="kpi-pill">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.8}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        <div className="kpi-pill-col">
                            <span className="kpi-label">Monthly Surplus</span>
                            <span className="kpi-val">{formatCurrency(cashFlowResults.surplus)}</span>
                        </div>
                    </div>
                    <div className="kpi-pill">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.8}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                        <div className="kpi-pill-col">
                            <span className="kpi-label">Emergency Fund</span>
                            <span className="kpi-val">{formatCurrency(contingencyFund || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                    Overview Mode
                </button>
                <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <Printer size={18} style={{ marginRight: '8px' }} /> Export Report
                </button>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                <div className="card hoverable">
                    <div className="stat-icon" style={{background: '#e0f2fe', color: 'var(--color-2)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    </div>
                    <div className="stat-val">{formatCurrency(cashFlowResults.totalIncome)}</div>
                    <div className="stat-label">Total Monthly Income</div>
                </div>
                <div className="card hoverable">
                    <div className="stat-icon" style={{background: '#fee2e2', color: 'var(--destructive)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    </div>
                    <div className="stat-val" style={{color: 'var(--destructive)'}}>{formatCurrency(cashFlowResults.totalExpenses)}</div>
                    <div className="stat-label">Total Outflows</div>
                </div>
                <div className="card hoverable">
                    <div className="stat-icon" style={{background: '#fef3c7', color: 'var(--warning)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M15 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>
                    </div>
                    <div className="stat-val">{validGoals.length}</div>
                    <div className="stat-label">Active Goals</div>
                </div>
                <div className="card hoverable">
                    <div className="stat-icon" style={{background: '#ede9fe', color: 'var(--color-3)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="stat-val">{policies.some(p => p.type?.toLowerCase().includes('term')) ? 'Yes' : 'No'}</div>
                    <div className="stat-label">Term Life Cover Valid</div>
                </div>
            </div>

            {/* Financial Summary & Goals Row */}
            <div className="grid-2" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 className="section-header" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Income vs Expense</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Distribution of your monthly cash inflows.</p>
                        
                        {cashFlowResults.totalIncome > 0 ? (
                            <div className="h-stacked-bar-wrapper">
                                <div className="h-bar-labels">
                                    <span style={{ color: 'var(--success)' }}><span className="leg-dot" style={{ background: 'var(--success)' }}></span>Surplus ({Math.max(0, Math.round((cashFlowResults.surplus / cashFlowResults.totalIncome) * 100))}%)</span>
                                </div>
                                <div className="h-bar-track">
                                    <div className="h-bar-seg" style={{ width: `${Math.max(0, (cashFlowResults.surplus / cashFlowResults.totalIncome) * 100)}%`, background: 'var(--success)' }}></div>
                                    <div className="h-bar-seg" style={{ width: `${(cashFlowResults.emiRatio || 0)}%`, background: 'var(--warning)' }}></div>
                                    <div className="h-bar-seg" style={{ width: `${(cashFlowResults.householdRatio || 0)}%`, background: 'var(--destructive)' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    <span><span className="leg-dot" style={{ background: 'var(--warning)' }}></span> EMI ({Math.round(cashFlowResults.emiRatio || 0)}%)</span>
                                    <span><span className="leg-dot" style={{ background: 'var(--destructive)' }}></span> Household ({Math.round(cashFlowResults.householdRatio || 0)}%)</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted" style={{fontSize: '0.85rem'}}>No income data available to display distribution.</p>
                        )}
                    </div>

                    <div className="grid-2" style={{ gap: '1.5rem', flex: 1 }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 className="section-header" style={{ fontSize: '1.05rem', marginBottom: '0' }}>Net Worth Growth</h3>
                            <div className="stat-val" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{formatCurrency(assetResults.netWorth)}</div>
                            <div className="sparkline-wrapper">
                                <div className="spark-gradient"></div>
                                <div className="spark-point"></div>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 className="section-header" style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>Asset Allocation</h3>
                            {assetResults.totalAssets > 0 ? (() => {
                                const equityTotal = (parseFloat(assetCategories.investments?.equity||0) + parseFloat(assetCategories.investments?.mutualFunds||0));
                                const debtTotal = (parseFloat(assetCategories.investments?.fixedDeposit||0) + parseFloat(assetCategories.cash?.savings||0) + parseFloat(assetCategories.retirement?.epf||0) + parseFloat(assetCategories.retirement?.ppf||0));
                                const realEstateTotal = parseFloat(assetCategories.realEstate?.residential||0) + parseFloat(assetCategories.realEstate?.secondProperty||0) + parseFloat(assetCategories.realEstate?.landPlot||0);
                                const otherTotal = assetResults.totalAssets - equityTotal - debtTotal - realEstateTotal;
                                
                                const equityPct = Math.round((equityTotal / assetResults.totalAssets) * 100);
                                const debtPct = Math.round((debtTotal / assetResults.totalAssets) * 100);
                                const rePct = Math.round((realEstateTotal / assetResults.totalAssets) * 100);
                                
                                return (
                                    <>
                                        <div className="donut-mini" style={{background: `conic-gradient(var(--color-2) 0% ${equityPct}%, var(--warning) ${equityPct}% ${equityPct + debtPct}%, var(--color-3) ${equityPct + debtPct}% 100%)`}}>
                                            <div className="donut-hole"><span style={{fontSize:'1.1rem', fontWeight:800, color:'var(--text-main)'}}>{equityPct}%</span><span style={{fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase'}}>Equity</span></div>
                                        </div>
                                        <div className="legend-mini">
                                            <div className="leg-row">
                                                <span className="text-muted"><span className="leg-dot" style={{ background: 'var(--color-2)' }}></span> Equity</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{equityPct}%</span>
                                            </div>
                                            <div className="leg-row">
                                                <span className="text-muted"><span className="leg-dot" style={{ background: 'var(--warning)' }}></span> Debt</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{debtPct}%</span>
                                            </div>
                                            {(rePct > 0 || otherTotal > 0) && (
                                                <div className="leg-row">
                                                    <span className="text-muted"><span className="leg-dot" style={{ background: 'var(--color-3)' }}></span> Others</span>
                                                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{100 - equityPct - debtPct}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })() : <p className="text-muted" style={{fontSize: '0.85rem'}}>No asset data.</p>}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ height: 'max-content' }}>
                    <div className="section-header" style={{ marginBottom: '1.5rem' }}>Goals Progress Tracker</div>
                    <div className="tabs">
                        <div className="tab active">Active Goals</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {validGoals.slice(0, 4).map((g, i) => {
                            const mappingDict = goalMappings[g.id] || {};
                            const totalAssigned = Object.values(mappingDict).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                            const percent = Math.min(100, Math.round((totalAssigned / (g.futureCost || 1)) * 100));
                            return (
                                <div key={i} className="goal-flex">
                                    <div className="circ-prog" style={{ background: `conic-gradient(var(--success) 0% ${percent}%, var(--border) ${percent}% 100%)` }}>
                                        <div className="circ-hole">{percent}%</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{g.name}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Year: {g.targetYear}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(totalAssigned)} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Assigned</span></span>
                                            <span style={{ fontWeight: 600, color: 'var(--color-1)' }}>{formatCurrency(g.futureCost)} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Target</span></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {validGoals.length === 0 && <p className="text-muted">No active goals to track.</p>}
                    </div>
                </div>
            </div>

            <div className="report-sections">
                {/* 1. Family Profile Grid */}
                <section className="report-section">
                    <h2 className="section-header" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>1. Family Overview</h2>
                    <div className="grid-3" style={{ marginBottom: '3rem' }}>
                        {profileResults.map((m, i) => {
                            const initials = m.name?.split(' ').map(n=>n[0]).join('').substring(0,2) || 'FM';
                            const isSelf = m.relation?.toLowerCase() === 'self';
                            const isChild = m.relation?.toLowerCase() === 'child';
                            
                            const avatarColor = isSelf ? 'var(--color-1)' : (isChild ? 'var(--warning)' : 'var(--color-3)');
                            const roleBg = isSelf ? 'rgba(0,169,242,0.1)' : (isChild ? 'rgba(245, 158, 11,0.1)' : 'rgba(120, 124, 254,0.1)');
                            const roleColor = isSelf ? 'var(--color-2)' : (isChild ? 'var(--warning)' : 'var(--color-3)');
                            
                            const maxAgeText = isChild ? "P.G.: 22" : `Retires: ${m.retirementYear || 60}`;
                            const pct = isChild ? Math.min(100, (m.age / 22) * 100) : Math.min(100, (m.age / (m.retirementYear || 60)) * 100);
                            
                            return (
                                <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="family-avatar" style={{ background: avatarColor }}>{initials.toUpperCase()}</div>
                                    <div className="fam-name">{m.name}</div>
                                    <div className="fam-role" style={{ background: roleBg, color: roleColor }}>{m.relation} {isSelf ? '• Primary Earner' : ''}</div>
                                    
                                    <div className="age-bar-wrapper">
                                        <div className="age-lbl"><span>Age: {m.age}</span><span>{maxAgeText}</span></div>
                                        <div className="age-track">
                                            <div className="age-fill" style={{ width: `${pct}%`, background: avatarColor }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>"""

# Let's replace ONLY up to just before `{/* 2. Cash Flow Summary */}` inside ReportView.jsx
start_marker = "{/* New Premium Dashboard Header Area */}"
end_marker = "{/* 2. Cash Flow Summary */}"

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    new_content = content[:start_index] + replacement + "\n                " + content[end_index:]
    
    # We must add styles to the CSS string at the bottom.
    css_start = new_content.rfind("<style>{`")
    if css_start != -1:
        css_addition = """
        .welcome-hero { background: linear-gradient(135deg, var(--color-1) 0%, var(--color-2) 100%); border-radius: 20px; padding: 2.5rem; color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 2rem; }
        .welcome-hero::after { content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 100%; background: radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%); pointer-events: none; }
        .hero-top { position: relative; z-index: 2; }
        .hero-greeting { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.2; }
        .hero-date { font-size: 1rem; opacity: 0.9; }
        .top-kpis { display: flex; gap: 1.5rem; position: relative; z-index: 2; flex-wrap: wrap; }
        .kpi-pill { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); padding: 1rem 1.5rem; border-radius: 12px; flex: 1; min-width: 200px; display: flex; align-items: center; gap: 1rem; }
        .kpi-pill-col { display: flex; flex-direction: column; }
        .kpi-label { font-size: 0.85rem; opacity: 0.9; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-val { font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }
        .section-header { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-main); display: flex; align-items: center; justify-content: space-between; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: repeat(minmax(250px, 1fr)); gap: 1.5rem; }
        .grid-4 { display: grid; grid-template-columns: repeat(minmax(200px, 1fr)); gap: 1.5rem; }
        @media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } .grid-4 { grid-template-columns: repeat(4, 1fr); } }
        .card.hoverable:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .stat-val { font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem; }
        .stat-label { font-size: 0.95rem; color: var(--text-muted); font-weight: 500; margin-bottom: 1rem; }
        .h-stacked-bar-wrapper { margin-top: 1rem; }
        .h-bar-labels { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem; font-weight: 600; }
        .h-bar-track { height: 24px; background: var(--border); border-radius: 12px; display: flex; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
        .h-bar-seg { height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 700; }
        .sparkline-wrapper { height: 80px; background: url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMxNzJEOUQiIHN0cm9rZS13aWR0aD0iMyIgZD0iTTAsODAgUTUwLDQwIDEwMCw1MCBUMjAwLDYwIFQzMDAsMzAgVDQwMCwxMCIgLz48L3N2Zz4=') no-repeat; background-size: 100% 100%; margin-top: auto; position: relative; }
        .spark-gradient { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSJyZ2JhKDIzLDQ1LDE1NywwLjEpIiBkPSJNMiw4MCBROTAsNDAgMTAwLDUwIFQyMDAsNjAgVDMwMCwzMCBUNDAwLDEwIEw0MDAsMTAwIEwwLDEwMCBaIiAvPjwvc3ZnPg==') no-repeat; background-size: 100% 100%; }
        .spark-point { position: absolute; right: -4px; top: 6px; width: 12px; height: 12px; background: white; border: 3px solid var(--color-1); border-radius: 50%; box-shadow: 0 0 0 4px rgba(23,45,157,0.2); }
        .donut-mini { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: auto; }
        .donut-hole { width: 70%; height: 70%; background: var(--bg-card); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .legend-mini { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .leg-row { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 500; }
        .leg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .family-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--color-1); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; margin-bottom: 1rem; }
        .fam-name { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
        .fam-role { display: inline-block; padding: 4px 10px; background: rgba(0,169,242,0.1); color: var(--color-2); font-size: 0.75rem; border-radius: 12px; font-weight: 600; margin-top: 0.5rem; margin-bottom: 1.5rem; width: max-content; }
        .age-bar-wrapper { margin-top: auto; }
        .age-lbl { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
        .age-track { width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .age-fill { height: 100%; background: var(--color-3); }
        .tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .tab { padding: 0.5rem 1.25rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); transition: all 0.2s; }
        .tab.active { background: var(--color-1); color: white; border-color: var(--color-1); }
        .goal-flex { display: flex; align-items: center; gap: 1.5rem; width: 100%; }
        .circ-prog { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .circ-hole { width: 68px; height: 68px; background: var(--bg-card); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-main); font-size: 0.95rem; }
        """
        styles_end = new_content.find("`}</style>", css_start)
        if styles_end != -1:
            final_content = new_content[:styles_end] + css_addition + new_content[styles_end:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print("Successfully updated ReportView.jsx")
        else:
            print("Could not find style end")
            
else:
    print("Could not find start/end markers")

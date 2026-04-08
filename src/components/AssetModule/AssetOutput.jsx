import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { ChevronDown, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const COLORS = ['#787CFE', '#00A9F2', '#fcd34d', '#172D9D', '#48BED9', '#00E2E0'];

const AssetOutput = ({ results }) => {
    const debtToAssetRatio = (results.totalLiabilities / (results.totalAssets || 1)) * 100;
    const netRatio = Math.max(0, 100 - debtToAssetRatio);
    
    // Process Area Chart Data for Liabilities (Mock historical trace)
    const liabilityData = [
        { name: 'Jan', value: results.totalLiabilities * 0.9 },
        { name: 'Feb', value: results.totalLiabilities * 0.95 },
        { name: 'Mar', value: results.totalLiabilities * 1.05 },
        { name: 'Apr', value: results.totalLiabilities }
    ];

    return (
        <div className="asset-output fade-in" style={{ marginTop: '2rem' }}>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-1)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                Net Worth <span style={{ fontWeight: 400, color: 'var(--text-main)', marginLeft: '0.5rem' }}>Analysis</span>
            </h1>

            <div className="controls-row" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="select-pill">
                    Overall <ChevronDown size={14} />
                </div>
                <div className="select-pill">
                    Current Year <ChevronDown size={14} />
                </div>
            </div>

            {/* Top Hero Card */}
            <div className="hero-card">
                <div className="hero-content">
                    <div className="hero-title">Total Net Worth</div>
                    <div className="hero-amount">{formatCurrency(results.netWorth)}</div>
                    <div className="trend-badge">
                        <ArrowUpRight size={16} style={{ marginRight: '4px' }} /> 
                        Health Indicator Positive
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="dashboard-grid">
                
                {/* Assets Card */}
                <div className="data-card">
                    <div className="card-title">Assets</div>
                    <div className="card-amount">{formatCurrency(results.totalAssets)}</div>
                    <div className="card-trend up">
                        <ArrowUpRight size={14} style={{ marginRight: '4px' }} /> 
                        {netRatio.toFixed(0)}% of Portfolio
                    </div>
                    
                    <div className="chart-layout">
                        <div className="legend-list">
                            {results.allocation.slice(0, 4).map((item, idx) => (
                                <div className="legend-item" key={idx}>
                                    <div className="legend-label">
                                        <div className="dot" style={{ background: COLORS[idx % COLORS.length] }}></div> 
                                        {item.name || item.category}
                                    </div>
                                    <span className="text-muted">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="donut-container" style={{ width: '160px', height: '160px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={results.allocation}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {results.allocation.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-soft)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-hole-text">
                                {netRatio.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    
                    <button className="view-details">
                        View Details <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                    </button>
                </div>

                {/* Liabilities Card */}
                <div className="data-card">
                    <div className="card-title">Liabilities</div>
                    <div className="card-amount">{formatCurrency(results.totalLiabilities)}</div>
                    <div className="card-trend down">
                        <ArrowDownRight size={14} style={{ marginRight: '4px' }} /> 
                        {debtToAssetRatio.toFixed(0)}% of Portfolio
                    </div>
                    
                    <div className="area-wrapper" style={{ height: '120px', width: '100%', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={liabilityData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLiab" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-2)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-2)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-soft)' }} />
                                <Area type="monotone" dataKey="value" stroke="var(--color-2)" strokeWidth={3} fillOpacity={1} fill="url(#colorLiab)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="legend-list">
                        {results.liabilityBreakdown && Object.entries(results.liabilityBreakdown).length > 0 ? (
                            Object.entries(results.liabilityBreakdown).map(([name, val], idx) => (
                                <div className="legend-item" key={idx}>
                                    <div className="legend-label">
                                        <div className="dot" style={{ background: COLORS[(idx + 3) % COLORS.length] }}></div> 
                                        <span style={{textTransform: 'capitalize'}}>{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </div>
                                    <span className="text-muted">{formatCurrency(val)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="legend-item">
                                <span className="text-muted">No Liabilities</span>
                            </div>
                        )}
                    </div>
                </div>
                
            </div>

            <style>{`
                .select-pill {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    color: var(--text-main);
                    font-size: 0.85rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }

                .hero-card {
                    background: linear-gradient(135deg, white 0%, #e0f2fe 100%);
                    border-radius: var(--radius-lg);
                    padding: 2.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.8);
                }

                .hero-card::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg"><path fill="%2300A9F2" opacity="0.15" d="M0,300 L0,200 L200,150 L400,220 L650,50 L850,180 L1000,100 L1000,300 Z"/></svg>') no-repeat bottom right;
                    background-size: cover;
                    pointer-events: none;
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                }

                .hero-title {
                    font-size: 1.1rem;
                    color: var(--color-1);
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .hero-amount {
                    font-size: clamp(2.5rem, 5vw, 3.5rem);
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                    line-height: 1.1;
                }

                .trend-badge {
                    display: inline-flex;
                    align-items: center;
                    color: var(--color-2);
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                }

                .data-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    transition: box-shadow 0.3s ease;
                }
                
                .data-card:hover {
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
                }

                .card-title {
                    font-size: 1.15rem;
                    color: var(--text-main);
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .card-amount {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .card-trend {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 2rem;
                }

                .card-trend.up { color: var(--color-2); }
                .card-trend.down { color: var(--text-muted); }

                .chart-layout {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 1.5rem;
                    align-items: center;
                    flex: 1;
                }

                .donut-hole-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--color-1);
                }

                .legend-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: var(--text-main);
                    font-weight: 500;
                }

                .legend-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .view-details {
                    border: 1px solid var(--border);
                    background: transparent;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--color-1);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 1.5rem;
                    align-self: flex-start;
                    transition: background 0.2s;
                }

                .view-details:hover {
                    background: var(--bg-main);
                }
                
                @media (max-width: 600px) {
                    .chart-layout {
                        grid-template-columns: 1fr;
                        justify-items: center;
                    }
                    .legend-list {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AssetOutput;


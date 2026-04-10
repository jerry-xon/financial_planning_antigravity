import sys

file_path = 'c:/financial_planning_antigravity/src/components/AllocationModule/AllocationModule.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { PieChart, Plus, Trash2, ArrowRight, Wallet, Target, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';",
    "import { PieChart, Plus, Trash2, ArrowRight, Wallet, Target, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';"
)

# 2. State
content = content.replace(
    "const [collapsedIds, setCollapsedIds] = useState(new Set());\n    const [hasAcknowledgedDeficit, setHasAcknowledgedDeficit] = useState(false);",
    "const [collapsedIds, setCollapsedIds] = useState(new Set());\n    const [hasAcknowledgedDeficit, setHasAcknowledgedDeficit] = useState(false);\n    const [viewMode, setViewMode] = useState('10');"
)

# 3. Table
# To avoid exact multi-line string match issues, we'll slice out the table
start_str = '{/* Timeline Table */}'
end_str = '{deficitInfo && hasAcknowledgedDeficit && ('

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find delimiters for table")
    sys.exit(1)

new_table_str = """{/* Timeline Table */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>Yearly Allocation Timeline</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '8px' }}>
                                <Filter size={14} /> View
                            </span>
                            <button onClick={() => setViewMode('5')} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === '5' ? 'var(--primary)' : 'transparent', color: viewMode === '5' ? 'white' : 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>5 Yrs</button>
                            <button onClick={() => setViewMode('10')} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === '10' ? 'var(--primary)' : 'transparent', color: viewMode === '10' ? 'white' : 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>10 Yrs</button>
                            <button onClick={() => setViewMode('all')} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'all' ? 'var(--primary)' : 'transparent', color: viewMode === 'all' ? 'white' : 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>All</button>
                        </div>
                    </div>
                    
                    <div className="table-scroll-container card" style={{ padding: 0, overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <table className="modern-data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                                <tr>
                                    <th rowSpan="2" style={{ padding: '0.75rem', position: 'sticky', left: 0, background: 'var(--bg-main)', zIndex: 10, textAlign: 'center' }}>Year</th>
                                    <th colSpan="2" style={{ borderLeft: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center', color: 'var(--text-main)' }}>Investible Surplus</th>
                                    {dynamicColumns.length > 0 && <th colSpan={dynamicColumns.length} style={{ borderLeft: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center', color: 'var(--text-main)' }}>Allocations</th>}
                                    <th colSpan="2" style={{ borderLeft: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center', color: 'var(--text-main)' }}>Unallocated Surplus</th>
                                </tr>
                                <tr>
                                    <th style={{ borderLeft: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Yearly</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Monthly</th>
                                    {dynamicColumns.map(col => (
                                        <th key={col} style={{ borderLeft: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>{col}</th>
                                    ))}
                                    <th style={{ borderLeft: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Yearly</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Monthly</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(viewMode === 'all' ? projections : projections.slice(0, parseInt(viewMode, 10))).map((row, idx) => {
                                    const allocationsByType = {};
                                    dynamicColumns.forEach(type => {
                                        allocationsByType[type] = row.activeAllocations
                                            ?.filter(a => a.type === type)
                                            .reduce((sum, a) => sum + (a.impactThisYear || 0), 0) || 0;
                                    });

                                    return (
                                        <tr key={row.year} style={{ background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)', borderBottom: '1px solid var(--border)' }} className="zebra-row">
                                            <td style={{ position: 'sticky', left: 0, background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)', fontWeight: 700, padding: '0.75rem', textAlign: 'center', boxShadow: '1px 0 0 var(--border)', zIndex: 5 }}>
                                                {row.year}
                                            </td>
                                            <td style={{ borderLeft: '1px dashed var(--border)', padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.netInvestibleSurplus)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(row.netInvestibleSurplus / 12)}</td>
                                            
                                            {dynamicColumns.map(type => (
                                                <td key={type} style={{ borderLeft: '1px dashed var(--border)', padding: '0.75rem', textAlign: 'right', color: allocationsByType[type] > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: allocationsByType[type] > 0 ? 600 : 400 }}>
                                                    {allocationsByType[type] > 0 ? formatCurrency(allocationsByType[type]) : '-'}
                                                </td>
                                            ))}
                                            
                                            <td style={{ borderLeft: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: row.unallocatedSurplus < 0 ? '#ef4444' : 'var(--success)', background: row.unallocatedSurplus < 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)' }}>
                                                {formatCurrency(row.unallocatedSurplus)}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: row.unallocatedSurplus < 0 ? '#ef4444' : 'var(--success)', background: row.unallocatedSurplus < 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)' }}>
                                                {formatCurrency(row.unallocatedSurplus / 12)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            """

content = content[:start_idx] + new_table_str + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")

function CostsView() {
  const I = Icons;
  const totalCOGS = COST_ROWS.reduce((a, r) => a + r.unitCost * r.qty, 0);
  const totalRev = COST_ROWS.reduce((a, r) => a + r.retail * r.qty, 0);
  const avgMargin = totalRev ? (totalRev - totalCOGS) / totalRev : 0;

  return (
    <>
      <Toolbar crumbs={["Workspace", "Cost & margin"]} right={<>
        <div className="seg">
          <button className="on">Per SKU</button>
          <button>Per factory</button>
          <button>Landed cost</button>
        </div>
        <button className="btn"><I.upload /> Export CSV</button>
      </>} />
      <div className="canvas">
        <div className="cost-wrap">
          <div className="cost-header">
            <div className="stat"><div className="label">Projected COGS</div><div className="value">${Math.round(totalCOGS/1000)}k</div><div className="delta">across {COST_ROWS.length} SKUs</div></div>
            <div className="stat"><div className="label">Projected revenue</div><div className="value">${Math.round(totalRev/1000)}k</div><div className="delta">at launch retail</div></div>
            <div className="stat"><div className="label">Blended margin</div><div className="value">{Math.round(avgMargin*100)}%</div><div className="delta up">+3pp vs target</div></div>
            <div className="stat"><div className="label">Cash to factories</div><div className="value">$49.6k</div><div className="delta">due next 30 days</div></div>
          </div>

          <div className="card">
            <div className="head">
              <div className="title">SKU economics</div>
              <div className="sub">unit cost · retail · margin</div>
              <div className="spacer" />
              <button className="btn ghost sm"><I.more /></button>
            </div>
            <div className="body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Factory</th>
                    <th style={{ textAlign: "right" }}>Unit cost</th>
                    <th style={{ textAlign: "right" }}>Retail</th>
                    <th>Margin</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>COGS</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROWS.map(r => {
                    const fac = FACTORIES.find(f => f.id === r.factory);
                    const marginClass = r.margin >= 0.72 ? "ok" : r.margin >= 0.6 ? "" : "warn";
                    return (
                      <tr key={r.sku}>
                        <td className="mono" style={{ color: "var(--fg-3)" }}>{r.sku}</td>
                        <td>{r.name}</td>
                        <td>{fac.short}</td>
                        <td className="mono" style={{ textAlign: "right" }}>${r.unitCost.toFixed(2)}</td>
                        <td className="mono" style={{ textAlign: "right" }}>{r.retail ? "$"+r.retail : "—"}</td>
                        <td style={{ width: 180 }}>
                          {r.retail ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: "var(--bg-2)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${r.margin*100}%`, background: marginClass === "ok" ? "var(--ok)" : marginClass === "warn" ? "var(--warn)" : "var(--accent)" }} />
                              </div>
                              <span className="mono" style={{ fontSize: 11 }}>{Math.round(r.margin*100)}%</span>
                            </div>
                          ) : <span className="muted mono" style={{ fontSize: 11 }}>pkg</span>}
                        </td>
                        <td className="mono" style={{ textAlign: "right" }}>{r.qty}</td>
                        <td className="mono" style={{ textAlign: "right" }}>${(r.unitCost*r.qty).toLocaleString(undefined,{ maximumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="head"><div className="title">Spend by factory</div><div className="sub">lifetime</div></div>
              <div className="body">
                {FACTORIES.sort((a,b) => b.spend - a.spend).map(f => {
                  const max = Math.max(...FACTORIES.map(x => x.spend));
                  return (
                    <div key={f.id} className="bar-row">
                      <div className="label">{f.short}</div>
                      <div className="barbg"><div className="barfill" style={{ width: `${(f.spend/max)*100}%` }} /></div>
                      <div className="num">${f.spend.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <div className="head"><div className="title">Cash runway</div><div className="sub">payments due</div></div>
              <div className="body">
                {[
                  { label: "This week", amount: 12480, note: "PO-2043 deposit · Arclight", cls: "warn" },
                  { label: "Next week", amount: 8720, note: "PO-2045 deposit · Meilong", cls: "" },
                  { label: "Within 30d", amount: 18900, note: "Balance on 3 POs", cls: "ok" },
                  { label: "30–60d", amount: 9500, note: "Forecast", cls: "ok" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr auto", gap: 10, padding: "8px 0", borderBottom: i<3 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-1)" }}>{r.note}</div>
                    <div className="mono" style={{ fontSize: 13, color: "var(--fg)" }}>${r.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.CostsView = CostsView;

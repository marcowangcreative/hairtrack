function FactoriesView() {
  const I = Icons;
  const [selId, setSelId] = useState(FACTORIES[0].id);
  const [subTab, setSubTab] = useState("overview");
  const sel = FACTORIES.find(f => f.id === selId);

  return (
    <>
      <Toolbar crumbs={["Workspace", "Factories"]} right={<>
        <div className="seg">
          <button className="on"><I.list /> List</button>
          <button><I.grid /> Grid</button>
          <button><I.globe /> Map</button>
        </div>
        <button className="btn"><I.filter /> Filter</button>
        <button className="btn primary"><I.plus /> Add factory</button>
      </>} />
      <div className="canvas" style={{ display: "flex" }}>
        <div className="split" style={{ width: "100%" }}>
          <div className="list-panel">
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center" }}>
              <div className="search" style={{ flex: 1, minWidth: 0 }}>
                <I.search />
                <input placeholder="Search by name, city, specialty…" />
              </div>
            </div>
            {FACTORIES.map(f => (
              <div key={f.id} className={"factory-row" + (f.id === selId ? " active" : "")} onClick={() => setSelId(f.id)}>
                <div className="thumb">{f.short.slice(0,2).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="name">{f.name}</div>
                  <div className="meta">
                    <span className="mono-id">{f.id}</span>
                    <span>·</span>
                    <span>{f.city}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center" }}>
                    <span className="pill dim">{f.specialty.split(",")[0]}</span>
                    {f.unread > 0 && <span className="pill accent"><span className="dot" />{f.unread} new</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>Tier {f.tier}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ok)" }}>{Math.round(f.onTime*100)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="factory-detail">
            <div className="factory-hero">
              <div className="big-thumb" style={{ background: sel.swatch }} />
              <div>
                <h2>{sel.name}</h2>
                <div className="subline">
                  <span>{sel.id}</span>
                  <span>·</span>
                  <span>{sel.city}</span>
                  <span>·</span>
                  <span className="pill dim">Tier {sel.tier}</span>
                  <span className="pill ok"><span className="dot" />{sel.status}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn"><I.whatsapp /> WhatsApp</button>
                <button className="btn"><I.link /> Alibaba</button>
                <button className="btn primary"><I.plus /> New PO</button>
              </div>
            </div>

            <div className="kv-grid">
              <div><div className="k">Contact</div><div className="v">{sel.contact}</div></div>
              <div><div className="k">WhatsApp</div><div className="v mono">{sel.whatsapp}</div></div>
              <div><div className="k">Alibaba link</div><div className="v mono" style={{ color: "var(--accent-fg)" }}>{sel.alibaba} →</div></div>
              <div><div className="k">Specialty</div><div className="v">{sel.specialty}</div></div>
              <div><div className="k">MOQ</div><div className="v mono">{sel.moq} units</div></div>
              <div><div className="k">Lead time</div><div className="v mono">{sel.leadTime} days</div></div>
              <div><div className="k">Payment terms</div><div className="v">{sel.paymentTerms}</div></div>
              <div><div className="k">Lifetime spend</div><div className="v mono">${sel.spend.toLocaleString()}</div></div>
            </div>

            <div className="subtabs">
              {[
                { id: "overview", label: "Overview" },
                { id: "samples", label: "Samples", count: sel.samples },
                { id: "orders", label: "POs & invoices", count: INVOICES.filter(i => i.factoryId === sel.id).length },
                { id: "chat", label: "Chat" },
                { id: "files", label: "Files" },
                { id: "notes", label: "Notes" },
              ].map(t => (
                <div key={t.id} className={"t" + (subTab === t.id ? " on" : "")} onClick={() => setSubTab(t.id)} style={{ cursor: "pointer" }}>
                  <span>{t.label}</span>
                  {t.count != null && <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{t.count}</span>}
                </div>
              ))}
            </div>

            {subTab === "overview" && <FactoryOverview f={sel} />}
            {subTab === "samples" && <FactorySamples f={sel} />}
            {subTab === "orders" && <FactoryOrders f={sel} />}
            {subTab === "chat" && <FactoryChatStub f={sel} />}
            {subTab === "files" && <div className="section"><h3>Files</h3><div className="muted" style={{ fontSize: 12 }}>Drop NDAs, certifications, product specs here. 14 files.</div></div>}
            {subTab === "notes" && <div className="section"><h3>Notes</h3><div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg-1)" }}>{sel.notes}</div></div>}
          </div>
        </div>
      </div>
    </>
  );
}

function FactoryOverview({ f }) {
  const samples = SAMPLES.filter(s => s.factoryId === f.id);
  const invoices = INVOICES.filter(i => i.factoryId === f.id);
  return (
    <div className="section">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div>
          <h3>Active samples</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {samples.length === 0 && <div className="muted" style={{ fontSize: 12 }}>No samples yet.</div>}
            {samples.map(s => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto auto", gap: 12, padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 6, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{s.id}</span>
                <div>
                  <div style={{ fontSize: 13, color: "var(--fg)" }}>{s.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>req {s.requested} · ETA {s.eta}</div>
                </div>
                <StagePill stage={s.stage} />
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>${s.cost}</span>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Performance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <MiniStat label="Rating" value={f.rating} suffix="/5" />
            <MiniStat label="On-time" value={Math.round(f.onTime*100)} suffix="%" />
            <MiniStat label="Orders" value={f.orders} />
            <MiniStat label="Avg lead" value={f.leadTime} suffix="d" />
          </div>
        </div>

        <div>
          <h3>Notes</h3>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--fg-1)", padding: 12, border: "1px solid var(--line)", borderRadius: 6 }}>
            {f.notes}
          </div>
          <h3 style={{ marginTop: 20 }}>Recent invoices</h3>
          <div style={{ display: "grid", gap: 6 }}>
            {invoices.length === 0 && <div className="muted" style={{ fontSize: 12 }}>None.</div>}
            {invoices.map(i => (
              <div key={i.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 5 }}>
                <Icons.doc />
                <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.file}</div>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>${i.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FactorySamples({ f }) {
  const samples = SAMPLES.filter(s => s.factoryId === f.id);
  return (
    <div className="section">
      <h3>All samples · {samples.length}</h3>
      <table className="table">
        <thead><tr><th>ID</th><th>Title</th><th>Stage</th><th>Requested</th><th>ETA</th><th>Cost</th></tr></thead>
        <tbody>
          {samples.map(s => (
            <tr key={s.id}>
              <td className="mono" style={{ color: "var(--fg-3)" }}>{s.id}</td>
              <td>{s.title}</td>
              <td><StagePill stage={s.stage} /></td>
              <td className="mono">{s.requested}</td>
              <td className="mono">{s.eta}</td>
              <td className="mono">${s.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FactoryOrders({ f }) {
  const invoices = INVOICES.filter(i => i.factoryId === f.id);
  return (
    <div className="section">
      <h3>Purchase orders & invoices</h3>
      <table className="table">
        <thead><tr><th>File</th><th>PO</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {invoices.map(i => (
            <tr key={i.id}>
              <td>{i.file}</td>
              <td className="mono">{i.fields.poNumber}</td>
              <td className="mono">{i.date}</td>
              <td className="mono">${i.amount.toLocaleString()}</td>
              <td><StatusPill status={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FactoryChatStub({ f }) {
  const thread = WA_THREADS.find(t => t.factoryId === f.id);
  if (!thread) return <div className="section"><div className="muted">No chat yet.</div></div>;
  return (
    <div className="section">
      <h3>WhatsApp · {thread.handle}</h3>
      <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 14, background: "var(--bg-1)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {thread.messages.slice(-4).map((m, i) => (
            <div key={i} className={"wa-msg " + (m.from === "me" ? "me" : "them") + (m.img ? " img" : "")}>
              {m.img ? (<><div className="placeholder">photo</div><div className="cap">{m.caption}</div></>) : m.text}
              <span className="ts">{m.ts}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="btn" style={{ marginTop: 10 }}><Icons.chat /> Open full conversation</button>
    </div>
  );
}

function MiniStat({ label, value, suffix }) {
  return (
    <div style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 6 }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 18, marginTop: 4, letterSpacing: "-0.01em" }}>{value}<span style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: 2 }}>{suffix}</span></div>
    </div>
  );
}

function StagePill({ stage }) {
  const s = SAMPLE_STAGES.find(x => x.id === stage);
  const cls = stage === "approved" ? "ok" : stage === "rejected" ? "danger" : stage === "in_production" ? "warn" : stage === "shipped" ? "accent" : "dim";
  return <span className={"pill " + cls}><span className="dot" />{s.label}</span>;
}

function StatusPill({ status }) {
  const m = { parsed: ["accent", "Parsed"], needs_review: ["warn", "Needs review"], approved: ["ok", "Approved"] };
  const [cls, label] = m[status] || ["dim", status];
  return <span className={"pill " + cls}><span className="dot" />{label}</span>;
}

Object.assign(window, { FactoriesView, StagePill, StatusPill, MiniStat });

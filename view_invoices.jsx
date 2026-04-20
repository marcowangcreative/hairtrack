function InvoicesView() {
  const I = Icons;
  const [selId, setSelId] = useState("INV-2045"); // needs_review one
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const sel = INVOICES.find(i => i.id === selId);

  const simulateDrop = () => {
    setParsing(true);
    setTimeout(() => { setParsing(false); setSelId("INV-2045"); }, 1600);
  };

  return (
    <>
      <Toolbar crumbs={["Workspace", "Invoices"]} right={<>
        <span className="pill dim"><Icons.sparkle size={10} />Auto-parse on</span>
        <button className="btn"><I.filter /> Filter</button>
        <button className="btn primary"><I.upload /> Upload</button>
      </>} />
      <div className="canvas" style={{ padding: 0 }}>
        <div className="inv-grid">
          <div className="inv-list">
            <div
              className="dropzone"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); simulateDrop(); }}
              onClick={simulateDrop}
              style={{ borderColor: dragOver ? "var(--accent)" : "var(--line-2)", background: dragOver ? "var(--accent-dim)" : "transparent", cursor: "pointer" }}
            >
              {parsing ? (
                <>
                  <div className="big"><Icons.sparkle /> Parsing invoice…</div>
                  <small>extracting factory · PO · amounts · lines</small>
                  <div style={{ height: 3, background: "var(--bg-2)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "60%", background: "var(--accent)", animation: "none" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="big"><Icons.upload /> Drop invoice · click to upload</div>
                  <small>PDF · JPG · PNG · auto-matches factory from file</small>
                </>
              )}
            </div>

            <div style={{ padding: "8px 12px 4px" }} className="mono muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-3)", padding: "8px 12px 4px" }}>Recent · {INVOICES.length}</div>

            {INVOICES.map(inv => {
              const f = FACTORIES.find(x => x.id === inv.factoryId);
              return (
                <div key={inv.id} className={"inv-row" + (inv.id === selId ? " active" : "")} onClick={() => setSelId(inv.id)}>
                  <div style={{ minWidth: 0 }}>
                    <div className="fname" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.file}</div>
                    <div className="meta">{f.short} · {inv.date} · ${inv.amount.toLocaleString()}</div>
                    <div style={{ marginTop: 6 }}><StatusPill status={inv.status} /></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <Icons.doc size={18} style={{ color: "var(--fg-3)" }}/>
                    <span className="mono" style={{ fontSize: 9, color: "var(--fg-3)" }}>{Math.round(inv.confidence*100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <InvoicePreview inv={sel} />
        </div>
      </div>
    </>
  );
}

function InvoicePreview({ inv }) {
  const f = FACTORIES.find(x => x.id === inv.factoryId);
  const [hl, setHl] = useState(null); // highlighted field key
  const fld = (k, label, hlKey) => (
    <div className="field" onMouseEnter={() => setHl(hlKey || k)} onMouseLeave={() => setHl(null)}>
      <div className="lbl">{label}<span className="conf">{Math.round(inv.confidence*100)}%</span></div>
      <div className="val hl">{inv.fields[k]}</div>
    </div>
  );

  return (
    <div className="inv-preview">
      <div className="inv-doc">
        <div className="inv-paper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1a1a17", paddingBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "var(--font-sans)" }}>
                <span className={hl === "factory" ? "hl-pdf" : ""}>{inv.fields.factory}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 10 }}>
                {f.city} · CHINA<br/>
                {f.contact} · {f.whatsapp}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-sans)" }}>INVOICE</div>
              <div style={{ marginTop: 4 }}>
                <span className={hl === "invoiceNumber" ? "hl-pdf" : ""}># {inv.fields.invoiceNumber}</span><br/>
                <span className={hl === "date" ? "hl-pdf" : ""}>Date: {inv.fields.date}</span><br/>
                <span className={hl === "dueDate" ? "hl-pdf" : ""}>Due: {inv.fields.dueDate}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            <div>
              <div style={{ fontSize: 9, color: "#5a5a55", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bill to</div>
              <div style={{ marginTop: 3 }}>HALO HAIR CO.<br/>548 Valencia St, SF, CA 94110<br/>accounts@halohair.co</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "#5a5a55", textTransform: "uppercase", letterSpacing: "0.08em" }}>Purchase order</div>
              <div style={{ marginTop: 3, fontWeight: 600 }}><span className={hl === "poNumber" ? "hl-pdf" : ""}>{inv.fields.poNumber}</span></div>
              <div style={{ fontSize: 9, color: "#5a5a55", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8 }}>Terms</div>
              <div><span className={hl === "terms" ? "hl-pdf" : ""}>{inv.fields.terms}</span></div>
            </div>
          </div>

          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a17" }}>
                <th style={{ textAlign: "left", padding: "6px 0", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>SKU</th>
                <th style={{ textAlign: "left", padding: "6px 0", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>Description</th>
                <th style={{ textAlign: "right", padding: "6px 0", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "6px 0", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>Unit</th>
                <th style={{ textAlign: "right", padding: "6px 0", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(inv.lines.length ? inv.lines : [
                { sku: "HAIR-LOT-A", desc: "Raw bundle lot A, mixed lengths", qty: 40, unit: inv.fields.total / 40, total: inv.fields.total }
              ]).map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e1d5" }}>
                  <td style={{ padding: "7px 0" }}>{l.sku}</td>
                  <td style={{ padding: "7px 0" }}>{l.desc}</td>
                  <td style={{ padding: "7px 0", textAlign: "right" }}>{l.qty}</td>
                  <td style={{ padding: "7px 0", textAlign: "right" }}>${l.unit.toFixed(2)}</td>
                  <td style={{ padding: "7px 0", textAlign: "right" }}>${l.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Subtotal</span><span>${(inv.fields.subtotal || inv.fields.total).toLocaleString()}</span></div>
              {inv.fields.shipping && <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Shipping</span><span>${inv.fields.shipping}</span></div>}
              {inv.fields.tax && <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Tax</span><span>${inv.fields.tax}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #1a1a17", marginTop: 6, fontWeight: 700, fontSize: 13 }}>
                <span>TOTAL</span>
                <span className={hl === "total" ? "hl-pdf" : ""}>${inv.fields.total.toLocaleString()} {inv.fields.currency}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 9, color: "#5a5a55", borderTop: "1px solid #e5e1d5", paddingTop: 12 }}>
            Wire to: {inv.fields.bank || "Bank of China"} · SWIFT {inv.fields.swift || "BKCHCNBJ300"} · Acct {inv.fields.account || "1234 **** 7788"}
          </div>
        </div>
      </div>

      <div className="inv-fields">
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
          <Icons.sparkle />
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Extracted fields</div>
          <div className="spacer" style={{ flex: 1 }} />
          <span className="pill accent"><span className="dot" />{Math.round(inv.confidence*100)}% confidence</span>
        </div>

        <div style={{ fontSize: 11, color: "var(--fg-3)" }}>
          Hover a field to highlight its source on the invoice. Review, then confirm to auto-populate the factory record and create a PO.
        </div>

        {fld("factory", "Factory match")}
        <div style={{ marginTop: -6, display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
          <Icons.check size={11} style={{ color: "var(--ok)" }} />
          <span className="muted">Matched to existing <b style={{ color: "var(--fg-1)" }}>{f.name}</b> ({f.id})</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {fld("poNumber", "PO number")}
          {fld("invoiceNumber", "Invoice #")}
          {fld("date", "Issue date")}
          {fld("dueDate", "Due date")}
          {fld("terms", "Terms")}
          <div className="field" onMouseEnter={() => setHl("total")} onMouseLeave={() => setHl(null)}>
            <div className="lbl">Total<span className="conf">{Math.round(inv.confidence*100)}%</span></div>
            <div className="val hl">${inv.fields.total.toLocaleString()} {inv.fields.currency}</div>
          </div>
        </div>

        <div style={{ padding: 10, border: "1px dashed var(--line-2)", borderRadius: 6, fontSize: 11, color: "var(--fg-2)", display: "flex", gap: 8, alignItems: "center" }}>
          <Icons.zap size={14} style={{ color: "var(--accent-fg)" }} />
          <div>We'll create <b style={{ color: "var(--fg-1)" }}>PO-{inv.fields.poNumber.replace("PO-","")}</b>, schedule payment of <b style={{ color: "var(--fg-1)" }}>${inv.fields.total.toLocaleString()}</b> per {inv.fields.terms}.</div>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button className="btn" style={{ flex: 1 }}><Icons.x /> Reject</button>
          <button className="btn primary" style={{ flex: 2 }}><Icons.check /> Confirm & create PO</button>
        </div>
      </div>
    </div>
  );
}

window.InvoicesView = InvoicesView;

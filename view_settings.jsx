function SettingsView() {
  const I = Icons;
  const [template, setTemplate] = useState("po_confirmation");

  const templates = [
    { id: "po_confirmation", name: "po_confirmation", category: "Utility", status: "approved", body: "Hi {{1}}, confirming PO-{{2}} for {{3}} units. Deposit of ${{4}} sent via T/T. Lead time {{5}} days." },
    { id: "sample_followup", name: "sample_followup", category: "Utility", status: "approved", body: "Hi {{1}}, checking in on sample {{2}}. Any update on ETA?" },
    { id: "payment_receipt", name: "payment_receipt", category: "Utility", status: "approved", body: "Payment of ${{1}} for invoice {{2}} completed. Reference: {{3}}." },
    { id: "launch_outreach", name: "launch_outreach_v2", category: "Marketing", status: "pending", body: "Hi {{1}}, we're kicking off the Halo launch. Can we discuss capacity for Q3?" },
  ];

  const usage = [
    { label: "Service (factory-initiated)", count: 412, cost: 0, note: "Free · since Nov 2024" },
    { label: "Utility (you initiated)", count: 38, cost: 0.38, note: "$0.01 avg · China" },
    { label: "Marketing", count: 0, cost: 0, note: "Not used" },
    { label: "Telnyx platform fee", count: null, cost: 2.10, note: "Flat monthly" },
  ];
  const total = usage.reduce((a, r) => a + r.cost, 0);

  return (
    <>
      <Toolbar crumbs={["Workspace", "Integrations"]} right={<>
        <button className="btn"><I.check /> All systems ok</button>
      </>} />
      <div className="canvas">
        <div style={{ padding: 18, display: "grid", gap: 14 }}>
          {/* Telnyx connection */}
          <div className="card">
            <div className="head">
              <div className="title">Telnyx · WhatsApp Business</div>
              <div className="sub">connected</div>
              <div className="spacer" />
              <span className="pill ok"><span className="dot" />live</span>
              <button className="btn sm">Manage</button>
            </div>
            <div className="body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>WABA ID</div><div className="mono" style={{ marginTop: 3 }}>284104710220188</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Business number</div><div className="mono" style={{ marginTop: 3 }}>+1 (415) 555-0184</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Display name</div><div style={{ marginTop: 3 }}>Halo Hair Ops</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quality rating</div><div style={{ marginTop: 3, color: "var(--ok)" }}>High</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Webhook</div><div className="mono" style={{ marginTop: 3, fontSize: 11, color: "var(--accent-fg)" }}>api.hairtrack.co/wh/tx</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Messaging tier</div><div style={{ marginTop: 3 }}>1,000 / 24h</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Connected by</div><div style={{ marginTop: 3 }}>Mia Kovács · Apr 3</div></div>
                <div><div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Campaign required</div><div style={{ marginTop: 3, color: "var(--fg-1)" }}>No</div></div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            {/* Usage */}
            <div className="card">
              <div className="head">
                <div className="title">Usage this month</div>
                <div className="sub">Apr 1 → Apr 20 · WhatsApp conversation-based</div>
                <div className="spacer" />
                <span className="mono" style={{ fontSize: 13, color: "var(--fg)" }}>${total.toFixed(2)}</span>
              </div>
              <div className="body" style={{ padding: 0 }}>
                {usage.map((u, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", gap: 10, padding: "10px 14px", borderBottom: i < usage.length-1 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12.5, color: "var(--fg)" }}>{u.label}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>{u.note}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", textAlign: "right" }}>{u.count != null ? u.count + " conv" : "—"}</div>
                    <div className="mono" style={{ fontSize: 13, color: "var(--fg)", textAlign: "right" }}>${u.cost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="card">
              <div className="head">
                <div className="title">Message templates</div>
                <div className="sub">required only for out-of-24hr initiations</div>
                <div className="spacer" />
                <button className="btn sm"><I.plus /> New</button>
              </div>
              <div className="body" style={{ padding: 0 }}>
                {templates.map(t => (
                  <div key={t.id} onClick={() => setTemplate(t.id)} style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", cursor: "pointer", background: template === t.id ? "var(--bg-2)" : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--fg)" }}>{t.name}</span>
                      <span className={"pill " + (t.status === "approved" ? "ok" : "warn")}><span className="dot" />{t.status}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: "auto" }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 4, fontFamily: "var(--font-mono)" }}>{t.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="card">
            <div className="head"><div className="title">How pricing works</div><div className="sub">Meta pricing · Telnyx passthrough</div></div>
            <div className="body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="pill ok"><span className="dot" />Service</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg)" }}>FREE</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>Factory messages you first → 24hr window opens. All your back-and-forth in that window is free. Covers 90%+ of this ops use case.</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="pill accent"><span className="dot" />Utility</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg)" }}>~$0.004–0.015</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>You initiate after 24hr silence. Must use an approved template. China rates are among the cheapest. Think PO confirmations, payment receipts.</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="pill warn"><span className="dot" />Marketing</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg)" }}>~$0.02+</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>Promotional outreach, campaigns. Not needed for factory ops. Disabled by default.</div>
              </div>
            </div>
          </div>

          {/* Other integrations */}
          <div className="card">
            <div className="head"><div className="title">Other integrations</div></div>
            <div className="body" style={{ padding: 0 }}>
              {[
                { name: "Alibaba supplier sync", status: "connected", note: "7 factories · last sync 2h ago" },
                { name: "Gmail — invoice inbox", status: "connected", note: "accounts@halohair.co · 42 parsed" },
                { name: "Shopify", status: "not_connected", note: "Push SKUs on launch" },
                { name: "Stripe — payouts", status: "connected", note: "Wires to factories via Wise" },
                { name: "Google Drive — sample photos", status: "connected", note: "/Halo/Samples · 214 files" },
              ].map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "11px 14px", borderBottom: i < 4 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12.5 }}>{row.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 2 }}>{row.note}</div>
                  </div>
                  <span className={"pill " + (row.status === "connected" ? "ok" : "dim")}><span className="dot" />{row.status === "connected" ? "connected" : "not connected"}</span>
                  <button className="btn sm">{row.status === "connected" ? "Manage" : "Connect"}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.SettingsView = SettingsView;

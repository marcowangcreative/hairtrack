function DashboardView() {
  const I = Icons;
  const stats = [
    { label: "Active factories", value: FACTORIES.filter(f => f.status === "active").length, delta: "+1 this week", deltaClass: "up" },
    { label: "Samples in-flight", value: SAMPLES.filter(s => !["approved","rejected"].includes(s.stage)).length, delta: "3 arriving this wk", deltaClass: "" },
    { label: "Unread on WhatsApp", value: WA_THREADS.reduce((a,t)=>a+t.unread,0), delta: "Across 4 threads", deltaClass: "" },
    { label: "Open invoices", value: INVOICES.filter(i => i.status !== "approved").length, delta: "$21,200 pending", deltaClass: "" },
  ];

  return (
    <>
      <Toolbar crumbs={["Workspace", "Dashboard"]} right={<>
        <button className="btn"><I.plus /> New sample</button>
        <button className="btn primary"><I.sparkle /> Ask Hair Track</button>
      </>} />
      <div className="canvas">
        <div className="dash">
          <div className="stats">
            {stats.map(s => (
              <div key={s.label} className="stat">
                <div className="label">{s.label}</div>
                <div className="value">{s.value}</div>
                <div className={"delta " + s.deltaClass}>{s.delta}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="head">
              <div className="title">Samples by stage</div>
              <div className="sub">Last 30 days</div>
              <div className="spacer" />
              <button className="btn ghost sm"><I.more /></button>
            </div>
            <div className="body" style={{ padding: 0 }}>
              {SAMPLE_STAGES.map(stage => {
                const items = SAMPLES.filter(s => s.stage === stage.id);
                const pct = items.length / SAMPLES.length;
                return (
                  <div key={stage.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", gap: 10, alignItems: "center", padding: "8px 14px", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: stage.color }} />
                      <span style={{ fontSize: 12 }}>{stage.label}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct*100}%`, background: stage.color }} />
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", textAlign: "right" }}>{items.length}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="head">
              <div className="title">Activity</div>
              <div className="sub">live</div>
              <div className="spacer" />
              <span className="pill ok"><span className="dot" />sync ok</span>
            </div>
            <div className="body" style={{ padding: 0 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} className="activity-row">
                  <div className="time">{a.time}</div>
                  <div className="who">{a.who}</div>
                  <div className="what">{a.what}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="head">
              <div className="title">Launch runway</div>
              <div className="sub">Apr → Jun 2026 · public launch W9</div>
              <div className="spacer" />
              <button className="btn ghost sm"><I.calendar /> Open timeline</button>
            </div>
            <div className="body">
              <MiniTimeline />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniTimeline() {
  const total = WEEKS.length;
  const items = TIMELINE_ITEMS.slice(0, 7);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${total}, 1fr)`, borderBottom: "1px solid var(--line)" }}>
        <div></div>
        {WEEKS.map((w, i) => (
          <div key={w} className="mono" style={{ fontSize: 10, color: "var(--fg-3)", padding: "4px 6px", borderLeft: "1px solid var(--line)" }}>{w}</div>
        ))}
      </div>
      {items.map(it => (
        <div key={it.id} style={{ display: "grid", gridTemplateColumns: `180px repeat(${total}, 1fr)`, alignItems: "center", height: 30, borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, padding: "0 10px", color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</div>
          <div style={{ gridColumn: `${it.start + 2} / ${it.end + 2}`, position: "relative", height: 16, margin: "0 2px" }}>
            <div className={"tl-bar " + (it.status === "warn" ? "warn" : it.status === "accent" ? "" : "ok")} style={{ position: "absolute", inset: 0, fontSize: 10 }}>
              {it.phase}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

window.DashboardView = DashboardView;

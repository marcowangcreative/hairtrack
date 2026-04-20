function SamplesView() {
  const I = Icons;
  const [view, setView] = useState(window.TWEAKS.pipelineView || "kanban");
  useEffect(() => {
    const h = () => setView(window.TWEAKS.pipelineView);
    window.addEventListener("tweaks-changed", h);
    return () => window.removeEventListener("tweaks-changed", h);
  }, []);

  const right = (<>
    <div className="seg">
      <button className={view === "kanban" ? "on" : ""} onClick={() => setView("kanban")}><I.kanban /> Kanban</button>
      <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}><I.list /> List</button>
      <button className={view === "timeline" ? "on" : ""} onClick={() => setView("timeline")}><I.timeline /> Timeline</button>
    </div>
    <button className="btn"><I.filter /> Filter</button>
    <button className="btn primary"><I.plus /> New sample</button>
  </>);

  return (
    <>
      <Toolbar crumbs={["Workspace", "Samples"]} right={right} />
      <div className="canvas">
        {view === "kanban" && <SamplesKanban />}
        {view === "list" && <SamplesList />}
        {view === "timeline" && <SamplesTimeline />}
      </div>
    </>
  );
}

function SamplesKanban() {
  return (
    <div className="kanban">
      {SAMPLE_STAGES.map(stage => {
        const items = SAMPLES.filter(s => s.stage === stage.id);
        return (
          <div key={stage.id} className="kcol">
            <div className="head">
              <span className="dot" style={{ background: stage.color }} />
              <span className="title">{stage.label}</span>
              <span className="count">{items.length}</span>
            </div>
            <div className="list">
              {items.map(s => <KCard key={s.id} s={s} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KCard({ s }) {
  const fac = FACTORIES.find(f => f.id === s.factoryId);
  const daysLeft = s.eta !== "—" ? Math.max(0, Math.round(Math.random()*12)) : null;
  return (
    <div className="kcard">
      <div className="top">
        <span>{s.id}</span>
        <span style={{ color: "var(--fg-4)" }}>·</span>
        <span>{fac.short}</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-3)" }}>${s.cost}</span>
      </div>
      <div className="title">{s.title}</div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
        {s.swatches.map((c, i) => (
          <span key={i} className="sw" style={{ background: c }} />
        ))}
        <div style={{ flex: 1, marginLeft: 8 }}>
          <div className="bar"><div className="fill" style={{ width: `${s.progress*100}%` }} /></div>
        </div>
      </div>
      <div className="bot">
        <Icons.clock size={11} />
        <span>ETA {s.eta}</span>
        {s.tracking && s.tracking !== "—" && <><span className="dot" /><Icons.truck size={11} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tracking.split(" ")[0]}</span></>}
      </div>
    </div>
  );
}

function SamplesList() {
  return (
    <div className="sample-list">
      <div className="row head">
        <div>ID</div>
        <div>Sample</div>
        <div>Factory</div>
        <div>Stage</div>
        <div>Requested</div>
        <div>ETA</div>
        <div></div>
      </div>
      {SAMPLES.map(s => {
        const fac = FACTORIES.find(f => f.id === s.factoryId);
        return (
          <div key={s.id} className="row">
            <div className="mono" style={{ color: "var(--fg-3)" }}>{s.id}</div>
            <div>
              <div style={{ color: "var(--fg)" }}>{s.title}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {s.swatches.map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: "1px solid var(--line-2)" }} />)}
              </div>
            </div>
            <div style={{ fontSize: 12 }}>{fac.short}</div>
            <div><StagePill stage={s.stage} /></div>
            <div className="mono" style={{ color: "var(--fg-2)" }}>{s.requested}</div>
            <div className="mono" style={{ color: "var(--fg-2)" }}>{s.eta}</div>
            <div style={{ color: "var(--fg-3)" }}><Icons.more /></div>
          </div>
        );
      })}
    </div>
  );
}

function SamplesTimeline() {
  // Map stages to horizontal position in 6 "weeks"
  const stageIdx = { requested: 0, in_production: 1, shipped: 2, received: 3, approved: 4, rejected: 4 };
  const cols = 6;
  return (
    <div className="tl">
      <div className="tl-grid">
        <div className="tl-cell-left" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sample</div>
        <div className="tl-cell-right" style={{ minHeight: 30 }}>
          <div className="tl-weeks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {["W15","W16","W17","W18","W19","W20"].map(w => <div key={w} className="tl-week">{w}</div>)}
          </div>
        </div>
        {SAMPLES.map(s => {
          const fac = FACTORIES.find(f => f.id === s.factoryId);
          const start = 0;
          const end = Math.max(1, stageIdx[s.stage] + 1);
          const status = s.stage === "approved" ? "ok" : s.stage === "rejected" ? "danger" : s.stage === "in_production" ? "warn" : "";
          return (
            <React.Fragment key={s.id}>
              <div className="tl-cell-left">
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", width: 42 }}>{s.id}</span>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{fac.short}</div>
                </div>
              </div>
              <div className="tl-cell-right">
                <div className="tl-weeks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {Array.from({ length: cols }).map((_, i) => <div key={i} className="tl-week"></div>)}
                </div>
                <div className={"tl-bar " + status} style={{
                  left: `calc(${start * (100/cols)}% + 3px)`,
                  width: `calc(${(end - start) * (100/cols)}% - 6px)`
                }}>
                  {SAMPLE_STAGES.find(st => st.id === s.stage).label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

window.SamplesView = SamplesView;

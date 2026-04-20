function WhatsAppView() {
  const I = Icons;
  const [selId, setSelId] = useState(WA_THREADS[0].id);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const messagesRef = useRef(null);

  const threads = WA_THREADS.filter(t => {
    if (filter === "unread") return t.unread > 0;
    if (filter === "pinned") return t.pinned;
    return true;
  });

  const sel = WA_THREADS.find(t => t.id === selId);
  const fac = FACTORIES.find(f => f.id === sel.factoryId);
  const facSamples = SAMPLES.filter(s => s.factoryId === sel.factoryId);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [selId]);

  return (
    <>
      <Toolbar crumbs={["Workspace", "WhatsApp"]} right={<>
        <span className="pill ok"><span className="dot" />Connected · +1 (415) 555-0184</span>
        <button className="btn"><I.filter /> Filter</button>
        <button className="btn"><I.plus /> New chat</button>
      </>} />
      <div className="canvas" style={{ padding: 0 }}>
        <div className="wa-layout">
          <div className="wa-list">
            <div className="filter-row">
              {[{id:"all",label:"All"},{id:"unread",label:"Unread"},{id:"pinned",label:"Pinned"}].map(f => (
                <button key={f.id} className={"filter" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>{f.label.toUpperCase()}</button>
              ))}
            </div>
            {threads.map(t => (
              <div key={t.id} className={"wa-thread" + (t.id === selId ? " active" : "")} onClick={() => setSelId(t.id)}>
                <div className="avatar" style={{ background: FACTORIES.find(f => f.id === t.factoryId)?.swatch }}>{t.name.split(" ")[0][0]}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="who">
                    {t.name}
                    {t.pinned && <Icons.pin size={10} style={{ marginLeft: 6, color: "var(--fg-3)" }} />}
                  </div>
                  <div className="preview">{t.preview}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <div className="time">{t.time}</div>
                  {t.unread > 0 && <span className="unread">{t.unread}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="wa-chat">
            <div className="head">
              <div className="avatar" style={{ background: fac.swatch, width: 30, height: 30 }}>{sel.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{sel.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{sel.handle} · last seen 9 min ago</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn ghost sm"><I.phone /></button>
                <button className="btn ghost sm"><I.paperclip /></button>
                <button className="btn ghost sm"><I.more /></button>
              </div>
            </div>
            <div className="messages" ref={messagesRef}>
              {sel.messages.map((m, i) => (
                <React.Fragment key={i}>
                  {m.day && <div className="wa-day">— {m.day} —</div>}
                  <div className={"wa-msg " + (m.from === "me" ? "me" : "them") + (m.img ? " img" : "")}>
                    {m.img ? (
                      <>
                        <div className="placeholder">sample photo</div>
                        {m.caption && <div className="cap">{m.caption}</div>}
                      </>
                    ) : m.text}
                    <span className="ts">{m.ts}{m.from === "me" && " ✓✓"}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="wa-compose">
              <button className="btn ghost sm"><I.paperclip /></button>
              <input placeholder="Message on WhatsApp…" value={draft} onChange={e => setDraft(e.target.value)} />
              <button className="btn"><I.sparkle /> Draft reply</button>
              <button className="btn primary"><I.send /></button>
            </div>
          </div>

          <div className="wa-context">
            <div className="block">
              <div className="label">Factory</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: fac.swatch, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{fac.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{fac.id} · {fac.city}</div>
                </div>
              </div>
              <div className="kv" style={{ marginTop: 10 }}>
                <div className="k">Contact</div><div className="v">{fac.contact}</div>
                <div className="k">MOQ</div><div className="v mono">{fac.moq}</div>
                <div className="k">Lead</div><div className="v mono">{fac.leadTime}d</div>
                <div className="k">On-time</div><div className="v mono" style={{ color: "var(--ok)" }}>{Math.round(fac.onTime*100)}%</div>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                <button className="btn sm" style={{ flex: 1 }}><Icons.link size={11} /> Alibaba</button>
                <button className="btn sm" style={{ flex: 1 }}>Open profile</button>
              </div>
            </div>

            <div className="block">
              <div className="label">Related samples · {facSamples.length}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {facSamples.slice(0, 4).map(s => (
                  <div key={s.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", width: 40 }}>{s.id}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--fg-1)" }}>{s.title}</span>
                    <StagePill stage={s.stage} />
                  </div>
                ))}
              </div>
            </div>

            <div className="block">
              <div className="label">Quick replies</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
                {["Confirmed, proceed.", "Please send tracking.", "Revised swatch attached.", "Request updated proforma."].map(r => (
                  <button key={r} className="btn sm" style={{ justifyContent: "flex-start", background: "var(--bg-1)" }}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.WhatsAppView = WhatsAppView;

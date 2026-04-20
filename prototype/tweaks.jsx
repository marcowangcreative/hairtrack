function TweaksPanel({ visible }) {
  const [tweaks, setTweaks] = useState({ ...window.TWEAKS });

  const update = (key, value) => {
    const next = { ...tweaks, [key]: value };
    setTweaks(next);
    window.TWEAKS = next;
    window.dispatchEvent(new CustomEvent("tweaks-changed"));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: value } }, "*");
  };

  if (!visible) return null;

  const seg = (key, options) => (
    <div className={"tweaks-opts" + (options.length === 2 ? " two" : "")}>
      {options.map(o => (
        <button key={o.value} className={tweaks[key] === o.value ? "on" : ""} onClick={() => update(key, o.value)}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div className="tweaks-panel">
      <h4><span className="dot" /> Tweaks</h4>
      <div className="tweaks-group">
        <div className="tweaks-label">Layout</div>
        {seg("layout", [{ value: "sidebar", label: "Sidebar" }, { value: "top", label: "Top nav" }])}
      </div>
      <div className="tweaks-group">
        <div className="tweaks-label">Sample pipeline</div>
        {seg("pipelineView", [{ value: "kanban", label: "Kanban" }, { value: "list", label: "List" }, { value: "timeline", label: "Timeline" }])}
      </div>
      <div className="tweaks-group">
        <div className="tweaks-label">Density</div>
        {seg("density", [{ value: "comfortable", label: "Comfy" }, { value: "compact", label: "Compact" }])}
      </div>
      <div className="tweaks-group">
        <div className="tweaks-label">Theme</div>
        {seg("theme", [{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }])}
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;

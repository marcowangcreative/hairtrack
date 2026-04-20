function App() {
  const [view, setView] = useState(() => localStorage.getItem("ht.view") || "dashboard");
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState({ ...window.TWEAKS });

  useEffect(() => { localStorage.setItem("ht.view", view); }, [view]);

  // Sync tweaks state when changed
  useEffect(() => {
    const h = () => setTweaks({ ...window.TWEAKS });
    window.addEventListener("tweaks-changed", h);
    return () => window.removeEventListener("tweaks-changed", h);
  }, []);

  // Edit-mode protocol — must register listener first
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  // Apply theme to html
  useEffect(() => {
    document.documentElement.classList.toggle("light", tweaks.theme === "light");
  }, [tweaks.theme]);

  // Keyboard nav
  useEffect(() => {
    const keyMap = { "1": "dashboard", "2": "factories", "3": "samples", "4": "whatsapp", "5": "invoices", "6": "timeline", "7": "costs", "8": "settings" };
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (keyMap[e.key]) setView(keyMap[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const appCls = "app " + (tweaks.layout === "top" ? "top-layout" : "sidebar-layout") + " " + (tweaks.density || "comfortable");

  const renderView = () => {
    switch (view) {
      case "factories": return <FactoriesView />;
      case "samples": return <SamplesView />;
      case "whatsapp": return <WhatsAppView />;
      case "invoices": return <InvoicesView />;
      case "timeline": return <TimelineView />;
      case "costs": return <CostsView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={appCls} data-screen-label={view}>
      {tweaks.layout === "top"
        ? <TopNav view={view} setView={setView} />
        : <Sidebar view={view} setView={setView} />}
      <main className="main">
        {renderView()}
      </main>
      <TweaksPanel visible={tweaksOpen} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Timeline } from "./screens/Timeline";
import { PrimarySources } from "./screens/PrimarySources";
import { ExternalSearch } from "./screens/ExternalSearch";
import { ResourceInbox } from "./screens/ResourceInbox";
import { DiscoveryNotes } from "./screens/DiscoveryNotes";
import { Analysis } from "./screens/Analysis";
import { AppContextProvider } from "./context/AppContext";
import "./App.css";

const NAV_ITEMS = [
  { path: "/", label: "年表" },
  { path: "/primary-sources", label: "一次資料" },
  { path: "/external-search", label: "外部探索" },
  { path: "/resource-inbox", label: "資料インボックス" },
  { path: "/discovery-notes", label: "発見メモ" },
  { path: "/analysis", label: "推察・考察" },
];

export default function App() {
  return (
    <AppContextProvider>
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="app-title">年代史DB</div>
          <nav className="app-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Timeline />} />
            <Route path="/primary-sources" element={<PrimarySources />} />
            <Route path="/external-search" element={<ExternalSearch />} />
            <Route path="/resource-inbox" element={<ResourceInbox />} />
            <Route path="/discovery-notes" element={<DiscoveryNotes />} />
            <Route path="/analysis" element={<Analysis />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </AppContextProvider>
  );
}

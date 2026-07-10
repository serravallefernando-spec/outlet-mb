import { useState, useEffect, useRef, useCallback } from "react";

const ADMIN_USER = "effedigital";
const ADMIN_PASS = "fernandofrancesco100%";

// Scaglioni progressivi di provvigione (calcolo "a fasce", come l'IRPEF):
// 10% fino a 4.999 € · 12,5% da 5.000 a 7.499 € · 15% da 7.500 € in su
const SCAGLIONI = [
  { da: 0, a: 4999, perc: 10 },
  { da: 5000, a: 7499, perc: 12.5 },
  { da: 7500, a: Infinity, perc: 15 },
];

function calcolaProvvigione(fatturato) {
  let totale = 0;
  const dettaglio = [];
  for (const sc of SCAGLIONI) {
    if (fatturato <= sc.da) break;
    const fine = sc.a === Infinity ? fatturato : Math.min(sc.a, fatturato);
    const quota = Math.max(0, fine - sc.da);
    const provvigioneFascia = quota * sc.perc / 100;
    if (quota > 0) {
      totale += provvigioneFascia;
      dettaglio.push({ ...sc, quota, provvigioneFascia });
    }
  }
  return { totale, dettaglio };
}

function aliquotaMarginale(fatturato) {
  const sc = [...SCAGLIONI].reverse().find(s => fatturato >= s.da);
  return sc ? sc.perc : SCAGLIONI[0].perc;
}

const initialProducts = [
  { id: "8001", barcode: "8001234567890", nome: "Giacca doppio petto beige", taglia: "M", colore: "Beige", categoria: "Giacche", prezzoVendita: 89, stock: 3 },
  { id: "8002", barcode: "8009876543210", nome: "Abito lungo avorio", taglia: "S", colore: "Avorio", categoria: "Abiti", prezzoVendita: 120, stock: 2 },
  { id: "8003", barcode: "8001122334455", nome: "Blazer navy slim", taglia: "L", colore: "Navy", categoria: "Giacche", prezzoVendita: 75, stock: 5 },
  { id: "8004", barcode: "8005544332211", nome: "Gonna midi plissé", taglia: "M", colore: "Sabbia", categoria: "Gonne", prezzoVendita: 55, stock: 4 },
  { id: "8005", barcode: "8007788996655", nome: "Camicia lino bianca", taglia: "S", colore: "Bianco", categoria: "Camicie", prezzoVendita: 45, stock: 7 },
  { id: "8006", barcode: "8003344556677", nome: "Pantalone palazzo grigio", taglia: "M", colore: "Grigio", categoria: "Pantaloni", prezzoVendita: 65, stock: 2 },
];

const initialVendite = [
  { id: "v1", prodottoId: "8001", nome: "Giacca doppio petto beige", taglia: "M", prezzo: 89, data: "2025-06-01", ora: "10:23" },
  { id: "v2", prodottoId: "8002", nome: "Abito lungo avorio", taglia: "S", prezzo: 120, data: "2025-06-03", ora: "14:05" },
  { id: "v3", prodottoId: "8005", nome: "Camicia lino bianca", taglia: "S", prezzo: 45, data: "2025-06-07", ora: "11:30" },
  { id: "v4", prodottoId: "8003", nome: "Blazer navy slim", taglia: "L", prezzo: 75, data: "2025-06-10", ora: "16:45" },
  { id: "v5", prodottoId: "8004", nome: "Gonna midi plissé", taglia: "M", prezzo: 55, data: "2025-06-14", ora: "09:15" },
  { id: "v6", prodottoId: "8001", nome: "Giacca doppio petto beige", taglia: "M", prezzo: 89, data: "2025-06-18", ora: "13:00" },
  { id: "v7", prodottoId: "8006", nome: "Pantalone palazzo grigio", taglia: "M", prezzo: 65, data: "2025-06-20", ora: "17:20" },
];

const C = {
  bg: "#0D0D0D",
  surface: "#1A1A1A",
  card: "#222222",
  border: "#2E2E2E",
  gold: "#C9A84C",
  goldLight: "#E8C66A",
  white: "#FFFFFF",
  muted: "#888888",
  green: "#2ECC71",
  red: "#E74C3C",
  blue: "#3498DB",
};

const fmt = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
const fmtN = (n) => new Intl.NumberFormat("it-IT").format(n);

function LoginScreen({ s, C, loginUser, setLoginUser, loginPass, setLoginPass, loginError, handleLogin, setView }) {
  return (
    <div style={s.loginWrap}>
      <div style={s.loginCard}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 18, letterSpacing: 2, marginBottom: 6 }}>// EFFE</div>
          <div style={{ fontSize: 13, color: C.muted }}>Accesso area riservata</div>
        </div>
        <div style={{ ...s.label, marginBottom: 6 }}>Nome utente</div>
        <input
          style={s.inputNormal}
          placeholder="Nome utente"
          value={loginUser}
          onChange={e => setLoginUser(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          spellCheck="false"
          name="username"
        />
        <div style={{ ...s.label, marginBottom: 6 }}>Password</div>
        <input
          style={s.inputNormal}
          placeholder="Password"
          type="password"
          value={loginPass}
          onChange={e => setLoginPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="current-password"
          spellCheck="false"
          name="password"
        />
        {loginError && <div style={s.errorBox}>{loginError}</div>}
        <button style={{ ...s.btn(C.gold), marginTop: 4 }} onClick={handleLogin}>Accedi</button>
        <button style={{ ...s.btnOutline, marginBottom: 0 }} onClick={() => setView("client")}>Torna alla vista cliente</button>
      </div>
    </div>
  );
}

function ScanPanel({ mode, s, C, fmt, scanRef, scanInput, setScanInput, handleScan, scanError, scanResult, setScanMode, setScanResult, setScanError, handleVendita, handleEntrata, onOpenCamera }) {
  return (
    <div style={s.card}>
      <div style={{ ...s.label, marginBottom: 10 }}>{mode === "uscita" ? "Registra vendita" : "Registra entrata"}</div>
      <button
        style={{ ...s.btn(C.gold), marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onClick={onOpenCamera}
      >
        <span style={{ fontSize: 18 }}>📷</span> Scansiona con fotocamera
      </button>
      <div style={{ textAlign: "center", color: C.muted, fontSize: 11, margin: "6px 0 10px" }}>oppure inserisci il codice a mano</div>
      <input
        ref={scanRef}
        style={s.input}
        placeholder="Scansiona o digita il codice..."
        value={scanInput}
        onChange={e => setScanInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleScan()}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button style={{ ...s.btnOutline, marginBottom: 0 }} onClick={handleScan}>Cerca capo</button>
        <button style={{ ...s.btn("#333"), marginBottom: 0, width: "auto", padding: "14px 18px" }} onClick={() => { setScanMode(null); setScanResult(null); setScanError(""); }}>✕</button>
      </div>
      {scanError && <div style={{ ...s.errorBox, marginTop: 12 }}>{scanError}</div>}
      {scanResult && (
        <div style={{ ...s.successBox, marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: C.white }}>{scanResult.nome}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Taglia {scanResult.taglia} · {scanResult.colore} · Stock attuale: {scanResult.stock}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 14 }}>{fmt(scanResult.prezzoVendita)}</div>
          {mode === "uscita"
            ? <button style={s.btn(C.green)} onClick={() => handleVendita(scanResult)}>Conferma vendita</button>
            : <button style={s.btn(C.blue)} onClick={() => handleEntrata(scanResult)}>Conferma entrata</button>}
        </div>
      )}
    </div>
  );
}

function AdminMagazzino({ s, C, fmt, searchMag, setSearchMag, filterCat, setFilterCat, categorie, showAddProduct, setShowAddProduct, newProduct, setNewProduct, handleAddProduct, prodottiFiltrati, setProducts, showToast, onOpenCamera }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          style={{ ...s.inputNormal, flex: 1, marginBottom: 0 }}
          placeholder="Cerca per nome o barcode..."
          value={searchMag}
          onChange={e => setSearchMag(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
        <select style={{ ...s.select, width: "auto", marginBottom: 0 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {categorie.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!showAddProduct && (
        <button style={{ ...s.btn(C.gold), marginBottom: 14 }} onClick={() => setShowAddProduct(true)}>+ Aggiungi prodotto</button>
      )}

      {showAddProduct && (
        <div style={s.card}>
          <div style={{ ...s.label, marginBottom: 12 }}>Nuovo prodotto</div>
          <button
            style={{ ...s.btn(C.gold), marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={onOpenCamera}
          >
            <span style={{ fontSize: 18 }}>📷</span> Scansiona codice a barre
          </button>
          <input style={s.inputNormal} placeholder="Codice a barre *" value={newProduct.barcode} onChange={e => setNewProduct(p => ({ ...p, barcode: e.target.value }))} autoCapitalize="none" autoCorrect="off" spellCheck="false" />
          <input style={s.inputNormal} placeholder="Nome capo *" value={newProduct.nome} onChange={e => setNewProduct(p => ({ ...p, nome: e.target.value }))} autoCorrect="off" spellCheck="false" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input style={{ ...s.inputNormal }} placeholder="Taglia" value={newProduct.taglia} onChange={e => setNewProduct(p => ({ ...p, taglia: e.target.value }))} autoCorrect="off" spellCheck="false" />
            <input style={{ ...s.inputNormal }} placeholder="Colore" value={newProduct.colore} onChange={e => setNewProduct(p => ({ ...p, colore: e.target.value }))} autoCorrect="off" spellCheck="false" />
          </div>
          <select style={s.select} value={newProduct.categoria} onChange={e => setNewProduct(p => ({ ...p, categoria: e.target.value }))}>
            {["Abiti", "Giacche", "Gonne", "Pantaloni", "Camicie", "Accessori"].map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={s.inputNormal} placeholder="Prezzo di vendita (€) *" type="number" value={newProduct.prezzoVendita} onChange={e => setNewProduct(p => ({ ...p, prezzoVendita: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btn(C.gold), marginBottom: 0 }} onClick={handleAddProduct}>Salva</button>
            <button style={{ ...s.btnOutline, marginBottom: 0 }} onClick={() => setShowAddProduct(false)}>Annulla</button>
          </div>
        </div>
      )}

      {prodottiFiltrati.map(p => (
        <div key={p.id} style={{ ...s.card, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.nome}</div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{p.barcode}</div>
            </div>
            <span style={s.tag(p.stock === 0 ? "#555" : p.stock <= 1 ? C.red : C.green)}>{p.stock} pz</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={s.tag(C.muted)}>T. {p.taglia}</span>
            <span style={s.tag(C.muted)}>{p.colore}</span>
            <span style={s.tag(C.muted)}>{p.categoria}</span>
            <span style={{ ...s.tag(C.gold), marginLeft: "auto" }}>{fmt(p.prezzoVendita)}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{ flex: 1, background: C.green + "22", color: C.green, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => { setProducts(ps => ps.map(q => q.id === p.id ? { ...q, stock: q.stock + 1 } : q)); showToast(`+1 ${p.nome}`, "ok"); }}>+ Entrata</button>
            <button style={{ flex: 1, background: C.red + "22", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => { if (p.stock > 0) { setProducts(ps => ps.map(q => q.id === p.id ? { ...q, stock: q.stock - 1 } : q)); showToast(`-1 ${p.nome}`, "ok"); } }}>− Uscita</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarcodeScanner({ onDetect, onClose, s, C }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState("init"); // init | scanning | unsupported | denied | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!("BarcodeDetector" in window)) {
        setStatus("unsupported");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("scanning");

        const detector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              const value = codes[0].rawValue;
              if (value) {
                onDetect(value);
                return;
              }
            }
          } catch (e) {
            // frame non leggibile, si riprova al prossimo tick
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (cancelled) return;
        if (e && (e.name === "NotAllowedError" || e.name === "PermissionDeniedError")) {
          setStatus("denied");
        } else {
          setErrorMsg(e?.message || "Errore fotocamera");
          setStatus("error");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [onDetect]);

  const overlay = {
    wrap: { position: "fixed", inset: 0, background: "#000", zIndex: 1000, display: "flex", flexDirection: "column" },
    videoBox: { position: "relative", flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
    video: { width: "100%", height: "100%", objectFit: "cover" },
    frame: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "78%", maxWidth: 340, height: 140, border: `2px solid ${C.gold}`, borderRadius: 14, boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px", background: "#000" },
    title: { color: C.white, fontSize: 14, fontWeight: 700, letterSpacing: 1 },
    closeBtn: { background: C.card, border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    hint: { color: C.muted, fontSize: 12, textAlign: "center", padding: "14px 24px 28px" },
    centerMsg: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 14, textAlign: "center" },
  };

  return (
    <div style={overlay.wrap}>
      <div style={overlay.topBar}>
        <span style={overlay.title}>SCANSIONA CODICE A BARRE</span>
        <button style={overlay.closeBtn} onClick={onClose}>✕ Chiudi</button>
      </div>

      {status === "scanning" && (
        <>
          <div style={overlay.videoBox}>
            <video ref={videoRef} style={overlay.video} playsInline muted autoPlay />
            <div style={overlay.frame} />
          </div>
          <div style={overlay.hint}>Inquadra il codice a barre dentro il riquadro. La lettura è automatica.</div>
        </>
      )}

      {status === "init" && (
        <div style={overlay.centerMsg}>
          <div style={{ color: C.muted, fontSize: 14 }}>Attivazione fotocamera...</div>
        </div>
      )}

      {status === "unsupported" && (
        <div style={overlay.centerMsg}>
          <div style={{ fontSize: 32 }}>📷</div>
          <div style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>Scansione non supportata su questo browser</div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
            Su iPhone usa Safari aggiornato, oppure su Android usa Chrome.
            In alternativa puoi digitare il codice a mano.
          </div>
          <button style={{ ...s.btn(C.gold), marginTop: 8, width: 200 }} onClick={onClose}>Inserisci a mano</button>
        </div>
      )}

      {status === "denied" && (
        <div style={overlay.centerMsg}>
          <div style={{ fontSize: 32 }}>🔒</div>
          <div style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>Permesso fotocamera negato</div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
            Vai nelle impostazioni del browser e consenti l'accesso alla fotocamera per questo sito, poi riprova.
          </div>
          <button style={{ ...s.btn(C.gold), marginTop: 8, width: 200 }} onClick={onClose}>Inserisci a mano</button>
        </div>
      )}

      {status === "error" && (
        <div style={overlay.centerMsg}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>Errore fotocamera</div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{errorMsg}</div>
          <button style={{ ...s.btn(C.gold), marginTop: 8, width: 200 }} onClick={onClose}>Inserisci a mano</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("client");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [vendite, setVendite] = useState(initialVendite);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [scanMode, setScanMode] = useState(null);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [cameraOpenFor, setCameraOpenFor] = useState(null); // "vendita" | "entrata" | "nuovoProdotto" | null
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ barcode: "", nome: "", taglia: "", colore: "", categoria: "Abiti", prezzoVendita: "" });
  const [filterCat, setFilterCat] = useState("Tutti");
  const [searchMag, setSearchMag] = useState("");
  const [toast, setToast] = useState(null);
  const scanRef = useRef();

  const showToast = useCallback((msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (scanMode && scanRef.current) scanRef.current.focus();
  }, [scanMode]);

  const meseCorrente = new Date().toISOString().slice(0, 7);
  const venditeConMese = vendite.filter(v => v.data.startsWith(meseCorrente));
  const fatturatoCorriente = vendite.reduce((s, v) => s + v.prezzo, 0);
  const fatturatoMese = venditeConMese.reduce((s, v) => s + v.prezzo, 0);
  const provvMese = calcolaProvvigione(fatturatoMese);
  const provvTotale = calcolaProvvigione(fatturatoCorriente);
  const guadagnoEffe = provvTotale.totale;
  const guadagnoEffeMese = provvMese.totale;
  const aliquotaAttuale = aliquotaMarginale(fatturatoMese);
  const totaleStock = products.reduce((s, p) => s + p.stock, 0);
  const valoreMagazzino = products.reduce((s, p) => s + p.stock * p.prezzoVendita, 0);
  const categorie = ["Tutti", ...new Set(products.map(p => p.categoria))];

  const handleLogin = () => {
    if (loginUser.trim() === ADMIN_USER && loginPass.trim() === ADMIN_PASS) {
      setIsAdminAuth(true);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
      setView("admin");
    } else {
      setLoginError("Nome utente o password non corretti.");
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    setView("client");
  };

  const handleViewSwitch = (v) => {
    if (v === "admin" && !isAdminAuth) {
      setView("login");
    } else {
      setView(v);
    }
  };

  const handleScan = () => {
    const code = scanInput.trim();
    setScanInput("");
    if (!code) return;
    const prod = products.find(p => p.barcode === code || p.id === code);
    if (!prod) {
      setScanError("Codice non trovato. Verifica o aggiungi il prodotto.");
      setScanResult(null);
      return;
    }
    setScanError("");
    setScanResult(prod);
  };

  const cercaProdottoDaCodice = useCallback((code) => {
    const prod = products.find(p => p.barcode === code || p.id === code);
    if (!prod) {
      setScanError("Codice non trovato. Verifica o aggiungi il prodotto.");
      setScanResult(null);
      return;
    }
    setScanError("");
    setScanResult(prod);
  }, [products]);

  const handleCameraDetect = useCallback((code) => {
    if (cameraOpenFor === "nuovoProdotto") {
      setNewProduct(p => ({ ...p, barcode: code }));
      setCameraOpenFor(null);
      showToast("Codice acquisito", "ok");
      return;
    }
    // vendita o entrata: popola il campo e cerca subito il prodotto
    setScanInput(code);
    setCameraOpenFor(null);
    cercaProdottoDaCodice(code);
  }, [cameraOpenFor, cercaProdottoDaCodice, showToast]);

  const handleVendita = (prod) => {
    if (prod.stock < 1) { showToast("Stock esaurito!", "err"); return; }
    const nuovaVendita = {
      id: "v" + Date.now(),
      prodottoId: prod.id,
      nome: prod.nome,
      taglia: prod.taglia,
      prezzo: prod.prezzoVendita,
      data: new Date().toISOString().slice(0, 10),
      ora: new Date().toTimeString().slice(0, 5),
    };
    setVendite(v => [nuovaVendita, ...v]);
    setProducts(ps => ps.map(p => p.id === prod.id ? { ...p, stock: p.stock - 1 } : p));
    setScanResult(null);
    setScanMode(null);
    showToast(`Vendita registrata: ${prod.nome} — ${fmt(prod.prezzoVendita)}`, "ok");
  };

  const handleEntrata = (prod) => {
    setProducts(ps => ps.map(p => p.id === prod.id ? { ...p, stock: p.stock + 1 } : p));
    setScanResult(null);
    setScanMode(null);
    showToast(`Entrata registrata: ${prod.nome}`, "ok");
  };

  const handleAddProduct = () => {
    if (!newProduct.barcode || !newProduct.nome || !newProduct.prezzoVendita) {
      showToast("Compila tutti i campi obbligatori", "err"); return;
    }
    const id = "P" + Date.now().toString().slice(-4);
    setProducts(ps => [...ps, { ...newProduct, id, prezzoVendita: parseFloat(newProduct.prezzoVendita), stock: 0 }]);
    setNewProduct({ barcode: "", nome: "", taglia: "", colore: "", categoria: "Abiti", prezzoVendita: "" });
    setShowAddProduct(false);
    showToast("Prodotto aggiunto al magazzino", "ok");
  };

  const prodottiFiltrati = products.filter(p =>
    (filterCat === "Tutti" || p.categoria === filterCat) &&
    (p.nome.toLowerCase().includes(searchMag.toLowerCase()) || p.barcode.includes(searchMag))
  );

  const s = {
    app: { minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 80 },
    header: { background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 },
    logo: { color: C.gold, fontWeight: 700, fontSize: 15, letterSpacing: 2 },
    viewToggle: { display: "flex", background: C.card, borderRadius: 8, padding: 3, gap: 2 },
    vtBtn: (active) => ({ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? C.gold : "transparent", color: active ? C.bg : C.muted, transition: "all .2s" }),
    container: { maxWidth: 480, margin: "0 auto", padding: "0 16px" },
    section: { paddingTop: 20 },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 },
    cardGold: { background: `linear-gradient(135deg, #1E1800 0%, #2A2000 100%)`, border: `1px solid ${C.gold}`, borderRadius: 14, padding: 18, marginBottom: 14 },
    label: { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, fontWeight: 600 },
    bigNum: { fontSize: 36, fontWeight: 700, color: C.gold, lineHeight: 1 },
    bigNumWhite: { fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1 },
    subNum: { fontSize: 12, color: C.muted, marginTop: 4 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 },
    statCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 },
    btn: (color = C.gold) => ({ background: color, color: color === C.gold ? C.bg : C.white, border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }),
    btnOutline: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 10 },
    input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", fontSize: 15, color: C.white, width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "monospace" },
    inputNormal: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", fontSize: 14, color: C.white, width: "100%", boxSizing: "border-box", outline: "none", marginBottom: 10 },
    select: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 14, color: C.white, width: "100%", boxSizing: "border-box", outline: "none", marginBottom: 10 },
    tag: (c = C.gold) => ({ display: "inline-block", background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }),
    prodRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.border}` },
    tabBar: { display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 20, gap: 0, overflowX: "auto" },
    tab: (active) => ({ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: active ? C.gold : C.muted, border: "none", background: "transparent", cursor: "pointer", borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent", whiteSpace: "nowrap", letterSpacing: 1 }),
    saleRow: { padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    errorBox: { background: "#3D0A0A", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "12px 16px", color: C.red, fontSize: 13, marginBottom: 12 },
    successBox: { background: "#0A3D1A", border: `1px solid ${C.green}44`, borderRadius: 10, padding: "12px 16px", color: C.green, fontSize: 13, marginBottom: 12 },
    toastStyle: (tipo) => ({ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: tipo === "ok" ? "#0A3D1A" : "#3D0A0A", border: `1px solid ${tipo === "ok" ? C.green : C.red}66`, color: tipo === "ok" ? C.green : C.red, borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap", maxWidth: "90vw", textAlign: "center" }),
    loginWrap: { minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
    loginCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 360 },
    logoutBtn: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  };

  const ClientView = () => (
    <div style={s.container}>
      <div style={s.section}>
        <div style={{ ...s.cardGold, textAlign: "center" }}>
          <div style={s.label}>Magazzino outlet</div>
          <div style={s.bigNum}>{fmtN(totaleStock)}</div>
          <div style={s.subNum}>capi disponibili</div>
        </div>

        {!scanMode && (
          <>
            <button style={s.btn(C.gold)} onClick={() => { setScanMode("uscita"); setScanResult(null); setScanError(""); }}>
              <span style={{ fontSize: 20 }}>📦</span> Registra vendita
            </button>
            <button style={s.btn(C.blue)} onClick={() => { setScanMode("entrata"); setScanResult(null); setScanError(""); }}>
              <span style={{ fontSize: 20 }}>📥</span> Registra entrata merce
            </button>
          </>
        )}

        {scanMode && (
          <ScanPanel
            mode={scanMode} s={s} C={C} fmt={fmt}
            scanRef={scanRef} scanInput={scanInput} setScanInput={setScanInput}
            handleScan={handleScan} scanError={scanError} scanResult={scanResult}
            setScanMode={setScanMode} setScanResult={setScanResult} setScanError={setScanError}
            handleVendita={handleVendita} handleEntrata={handleEntrata}
            onOpenCamera={() => setCameraOpenFor(scanMode === "uscita" ? "vendita" : "entrata")}
          />
        )}

        <div style={{ ...s.card, marginTop: 10 }}>
          <div style={s.label}>Ultime vendite registrate</div>
          {vendite.slice(0, 5).map(v => (
            <div key={v.id} style={s.saleRow}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v.nome}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Taglia {v.taglia} · {v.data} ore {v.ora}</div>
              </div>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 15 }}>{fmt(v.prezzo)}</div>
            </div>
          ))}
          {vendite.length === 0 && <div style={{ color: C.muted, fontSize: 13, paddingTop: 10 }}>Nessuna vendita ancora registrata.</div>}
        </div>

        <div style={s.card}>
          <div style={s.label}>Capi in magazzino</div>
          {products.filter(p => p.stock > 0).map(p => (
            <div key={p.id} style={s.prodRow}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Taglia {p.taglia} · {p.colore}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={s.tag(p.stock <= 1 ? C.red : C.green)}>{p.stock} pz</span>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{fmt(p.prezzoVendita)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AdminDashboard = () => {
    const byCategory = products.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + p.stock;
      return acc;
    }, {});
    const topVenduti = [...products].sort((a, b) => {
      const va = vendite.filter(v => v.prodottoId === a.id).length;
      const vb = vendite.filter(v => v.prodottoId === b.id).length;
      return vb - va;
    }).slice(0, 3);

    return (
      <div>
        <div style={s.cardGold}>
          <div style={s.label}>Fatturato totale</div>
          <div style={s.bigNum}>{fmt(fatturatoCorriente)}</div>
          <div style={s.subNum}>{vendite.length} vendite totali</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.gold}33` }}>
            <div style={s.label}>Provvigione totale Effe</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.goldLight }}>{fmt(guadagnoEffe)}</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={s.label}>Scaglioni provvigione — mese corrente</div>
            <span style={s.tag(C.gold)}>{aliquotaAttuale}% aliquota attuale</span>
          </div>
          {SCAGLIONI.map((sc, i) => {
            const fatto = fatturatoMese > sc.da;
            const fine = sc.a === Infinity ? "∞" : fmt(sc.a);
            const quotaInFascia = provvMese.dettaglio.find(d => d.da === sc.da);
            return (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < SCAGLIONI.length - 1 ? `1px solid ${C.border}` : "none", opacity: fatto ? 1 : 0.4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(sc.da)} – {fine}</div>
                  <span style={s.tag(fatto ? C.green : C.muted)}>{sc.perc}%</span>
                </div>
                {quotaInFascia && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    Quota in fascia: {fmt(quotaInFascia.quota)} → provvigione {fmt(quotaInFascia.provvigioneFascia)}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Provvigione mese corrente</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{fmt(guadagnoEffeMese)}</span>
          </div>
        </div>

        <div style={s.grid2}>
          <div style={s.statCard}>
            <div style={s.label}>Questo mese</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{fmt(fatturatoMese)}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{venditeConMese.length} vendite</div>
          </div>
          <div style={s.statCard}>
            <div style={s.label}>Quota Effe — mese</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.gold }}>{fmt(guadagnoEffeMese)}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>aliquota {aliquotaAttuale}%</div>
          </div>
          <div style={s.statCard}>
            <div style={s.label}>Capi in stock</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{fmtN(totaleStock)}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>pezzi disponibili</div>
          </div>
          <div style={s.statCard}>
            <div style={s.label}>Valore magazzino</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{fmt(valoreMagazzino)}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>a prezzo di vendita</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.label}>Stock per categoria</div>
          {Object.entries(byCategory).map(([cat, qty]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14 }}>{cat}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(qty / totaleStock) * 100}%`, height: "100%", background: C.gold, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 13, color: C.muted, minWidth: 30, textAlign: "right" }}>{qty} pz</span>
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.label}>Più venduti</div>
          {topVenduti.map((p, i) => {
            const numVendite = vendite.filter(v => v.prodottoId === p.id).length;
            return (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: C.gold, fontWeight: 700, fontSize: 18, minWidth: 20 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>Taglia {p.taglia}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>{numVendite} vendite</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{fmt(numVendite * p.prezzoVendita)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={s.label}>Capi con stock basso</div>
            <span style={s.tag(C.red)}>ATTENZIONE</span>
          </div>
          {products.filter(p => p.stock <= 1).map(p => (
            <div key={p.id} style={{ ...s.prodRow }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: C.muted }}>T.{p.taglia} · {p.colore}</div>
              </div>
              <span style={s.tag(p.stock === 0 ? "#555" : C.red)}>{p.stock === 0 ? "ESAURITO" : `${p.stock} rimasto`}</span>
            </div>
          ))}
          {products.filter(p => p.stock <= 1).length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Nessun capo in esaurimento.</div>}
        </div>
      </div>
    );
  };

  const AdminVendite = () => {
    const venditeOrdinate = [...vendite].sort((a, b) => b.data.localeCompare(a.data) || b.ora.localeCompare(a.ora));
    const meseTotali = {};
    vendite.forEach(v => {
      const m = v.data.slice(0, 7);
      meseTotali[m] = (meseTotali[m] || 0) + v.prezzo;
    });

    return (
      <div>
        <div style={s.card}>
          <div style={s.label}>Riepilogo per mese</div>
          {Object.entries(meseTotali).sort((a, b) => b[0].localeCompare(a[0])).map(([mese, tot]) => {
            const prov = calcolaProvvigione(tot);
            return (
              <div key={mese} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(mese + "-01").toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{vendite.filter(v => v.data.startsWith(mese)).length} vendite · quota Effe: {fmt(prov.totale)}</div>
                </div>
                <div style={{ color: C.gold, fontWeight: 700 }}>{fmt(tot)}</div>
              </div>
            );
          })}
        </div>

        <div style={s.card}>
          <div style={s.label}>Storico vendite</div>
          {venditeOrdinate.map(v => (
            <div key={v.id} style={s.saleRow}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v.nome}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>T.{v.taglia} · {v.data} ore {v.ora}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.gold, fontWeight: 700 }}>{fmt(v.prezzo)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AdminView = () => (
    <div style={s.container}>
      <div style={s.section}>
        <div style={s.tabBar}>
          {[["dashboard", "Dashboard"], ["magazzino", "Magazzino"], ["vendite", "Vendite"]].map(([k, label]) => (
            <button key={k} style={s.tab(adminTab === k)} onClick={() => setAdminTab(k)}>{label}</button>
          ))}
        </div>
        {adminTab === "dashboard" && <AdminDashboard />}
        {adminTab === "magazzino" && (
          <AdminMagazzino
            s={s} C={C} fmt={fmt}
            searchMag={searchMag} setSearchMag={setSearchMag}
            filterCat={filterCat} setFilterCat={setFilterCat}
            categorie={categorie}
            showAddProduct={showAddProduct} setShowAddProduct={setShowAddProduct}
            newProduct={newProduct} setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct} prodottiFiltrati={prodottiFiltrati}
            setProducts={setProducts} showToast={showToast}
            onOpenCamera={() => setCameraOpenFor("nuovoProdotto")}
          />
        )}
        {adminTab === "vendite" && <AdminVendite />}
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.logo}>// EFFE · OUTLET</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAdminAuth && view === "admin" && (
            <button style={s.logoutBtn} onClick={handleLogout}>Esci</button>
          )}
          <div style={s.viewToggle}>
            <button style={s.vtBtn(view === "client")} onClick={() => handleViewSwitch("client")}>Cliente</button>
            <button style={s.vtBtn(view === "admin" || view === "login")} onClick={() => handleViewSwitch("admin")}>Effe</button>
          </div>
        </div>
      </div>

      {view === "client" && <ClientView />}
      {view === "login" && (
        <LoginScreen
          s={s} C={C}
          loginUser={loginUser} setLoginUser={setLoginUser}
          loginPass={loginPass} setLoginPass={setLoginPass}
          loginError={loginError} handleLogin={handleLogin}
          setView={setView}
        />
      )}
      {view === "admin" && (isAdminAuth ? <AdminView /> : (
        <LoginScreen
          s={s} C={C}
          loginUser={loginUser} setLoginUser={setLoginUser}
          loginPass={loginPass} setLoginPass={setLoginPass}
          loginError={loginError} handleLogin={handleLogin}
          setView={setView}
        />
      ))}

      {toast && <div style={s.toastStyle(toast.tipo)}>{toast.msg}</div>}

      {cameraOpenFor && (
        <BarcodeScanner
          s={s} C={C}
          onDetect={handleCameraDetect}
          onClose={() => setCameraOpenFor(null)}
        />
      )}
    </div>
  );
}

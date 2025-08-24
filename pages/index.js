import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const BASE_AMOUNT = 2000;
  const BASE_KWH = 13.3;
  const [sessions, setSessions] = useState([]);
  const [amount, setAmount] = useState(BASE_AMOUNT);
  const [currentKwh, setCurrentKwh] = useState(null);
  const [power, setPower] = useState(0.34);
  const [showTicketPanel, setShowTicketPanel] = useState(false);

  const formatTime = (sec) => {
    if (!isFinite(sec)) return '--:--:--';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (!s.running) return s;
        const newKwh = Math.max(0, s.kwhRemaining - power / 3600);
        return { ...s, kwhRemaining: newKwh, running: newKwh > 0, lastUpdate: new Date() };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [power]);

  const addTicket = () => {
    const computedKwh = currentKwh !== null ? currentKwh : (amount / BASE_AMOUNT) * BASE_KWH;
    const now = new Date();
    setSessions(prev => [...prev, { id: Date.now(), amountFcfa: amount, kwhStart: computedKwh, kwhRemaining: computedKwh, running: true, startTime: now, lastUpdate: now }]);
    setCurrentKwh(computedKwh);
  };

  const updateCurrentKwh = () => {
    if (currentKwh === null || sessions.length === 0) return;
    const now = new Date();
    setSessions(prev => prev.map((s, idx) => idx === prev.length - 1 ? { ...s, kwhRemaining: currentKwh, kwhStart: currentKwh, startTime: now, lastUpdate: now } : s));
  };

  const resetSessions = () => {
    setSessions([]);
    setCurrentKwh(null);
    setAmount(BASE_AMOUNT);
    setPower(0.34);
  };

  const totalKwh = sessions.reduce((a,s)=>a+(s.kwhStart||0),0);
  const remainingKwh = sessions.reduce((a,s)=>a+(s.kwhRemaining||0),0);
  const hoursLeft = remainingKwh / power;
  const daysLeft = hoursLeft / 24;

  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to right, #00c6ff, #0072ff)', minHeight: '100vh', color: '#fff' }}>
      <div className="text-center mb-5">
        <h1 style={{ fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>⚡ Suivi Électricité Temps Réel</h1>
        <p style={{ fontSize: '1.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Simulation sans capteur. Débit : <strong>{power.toFixed(2)} kW</strong></p>
      </div>
      <div className="row">
        <div className="col-12 col-md-4 mb-4">
          <button className="btn btn-secondary w-100 mb-3 d-md-none" onClick={() => setShowTicketPanel(!showTicketPanel)}>
            {showTicketPanel ? 'Masquer le ticket' : 'Afficher le ticket'}
          </button>
          <div style={{
              color: '#000',
              border: '2px solid #0072ff',
              overflow: 'hidden',
              maxHeight: showTicketPanel || window.innerWidth >= 768 ? '1000px' : '0',
              transition: 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out',
              opacity: showTicketPanel || window.innerWidth >= 768 ? 1 : 0,
              padding: showTicketPanel || window.innerWidth >= 768 ? '1.5rem' : '0',
              background: '#fff',
              borderRadius: '0.5rem'
            }}>
            <div className="mb-3">
              <label className="form-label fw-bold">Montant du ticket (FCFA)</label>
              <input type="number" className="form-control" value={amount} min={BASE_AMOUNT} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Dernier relevé kWh</label>
              <input type="number" className="form-control" value={currentKwh||''} min={0} step={0.01} onChange={e => setCurrentKwh(Number(e.target.value))} />
              <button className="btn btn-info mt-2 w-100" type="button" onClick={updateCurrentKwh}>Mettre à jour puissance réelle</button>
            </div>
            <button className="btn btn-primary w-100 mb-2" type="button" onClick={addTicket}>Ajouter un ticket</button>
            <button className="btn btn-danger w-100" type="button" onClick={resetSessions}>Réinitialiser</button>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="p-4 bg-white rounded shadow" style={{ color: '#000', border: '2px solid #0072ff' }}>
            <h3 className="mb-4" style={{ borderBottom: '2px solid #00c6ff', paddingBottom: '0.5rem', fontWeight: '700' }}>Vue d'ensemble</h3>
            <p>Total kWh: <strong>{totalKwh.toFixed(3)}</strong></p>
            <p>Restant kWh: <strong>{remainingKwh.toFixed(3)}</strong></p>
            <p>Solde approximatif: <strong>{(remainingKwh * (amount/currentKwh||1)).toFixed(0)} FCFA</strong></p>
            <p>Temps restant: <strong>{hoursLeft.toFixed(2)} heures (~{daysLeft.toFixed(2)} jours)</strong></p>
            <h4 className="mt-4 mb-3">Sessions actives</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {sessions.filter(s=>s.running).map(sess => {
                const secLeft = (sess.kwhRemaining||0)/power*3600;
                return <div key={sess.id} className="mb-2 p-2 rounded" style={{ background: '#e0f7fa', fontWeight: '500' }}>{sess.amountFcfa} FCFA — {sess.kwhRemaining.toFixed(3)} kWh — Temps restant: {formatTime(secLeft)}</div>
              })}
              {sessions.filter(s=>s.running).length === 0 && <p>Aucune session active pour le moment.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

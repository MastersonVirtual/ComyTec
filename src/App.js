import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCXTX7h33uCXK4K8FSSnD7PcoayjAGV9x4',
  authDomain: 'mastersonvirtual-c0742.firebaseapp.com',
  projectId: 'mastersonvirtual-c0742',
  storageBucket: 'mastersonvirtual-c0742.firebasestorage.app',
  messagingSenderId: '465591582078',
  appId: '1:465591582078:web:0a8b71792c842a67e5872f',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoServicio, setTipoServicio] = useState('Monitoreo');
  const [importe, setImporte] = useState('');
  const [servicios, setServicios] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'servicios'), orderBy('creadoEn', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServicios(lista);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cliente.trim() || !direccion.trim() || !importe) {
      alert('Completa todos los campos.');
      return;
    }

    try {
      setGuardando(true);

      await addDoc(collection(db, 'servicios'), {
        cliente: cliente.trim(),
        direccion: direccion.trim(),
        tipoServicio,
        importe: Number(importe),
        creadoEn: serverTimestamp(),
      });

      setCliente('');
      setDireccion('');
      setTipoServicio('Monitoreo');
      setImporte('');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar el servicio.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; background: #f6f7fb; }
        .contenedor { max-width: 980px; margin: 24px auto; padding: 0 16px; }
        .tarjeta {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 16px;
          margin-bottom: 16px;
        }
        h1, h2 { margin: 0 0 14px; color: #111827; }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(180px, 1fr));
          gap: 12px;
        }
        label { display: flex; flex-direction: column; gap: 6px; color: #374151; font-weight: 600; }
        input, select, button {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
        }
        button {
          cursor: pointer;
          background: #111827;
          color: #fff;
          border-color: #111827;
          font-weight: 700;
          grid-column: 1 / -1;
        }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
        .tabla-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        th { text-align: left; color: #111827; background: #f9fafb; }
        td.derecha, th.derecha { text-align: right; }
        .vacio { text-align: center; color: #6b7280; padding: 14px; }
        @media (max-width: 700px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="contenedor">
        <section className="tarjeta">
          <h1>MastersonVirtual - Gestión de Servicios</h1>

          <form className="grid" onSubmit={handleSubmit}>
            <label>
              Cliente
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </label>

            <label>
              Dirección
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección"
              />
            </label>

            <label>
              Tipo de Servicio
              <select value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)}>
                <option value="Monitoreo">Monitoreo</option>
                <option value="CCTV">CCTV</option>
              </select>
            </label>

            <label>
              Importe
              <input
                type="number"
                min="0"
                step="0.01"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                placeholder="0"
              />
            </label>

            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar servicio'}
            </button>
          </form>
        </section>

        <section className="tarjeta">
          <h2>Registros en tiempo real</h2>
          <div className="tabla-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Tipo</th>
                  <th className="derecha">Importe</th>
                </tr>
              </thead>
              <tbody>
                {servicios.length === 0 ? (
                  <tr>
                    <td className="vacio" colSpan="4">
                      Sin registros aún.
                    </td>
                  </tr>
                ) : (
                  servicios.map((servicio) => (
                    <tr key={servicio.id}>
                      <td>{servicio.cliente}</td>
                      <td>{servicio.direccion}</td>
                      <td>{servicio.tipoServicio}</td>
                      <td className="derecha">
                        {Number(servicio.importe || 0).toLocaleString('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;

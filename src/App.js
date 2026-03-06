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
  const [formData, setFormData] = useState({
    cliente: '',
    direccion: '',
    tipoServicio: 'Monitoreo',
    importe: '',
  });

  const [servicios, setServicios] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const serviciosRef = collection(db, 'servicios');
    const serviciosQuery = query(serviciosRef, orderBy('creadoEn', 'desc'));

    const unsubscribe = onSnapshot(serviciosQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setServicios(data);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cliente.trim() || !formData.direccion.trim() || !formData.importe) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }

    try {
      setGuardando(true);
      await addDoc(collection(db, 'servicios'), {
        cliente: formData.cliente.trim(),
        direccion: formData.direccion.trim(),
        tipoServicio: formData.tipoServicio,
        importe: Number(formData.importe),
        creadoEn: serverTimestamp(),
      });

      setFormData({
        cliente: '',
        direccion: '',
        tipoServicio: 'Monitoreo',
        importe: '',
      });
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      alert('No se pudo guardar el servicio. Revisa la consola para más detalles.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>MastersonVirtual - Servicios</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
          padding: 16,
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Cliente
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            placeholder="Nombre del cliente"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Dirección
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección del servicio"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Tipo de Servicio
          <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
            <option value="Monitoreo">Monitoreo</option>
            <option value="CCTV">CCTV</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          Importe
          <input
            type="number"
            name="importe"
            value={formData.importe}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </label>

        <button type="submit" disabled={guardando} style={{ gridColumn: '1 / -1', padding: '10px 14px' }}>
          {guardando ? 'Guardando...' : 'Guardar servicio'}
        </button>
      </form>

      <h2>Registros en tiempo real</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Cliente</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Dirección</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Tipo</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'right', padding: 8 }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                  Sin registros aún.
                </td>
              </tr>
            ) : (
              servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{servicio.cliente}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{servicio.direccion}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{servicio.tipoServicio}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>
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
    </main>
  );
}

export default App;

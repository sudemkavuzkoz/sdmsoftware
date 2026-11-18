'use client';

import React, { useState } from 'react';
import {
  Activity,
  PawPrint,
  Plus,
  ExternalLink,
  Check,
  XCircle,
  FileText
} from 'lucide-react';
import { VET_STATUS_COLOR } from '@/lib/demoSimulations';

export function DentalClinicApp() {
  const [clinicDoctor, setClinicDoctor] = useState('Dr. Selin Yılmaz (Dahiliye & Kardiyoloji)');
  const [clinicTime, setClinicTime] = useState('11:30');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+90 532 ');
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Selin Yılmaz', patient: 'Ahmet Karaca', time: '09:30', status: 'Onaylandı', color: 'var(--accent-emerald)' },
    { id: 2, doctor: 'Dt. Caner Eren', patient: 'Merve Tan', time: '10:15', status: 'Muayenede', color: 'var(--primary)' },
    { id: 3, doctor: 'Dr. Meltem Akın', patient: 'Burak Demir', time: '14:00', status: 'Beklemede', color: 'var(--accent-amber)' }
  ]);
  const [smsAlert, setSmsAlert] = useState<string | null>(null);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    const docName = clinicDoctor.split('(')[0].trim();
    setAppointments((prev) => [
      { id: Date.now(), doctor: docName, patient: patientName.trim(), time: clinicTime, status: 'Onaylandı', color: 'var(--accent-emerald)' },
      ...prev
    ]);
    setSmsAlert(`Sayın ${patientName.trim()}, ${docName} için saat ${clinicTime} randevunuz oluşturulmuştur. ✓ SMS bildirimi gönderildi.`);
    setPatientName('');
    setTimeout(() => setSmsAlert(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={19} color="var(--primary)" />
            SDM Klinik — Canlı Randevu &amp; SMS Otomasyon Paneli
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hekim seçin, yeni hasta randevusu oluşturun ve otomatik SMS onay akışını test edin.
          </p>
        </div>
        <a
          href="https://github.com/sudemkavuzkoz/Dental-Clinik"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.74rem' }}
        >
          <ExternalLink size={12} /> GitHub (Dental-Clinik)
        </a>
      </div>

      {smsAlert && (
        <div style={{ background: 'rgba(16, 185, 129, 0.14)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
          📱 {smsAlert}
        </div>
      )}

      <form onSubmit={handleCreateAppointment} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <label className="form-label">Hasta Adı Soyadı</label>
            <input type="text" required placeholder="örn: Zeynep Kaya" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Telefon</label>
            <input type="text" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Hekim &amp; Poliklinik</label>
            <select value={clinicDoctor} onChange={(e) => setClinicDoctor(e.target.value)} className="form-select">
              <option>Dr. Selin Yılmaz (Dahiliye &amp; Kardiyoloji)</option>
              <option>Dt. Caner Eren (Diş Hekimi)</option>
              <option>Dr. Meltem Akın (Dermatoloji)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Saat</label>
            <select value={clinicTime} onChange={(e) => setClinicTime(e.target.value)} className="form-select">
              {['09:00', '10:30', '11:30', '13:30', '15:00', '16:30'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
          <Plus size={14} /> Randevuyu Kaydet ve SMS Gönder
        </button>
      </form>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 700 }}>
          Günün Randevu Takvimi
        </div>
        {appointments.map((apt) => (
          <div key={apt.id} style={{ display: 'grid', gridTemplateColumns: '65px 1.2fr 1fr 110px', gap: '0.5rem', alignItems: 'center', padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{apt.time}</span>
            <strong style={{ color: 'var(--text-main)' }}>{apt.patient}</strong>
            <span style={{ color: 'var(--text-muted)' }}>{apt.doctor}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: apt.color, textAlign: 'right' }}>{apt.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VetAppointment {
  id: number;
  petName: string;
  ownerName: string;
  petType: string;
  doctor: string;
  time: string;
  status: 'Beklemede' | 'Onaylandı' | 'Muayenede' | 'Tamamlandı' | 'İptal Edildi';
  medicalNote?: string;
}

export function VeterinerClinicApp() {
  const [vetPetName, setVetPetName] = useState('');
  const [vetOwnerName, setVetOwnerName] = useState('');
  const [vetPetType, setVetPetType] = useState('Köpek');
  const [vetDoctor, setVetDoctor] = useState('Dr. Elif Arslan (Genel Cerrahi)');
  const [vetTime, setVetTime] = useState('10:00');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const [vetAppointments, setVetAppointments] = useState<VetAppointment[]>([
    { id: 1, petName: 'Boncuk', ownerName: 'Ayşe Demir', petType: 'Kedi', doctor: 'Dr. Elif Arslan', time: '09:00', status: 'Muayenede', medicalNote: 'Genel aşı kontrolü yapılıyor.' },
    { id: 2, petName: 'Max', ownerName: 'Kemal Öz', petType: 'Köpek', doctor: 'Dr. Can Yılmaz', time: '10:30', status: 'Beklemede' },
    { id: 3, petName: 'Pamuk', ownerName: 'Zeynep Kaya', petType: 'Tavşan', doctor: 'Dr. Elif Arslan', time: '11:15', status: 'Tamamlandı', medicalNote: 'Diş ve tırnak bakımı tamamlandı, 6 ay sonra kontrol.' }
  ]);
  const [vetAlert, setVetAlert] = useState<string | null>(null);

  const handleCreateVetAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetPetName.trim() || !vetOwnerName.trim()) return;
    setVetAppointments((prev) => [
      {
        id: Date.now(),
        petName: vetPetName.trim(),
        ownerName: vetOwnerName.trim(),
        petType: vetPetType,
        doctor: vetDoctor.split('(')[0].trim(),
        time: vetTime,
        status: 'Beklemede'
      },
      ...prev
    ]);
    setVetAlert(`${vetOwnerName.trim()} — ${vetPetName.trim()} (${vetPetType}) için saat ${vetTime} randevusu oluşturuldu. Hekim onayı bekleniyor.`);
    setVetPetName('');
    setVetOwnerName('');
    setTimeout(() => setVetAlert(null), 5000);
  };

  const updateStatus = (id: number, status: VetAppointment['status']) => {
    setVetAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const saveMedicalNote = (id: number) => {
    setVetAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, medicalNote: noteDraft.trim(), status: 'Tamamlandı' } : a))
    );
    setEditingNoteId(null);
    setNoteDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PawPrint size={19} color="var(--primary)" />
            Veteriner Klinik — Randevu, Onay/İptal &amp; Muayene Notu Paneli
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hayvan sahibi randevusu oluşturun; veteriner hekim olarak onaylayın, iptal edin veya muayene sonrası tıbbi not ekleyin.
          </p>
        </div>
        <a
          href="https://github.com/sudemkavuzkoz/Veteriner-Klinik-Sistemi"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.74rem' }}
        >
          <ExternalLink size={12} /> GitHub (Veteriner-Klinik)
        </a>
      </div>

      {vetAlert && (
        <div style={{ background: 'rgba(16, 185, 129, 0.14)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
          🐾 {vetAlert}
        </div>
      )}

      <form onSubmit={handleCreateVetAppointment} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <label className="form-label">Pet Adı</label>
            <input type="text" required placeholder="örn: Zeytin" value={vetPetName} onChange={(e) => setVetPetName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Pet Sahibi</label>
            <input type="text" required placeholder="örn: Ali Can" value={vetOwnerName} onChange={(e) => setVetOwnerName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Tür</label>
            <select value={vetPetType} onChange={(e) => setVetPetType(e.target.value)} className="form-select">
              <option>Köpek</option>
              <option>Kedi</option>
              <option>Kuş</option>
              <option>Tavşan</option>
              <option>Hamster</option>
            </select>
          </div>
          <div>
            <label className="form-label">Veteriner Hekim</label>
            <select value={vetDoctor} onChange={(e) => setVetDoctor(e.target.value)} className="form-select">
              <option>Dr. Elif Arslan (Genel Cerrahi)</option>
              <option>Dr. Can Yılmaz (İç Hastalıkları)</option>
              <option>Dr. Deniz Öztürk (Dermatoloji)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Saat</label>
            <select value={vetTime} onChange={(e) => setVetTime(e.target.value)} className="form-select">
              {['09:00', '10:00', '11:30', '13:30', '15:00', '16:30'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
          <Plus size={14} /> Randevu Talebi Oluştur
        </button>
      </form>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 700 }}>
          Veteriner Hekim Paneli — Randevular &amp; Muayene Notları
        </div>
        {vetAppointments.map((a) => {
          const color = a.status === 'İptal Edildi' ? 'var(--accent-rose)' : VET_STATUS_COLOR[a.status] || 'var(--primary)';
          return (
            <div key={a.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{a.time}</span>
                  <span>
                    <strong>{a.petName}</strong> <span style={{ color: 'var(--text-dim)' }}>({a.petType})</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>Sahip: {a.ownerName}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>• {a.doctor}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.18rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: `color-mix(in srgb, ${color} 14%, transparent)`,
                      color,
                      border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`
                    }}
                  >
                    {a.status}
                  </span>

                  {a.status === 'Beklemede' && (
                    <>
                      <button type="button" onClick={() => updateStatus(a.id, 'Onaylandı')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.68rem', padding: '0.22rem 0.55rem', color: 'var(--accent-emerald)' }}>
                        <Check size={12} /> Onayla
                      </button>
                      <button type="button" onClick={() => updateStatus(a.id, 'İptal Edildi')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.68rem', padding: '0.22rem 0.55rem', color: 'var(--accent-rose)' }}>
                        <XCircle size={12} /> İptal
                      </button>
                    </>
                  )}
                  {(a.status === 'Onaylandı' || a.status === 'Muayenede') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (a.status === 'Onaylandı') {
                          updateStatus(a.id, 'Muayenede');
                        } else {
                          setEditingNoteId(a.id);
                          setNoteDraft(a.medicalNote || '');
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.68rem', padding: '0.22rem 0.55rem' }}
                    >
                      <FileText size={12} /> {a.status === 'Onaylandı' ? 'Muayeneye Al' : 'Muayene Notu & Tamamla'}
                    </button>
                  )}
                  {a.status === 'Tamamlandı' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(a.id);
                        setNoteDraft(a.medicalNote || '');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.68rem', padding: '0.22rem 0.55rem' }}
                    >
                      <FileText size={12} /> Notu Düzenle
                    </button>
                  )}
                </div>
              </div>

              {a.medicalNote && editingNoteId !== a.id && (
                <div style={{ marginTop: '0.45rem', padding: '0.45rem 0.7rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '2px solid var(--accent-emerald)', fontSize: '0.76rem', color: '#cbd5e1' }}>
                  <strong>Muayene Notu:</strong> {a.medicalNote}
                </div>
              )}

              {editingNoteId === a.id && (
                <div style={{ marginTop: '0.55rem', display: 'flex', gap: '0.45rem' }}>
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Teşhis, tedavi ve reçete muayene notunu yazın..."
                    className="form-input"
                    style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}
                  />
                  <button type="button" onClick={() => saveMedicalNote(a.id)} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                    Kaydet
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

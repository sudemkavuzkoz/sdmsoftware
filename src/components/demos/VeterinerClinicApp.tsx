'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  FlaskConical,
  HeartPulse,
  Microchip,
  PawPrint,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  UserCheck,
  XCircle
} from 'lucide-react';
import { VET_STATUS_COLOR } from '@/lib/demoSimulations';

type VetRole = 'vet' | 'owner';
type VetTab = 'triage' | 'vaccines' | 'inpatient' | 'billing';
type VetStatus = 'Beklemede' | 'Onaylandı' | 'Muayenede' | 'Tamamlandı' | 'İptal Edildi';

interface VaccineRecord {
  id: number;
  name: string;
  dueDate: string;
  status: 'Güncel' | 'Yaklaşıyor' | 'Gecikmiş';
  lastApplied?: string;
}

interface LabMarker {
  code: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

interface VetBillingItem {
  id: number;
  title: string;
  amount: number;
  paid: boolean;
}

interface VetAppointment {
  id: number;
  petName: string;
  species: 'Kedi' | 'Köpek' | 'Tavşan' | 'Kuş' | 'Hamster';
  breed: string;
  ageText: string;
  weightKg: number;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  doctor: string;
  time: string;
  reason: string;
  status: VetStatus;
  allergyWarning?: string;
  vitals: { tempC: string; heartRate: number; respRate: number };
  diagnosis: string;
  medicalNote: string;
  vaccines: VaccineRecord[];
  labResults: LabMarker[];
  billing: VetBillingItem[];
}

interface ObservationCage {
  cageNo: string;
  petName: string;
  species: string;
  condition: string;
  fluidRate: string;
  nextMedTime: string;
  medDone: boolean;
}

const VET_DOCTORS = [
  'Dr. Elif Arslan (Genel Cerrahi)',
  'Dr. Can Yılmaz (İç Hastalıkları)',
  'Dr. Deniz Öztürk (Dermatoloji & Egzotik)'
];

const VET_TIME_SLOTS = ['09:00', '10:00', '11:15', '13:30', '15:00', '16:30'];

const SPECIES_EMOJI: Record<VetAppointment['species'], string> = {
  Kedi: '🐱',
  Köpek: '🐶',
  Tavşan: '🐰',
  Kuş: '🦜',
  Hamster: '🐹'
};

const INITIAL_VET_PATIENTS: VetAppointment[] = [
  {
    id: 1,
    petName: 'Boncuk',
    species: 'Kedi',
    breed: 'British Shorthair',
    ageText: '3 Yaş',
    weightKg: 4.3,
    microchip: 'TR-900118002491032',
    ownerName: 'Ayşe Demir',
    ownerPhone: '+90 532 640 19 88',
    doctor: 'Dr. Elif Arslan',
    time: '09:00',
    reason: 'Yıllık karma aşı kontrolü ve iştahsızlık şikayeti',
    status: 'Muayenede',
    allergyWarning: 'Sülfonamid grubu antibiyotik hassasiyeti',
    vitals: { tempC: '38.7', heartRate: 142, respRate: 28 },
    diagnosis: 'Hafif Üst Solunum Yolu İrritasyonu — Genel Durum İyi',
    medicalNote: 'Genel aşı kontrolü tamamlandı; bağışıklık destek şurubu başlandı, 7 gün sonra kontrol.',
    vaccines: [
      { id: 101, name: 'Kuduz Aşısı (Rabies)', dueDate: '2026-11-28', status: 'Yaklaşıyor', lastApplied: '2025-11-28' },
      { id: 102, name: 'Karma (FVRCP)', dueDate: '2027-04-12', status: 'Güncel', lastApplied: '2026-04-12' },
      { id: 103, name: 'İç & Dış Parazit', dueDate: '2026-11-10', status: 'Gecikmiş', lastApplied: '2026-08-10' }
    ],
    labResults: [
      { code: 'WBC', name: 'Lökosit', value: 11.4, unit: 'K/µL', min: 5.5, max: 19.5 },
      { code: 'HCT', name: 'Hematokrit', value: 38.2, unit: '%', min: 30, max: 45 },
      { code: 'ALT', name: 'Karaciğer Enzimi', value: 52, unit: 'U/L', min: 12, max: 130 },
      { code: 'BUN', name: 'Üre Azotu', value: 24, unit: 'mg/dL', min: 16, max: 36 }
    ],
    billing: [
      { id: 501, title: 'Genel Klinik Muayene', amount: 850, paid: true },
      { id: 502, title: 'Hemogram + Biyokimya Paneli', amount: 1450, paid: false }
    ]
  },
  {
    id: 2,
    petName: 'Max',
    species: 'Köpek',
    breed: 'Golden Retriever',
    ageText: '5 Yaş',
    weightKg: 31.5,
    microchip: 'TR-900118002883410',
    ownerName: 'Kemal Öz',
    ownerPhone: '+90 541 205 33 70',
    doctor: 'Dr. Can Yılmaz',
    time: '10:30',
    reason: 'Sol arka patide topallama ve ortopedik kontrol',
    status: 'Beklemede',
    vitals: { tempC: '38.4', heartRate: 96, respRate: 22 },
    diagnosis: 'Ön Değerlendirme Bekleniyor',
    medicalNote: '',
    vaccines: [
      { id: 201, name: 'DHPPi-L Karma Aşı', dueDate: '2026-11-22', status: 'Yaklaşıyor', lastApplied: '2025-11-22' },
      { id: 202, name: 'Kuduz Aşısı', dueDate: '2027-02-15', status: 'Güncel', lastApplied: '2026-02-15' },
      { id: 203, name: 'Leishmania / Dış Parazit', dueDate: '2026-12-01', status: 'Güncel', lastApplied: '2026-09-01' }
    ],
    labResults: [
      { code: 'WBC', name: 'Lökosit', value: 9.8, unit: 'K/µL', min: 6.0, max: 17.0 },
      { code: 'HCT', name: 'Hematokrit', value: 44.5, unit: '%', min: 37, max: 55 },
      { code: 'ALT', name: 'Karaciğer Enzimi', value: 48, unit: 'U/L', min: 10, max: 125 },
      { code: 'BUN', name: 'Üre Azotu', value: 19, unit: 'mg/dL', min: 7, max: 27 }
    ],
    billing: [
      { id: 503, title: 'Ortopedik Muayene + Dijital Röntgen', amount: 1850, paid: false }
    ]
  },
  {
    id: 3,
    petName: 'Pamuk',
    species: 'Tavşan',
    breed: 'Hollanda Lop',
    ageText: '2 Yaş',
    weightKg: 1.85,
    microchip: 'TR-900118002910054',
    ownerName: 'Zeynep Kaya',
    ownerPhone: '+90 505 881 40 12',
    doctor: 'Dr. Deniz Öztürk',
    time: '11:15',
    reason: 'Kesici diş törpüleme ve tırnak bakımı',
    status: 'Tamamlandı',
    vitals: { tempC: '39.1', heartRate: 210, respRate: 45 },
    diagnosis: 'Hafif Maloklüzyon — Bakım Uygulandı',
    medicalNote: 'Diş ve tırnak bakımı sorunsuz tamamlandı. Yüksek lifli saman diyeti önerildi; 6 ay sonra kontrol.',
    vaccines: [
      { id: 301, name: 'İç & Dış Parazit Damlası', dueDate: '2027-01-20', status: 'Güncel', lastApplied: '2026-10-20' }
    ],
    labResults: [
      { code: 'WBC', name: 'Lökosit', value: 7.4, unit: 'K/µL', min: 5.0, max: 12.0 },
      { code: 'HCT', name: 'Hematokrit', value: 36.0, unit: '%', min: 33, max: 50 }
    ],
    billing: [
      { id: 504, title: 'Egzotik Hayvan Diş & Tırnak Bakımı', amount: 750, paid: true }
    ]
  }
];

const INITIAL_CAGES: ObservationCage[] = [
  {
    cageNo: 'Ünite #1',
    petName: 'Tarçın (Kedi)',
    species: 'Kısırlaştırma Post-Op',
    condition: 'Stabil — Isı battaniyesi açık',
    fluidRate: '18 ml/saat İzotonik',
    nextMedTime: '14:00 Ağrı Kesici',
    medDone: false
  },
  {
    cageNo: 'Ünite #2',
    petName: 'Paşa (Köpek)',
    species: 'Gastroenterit Sıvı Terapisi',
    condition: 'İştah geri döndü',
    fluidRate: '45 ml/saat Ringer Laktat',
    nextMedTime: '15:00 Antiemetik',
    medDone: true
  }
];

export default function VeterinerClinicApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [role, setRole] = useState<VetRole>('vet');
  const [activeTab, setActiveTab] = useState<VetTab>('triage');
  const [appointments, setAppointments] = useState<VetAppointment[]>(INITIAL_VET_PATIENTS);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<'Tümü' | VetStatus>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [cages, setCages] = useState<ObservationCage[]>(INITIAL_CAGES);
  const [toast, setToast] = useState<string | null>(null);

  // Pet Owner Appointment Form State
  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+90 532 ');
  const [petType, setPetType] = useState<VetAppointment['species']>('Köpek');
  const [petBreed, setPetBreed] = useState('');
  const [petDoctor, setPetDoctor] = useState(VET_DOCTORS[0]);
  const [petTime, setPetTime] = useState('13:30');
  const [petReason, setPetReason] = useState('');

  // Inline Exam Editor Draft synced per selection
  const selectedPet = useMemo(
    () => appointments.find((a) => a.id === selectedId) ?? appointments[0],
    [appointments, selectedId]
  );

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchStatus = statusFilter === 'Tümü' || a.status === statusFilter;
      const matchQ =
        !q ||
        a.petName.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        a.microchip.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [appointments, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === 'Beklemede').length;
    const inExam = appointments.filter((a) => a.status === 'Muayenede').length;
    const dueVaccines = appointments.reduce(
      (s, a) => s + a.vaccines.filter((v) => v.status !== 'Güncel').length,
      0
    );
    const revenue = appointments.reduce(
      (s, a) => s + a.billing.filter((b) => b.paid).reduce((x, item) => x + item.amount, 0),
      0
    );
    return { total: appointments.length, pending, inExam, dueVaccines, revenue };
  }, [appointments]);

  const notify = (msg: string) => setToast(msg);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !ownerName.trim()) return;
    const nextId = Date.now();
    const created: VetAppointment = {
      id: nextId,
      petName: petName.trim(),
      species: petType,
      breed: petBreed.trim() || 'Melez / Standart',
      ageText: '2 Yaş',
      weightKg: petType === 'Köpek' ? 14.5 : petType === 'Kedi' ? 3.9 : 1.5,
      microchip: `TR-90011800${String(nextId).slice(-7)}`,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim() || '+90 532 000 00 00',
      doctor: petDoctor.split('(')[0].trim(),
      time: petTime,
      reason: petReason.trim() || 'Genel sağlık kontrolü ve muayene talebi',
      status: 'Beklemede',
      vitals: { tempC: '38.5', heartRate: petType === 'Kedi' ? 140 : 100, respRate: 24 },
      diagnosis: 'Hekim Değerlendirmesi Bekleniyor',
      medicalNote: '',
      vaccines: [
        { id: nextId + 1, name: 'Kuduz Aşısı', dueDate: '2026-11-25', status: 'Yaklaşıyor' },
        { id: nextId + 2, name: 'İç & Dış Parazit', dueDate: '2026-12-15', status: 'Güncel' }
      ],
      labResults: [
        { code: 'WBC', name: 'Lökosit', value: 10.2, unit: 'K/µL', min: 5.5, max: 17.5 },
        { code: 'HCT', name: 'Hematokrit', value: 40.1, unit: '%', min: 32, max: 52 }
      ],
      billing: [{ id: nextId + 3, title: 'Veteriner Muayene Hizmeti', amount: 850, paid: false }]
    };

    setAppointments((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setPetName('');
    setOwnerName('');
    setPetBreed('');
    setPetReason('');
    notify(`${created.ownerName} — ${created.petName} (${created.species}) randevu talebi alındı. Hekim onayı bekliyor.`);
  };

  const updateStatus = (id: number, status: VetStatus) => {
    const target = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (target) {
      notify(`${target.petName} randevu durumu "${status}" olarak güncellendi.`);
    }
  };

  const updateSelectedPetField = <K extends keyof VetAppointment>(field: K, value: VetAppointment[K]) => {
    if (!selectedPet) return;
    setAppointments((prev) => prev.map((a) => (a.id === selectedPet.id ? { ...a, [field]: value } : a)));
  };

  const handleApplyVaccine = (petId: number, vacId: number) => {
    const targetPet = appointments.find((a) => a.id === petId);
    const targetVac = targetPet?.vaccines.find((v) => v.id === vacId);
    if (!targetPet || !targetVac) return;

    const today = new Date().toISOString().slice(0, 10);
    const nextYear = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;

    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== petId) return a;
        return {
          ...a,
          vaccines: a.vaccines.map((v) =>
            v.id === vacId ? { ...v, status: 'Güncel', lastApplied: today, dueDate: nextYear } : v
          ),
          billing: [
            ...a.billing,
            { id: Date.now(), title: `${targetVac.name} Uygulaması`, amount: 650, paid: false }
          ]
        };
      })
    );
    notify(`${targetPet.petName} için ${targetVac.name} uygulandı, aşı karnesi güncellendi ve 650 ₺ fatura kalemi eklendi.`);
  };

  const handleToggleCageMed = (cageNo: string) => {
    setCages((prev) => prev.map((c) => (c.cageNo === cageNo ? { ...c, medDone: !c.medDone } : c)));
    notify(`${cageNo} tedavi dozu durumu güncellendi.`);
  };

  const handleAdmitSelectedPet = () => {
    if (!selectedPet) return;
    if (cages.some((c) => c.petName.startsWith(selectedPet.petName))) {
      notify(`${selectedPet.petName} zaten müşahede ünitesinde kayıtlı.`);
      return;
    }
    setCages((prev) => [
      {
        cageNo: `Ünite #${prev.length + 1}`,
        petName: `${selectedPet.petName} (${selectedPet.species})`,
        species: selectedPet.diagnosis || 'Gözlem & Sıvı Desteği',
        condition: `Ateş ${selectedPet.vitals.tempC}°C • Nabız ${selectedPet.vitals.heartRate}`,
        fluidRate: '25 ml/saat İzotonik',
        nextMedTime: '16:30 Antibiyotik',
        medDone: false
      },
      ...prev
    ]);
    notify(`${selectedPet.petName} yataklı müşahede ünitesine alındı.`);
  };

  const handleCollectVetPayment = (petId: number) => {
    const target = appointments.find((a) => a.id === petId);
    if (!target) return;
    const unpaid = target.billing.filter((b) => !b.paid).reduce((s, x) => s + x.amount, 0);
    if (unpaid <= 0) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === petId ? { ...a, billing: a.billing.map((b) => ({ ...b, paid: true })) } : a
      )
    );
    notify(`${target.ownerName} (${target.petName}) hesabından ₺${unpaid.toLocaleString('tr-TR')} tahsil edildi.`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#060a14',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        border: fullHeight ? 'none' : '1px solid var(--border-subtle)',
        minHeight: fullHeight ? '100vh' : '680px',
        overflow: 'hidden'
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          background: 'linear-gradient(90deg, #0b1322 0%, #101b2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(0,240,255,0.22))',
              border: '1px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PawPrint size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                Veteriner Klinik OS — Hekim, Aşı Karnesi &amp; Müşahede Sistemi
              </strong>
              <span className="live-indicator" style={{ fontSize: '0.7rem' }}>
                <span className="live-dot" /> 7/24 Acil Triyaj
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Pet Sahibi Online Randevu • Veteriner Hekim Onay/İptal • Vital Muayene • Aşı Pasaportu &amp; Laboratuvar
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => setRole('vet')}
            className={`btn btn-sm ${role === 'vet' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.73rem', padding: '0.38rem 0.75rem' }}
          >
            <Stethoscope size={13} /> Veteriner Hekim Paneli
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`btn btn-sm ${role === 'owner' ? 'btn-purple' : 'btn-secondary'}`}
            style={{ fontSize: '0.73rem', padding: '0.38rem 0.75rem' }}
          >
            <UserCheck size={13} /> Pet Sahibi Portalı (Randevu Al)
          </button>
          <a
            href="https://github.com/sudemkavuzkoz/Veteriner-Klinik-Sistemi"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.38rem 0.7rem' }}
          >
            <ExternalLink size={12} /> GitHub
          </a>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            margin: '0.75rem 1.25rem 0',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            borderRadius: '10px',
            padding: '0.55rem 0.9rem',
            fontSize: '0.78rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={14} color="#10b981" /> {toast}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.72rem' }}
          >
            Kapat
          </button>
        </div>
      )}

      {/* ROLE 1: PET OWNER ONLINE BOOKING & DIGITAL VACCINE CARD */}
      {role === 'owner' ? (
        <div style={{ padding: '1.1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
          <form
            onSubmit={handleCreateAppointment}
            style={{ background: '#0c1322', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '1.1rem' }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CalendarCheck size={16} color="#a855f7" /> Pet Sahibi Online Randevu Talebi
            </h4>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.9rem' }}>
              Evcil dostunuz için randevu oluşturduğunuzda talep anında Veteriner Hekim ekranına düşer ve onay/muayene sürecine alınır.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div>
                <label className="form-label">Dostumuzun Adı</label>
                <input type="text" required value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Örn: Zeytin" className="form-input" />
              </div>
              <div>
                <label className="form-label">Sahip Adı Soyadı</label>
                <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Örn: Ali Can" className="form-input" />
              </div>
              <div>
                <label className="form-label">Tür</label>
                <select value={petType} onChange={(e) => setPetType(e.target.value as VetAppointment['species'])} className="form-select">
                  <option value="Köpek">Köpek</option>
                  <option value="Kedi">Kedi</option>
                  <option value="Tavşan">Tavşan</option>
                  <option value="Kuş">Kuş</option>
                  <option value="Hamster">Hamster</option>
                </select>
              </div>
              <div>
                <label className="form-label">Irk / Cins (Opsiyonel)</label>
                <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="Örn: Scottish Fold" className="form-input" />
              </div>
              <div>
                <label className="form-label">Veteriner Hekim</label>
                <select value={petDoctor} onChange={(e) => setPetDoctor(e.target.value)} className="form-select">
                  {VET_DOCTORS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '0.8fr 1.6fr', gap: '0.65rem' }}>
                <div>
                  <label className="form-label">Saat</label>
                  <select value={petTime} onChange={(e) => setPetTime(e.target.value)} className="form-select">
                    {VET_TIME_SLOTS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Telefon</label>
                  <input type="text" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="form-input" />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.8rem' }}>
              <label className="form-label">Şikayet / Randevu Sebebi</label>
              <input
                type="text"
                value={petReason}
                onChange={(e) => setPetReason(e.target.value)}
                placeholder="Örn: Kuduz aşısı yenileme veya iştahsızlık"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-purple btn-sm" style={{ width: '100%' }}>
              <Plus size={14} /> Randevu Talebi Gönder
            </button>
          </form>

          {/* Owner View: Appointments & Vet Notes */}
          <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Randevularım &amp; Hekim Değerlendirmeleri</h4>
              <button type="button" onClick={() => setRole('vet')} className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem' }}>
                Hekim Ekranına Geç →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '420px', overflowY: 'auto' }}>
              {appointments.map((a) => {
                const stColor = a.status === 'İptal Edildi' ? 'var(--accent-rose)' : VET_STATUS_COLOR[a.status] || 'var(--primary)';
                return (
                  <div key={a.id} style={{ background: '#111a2e', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ marginRight: '0.4rem' }}>{SPECIES_EMOJI[a.species]}</span>
                        <strong style={{ color: '#f8fafc' }}>{a.petName}</strong>{' '}
                        <span style={{ color: '#94a3b8' }}>({a.species} • {a.ownerName})</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: stColor }}>
                        {a.time} • {a.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {a.doctor} • Sebep: {a.reason}
                    </div>
                    {a.medicalNote && (
                      <div style={{ marginTop: '0.45rem', background: 'rgba(16,185,129,0.1)', borderLeft: '2px solid #10b981', padding: '0.35rem 0.55rem', fontSize: '0.72rem', color: '#cbd5e1', borderRadius: '4px' }}>
                        <strong>Hekim Notu:</strong> {a.medicalNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ROLE 2: FULL VETERINARY DOCTOR PRACTICE OS */
        <>
          {/* KPI Strip */}
          <div style={{ padding: '0.85rem 1.25rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem' }}>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.7rem 0.85rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Günlük Randevu</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{stats.total}</div>
              <div style={{ fontSize: '0.66rem', color: '#f59e0b' }}>{stats.pending} hekim onayı bekliyor</div>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.7rem 0.85rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Muayene &amp; Müşahede</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {stats.inExam} / {cages.length}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Kafes &amp; poliklinik aktif</div>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.7rem 0.85rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Aşı Takibi Uyarısı</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>{stats.dueVaccines}</div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Yaklaşan veya gecikmiş doz</div>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.7rem 0.85rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Klinik Kasa Tahsilatı</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                ₺{stats.revenue.toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#10b981' }}>Canlı kasa senkronu</div>
            </div>
          </div>

          {/* Sub-Navigation & Search */}
          <div style={{ padding: '0.75rem 1.25rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[
                { id: 'triage', label: 'Randevu, Triyaj & Muayene', icon: Stethoscope },
                { id: 'vaccines', label: 'Aşı Takvimi & Pasaport', icon: Syringe },
                { id: 'inpatient', label: `Müşahede (${cages.length}) & Hemogram`, icon: HeartPulse },
                { id: 'billing', label: 'Kasa & Tedavi Kalemleri', icon: CreditCard }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as VetTab)}
                    className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.73rem', padding: '0.35rem 0.72rem' }}
                  >
                    <Icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="#64748b" style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pet, sahip veya mikroçip..."
                  className="form-input"
                  style={{ fontSize: '0.73rem', padding: '0.32rem 0.6rem 0.32rem 1.7rem', width: '185px' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="form-select"
                style={{ width: 'auto', fontSize: '0.73rem', padding: '0.32rem 0.6rem' }}
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Muayenede">Muayenede</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="İptal Edildi">İptal Edildi</option>
              </select>
            </div>
          </div>

          {/* Workspace Body */}
          <div style={{ flex: 1, padding: '0.9rem 1.25rem 1.25rem' }}>
            {/* TAB 1: TRIAGE & CLINICAL EXAM */}
            {activeTab === 'triage' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
                {/* Appointment Queue */}
                <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', alignSelf: 'start' }}>
                  <div style={{ padding: '0.75rem 1rem', background: '#111a2e', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>Hasta Kabul &amp; Randevu Kuyruğu</span>
                    <button type="button" onClick={() => setRole('owner')} className="btn btn-sm btn-secondary" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                      + Sahip Ekranından Ekle
                    </button>
                  </div>

                  <div>
                    {filteredAppointments.map((a) => {
                      const stColor = a.status === 'İptal Edildi' ? 'var(--accent-rose)' : VET_STATUS_COLOR[a.status] || 'var(--primary)';
                      const isSel = selectedPet?.id === a.id;
                      return (
                        <div
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          style={{
                            padding: '0.8rem 1rem',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: isSel ? 'rgba(0,240,255,0.06)' : 'transparent',
                            borderLeft: isSel ? '3px solid #00f0ff' : '3px solid transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '0.82rem' }}>
                              <strong style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', marginRight: '0.45rem' }}>{a.time}</strong>
                              <span>{SPECIES_EMOJI[a.species]} </span>
                              <strong style={{ color: '#f8fafc' }}>{a.petName}</strong>
                              <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}> ({a.breed})</span>
                            </div>

                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                background: `color-mix(in srgb, ${stColor} 15%, transparent)`,
                                color: stColor
                              }}
                            >
                              {a.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            Sahip: {a.ownerName} • {a.doctor}
                          </div>

                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {a.status === 'Beklemede' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(a.id, 'Onaylandı');
                                  }}
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', color: '#10b981' }}
                                >
                                  <Check size={11} /> Onayla
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(a.id, 'İptal Edildi');
                                  }}
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', color: '#f43f5e' }}
                                >
                                  <XCircle size={11} /> İptal Et
                                </button>
                              </>
                            )}
                            {a.status === 'Onaylandı' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(a.id);
                                  updateStatus(a.id, 'Muayenede');
                                }}
                                className="btn btn-sm btn-primary"
                                style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}
                              >
                                <Activity size={11} /> Muayeneye Al
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Selected Pet Clinical Workstation */}
                {selectedPet && (
                  <div style={{ background: '#0c1322', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>{SPECIES_EMOJI[selectedPet.species]}</span>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                              {selectedPet.petName} — Dijital Pet Kimliği &amp; Muayene Kartı
                            </h4>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {selectedPet.species} ({selectedPet.breed}) • {selectedPet.ageText} • <strong>{selectedPet.weightKg} kg</strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Microchip size={12} color="#00f0ff" /> Çip: {selectedPet.microchip} • Sahip: {selectedPet.ownerName} ({selectedPet.ownerPhone})
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdmitSelectedPet}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderColor: 'rgba(168,85,247,0.45)', color: '#c4b5fd' }}
                      >
                        <HeartPulse size={12} /> Müşahedeye Yatır
                      </button>
                    </div>

                    {selectedPet.allergyWarning && (
                      <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.35)', borderRadius: '8px', padding: '0.45rem 0.7rem', fontSize: '0.73rem', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} color="#f43f5e" /> Dikkat: <strong>{selectedPet.allergyWarning}</strong>
                      </div>
                    )}

                    {/* Vitals Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem' }}>
                      <div style={{ background: '#111a2e', borderRadius: '8px', padding: '0.55rem' }}>
                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Thermometer size={11} color="#f59e0b" /> Vücut Isısı (°C)
                        </label>
                        <input
                          type="text"
                          value={selectedPet.vitals.tempC}
                          onChange={(e) => updateSelectedPetField('vitals', { ...selectedPet.vitals, tempC: e.target.value })}
                          className="form-input"
                          style={{ marginTop: '0.25rem', padding: '0.25rem 0.45rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                      <div style={{ background: '#111a2e', borderRadius: '8px', padding: '0.55rem' }}>
                        <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Nabız (bpm)</label>
                        <input
                          type="number"
                          value={selectedPet.vitals.heartRate}
                          onChange={(e) =>
                            updateSelectedPetField('vitals', { ...selectedPet.vitals, heartRate: Number(e.target.value) || 0 })
                          }
                          className="form-input"
                          style={{ marginTop: '0.25rem', padding: '0.25rem 0.45rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                      <div style={{ background: '#111a2e', borderRadius: '8px', padding: '0.55rem' }}>
                        <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Solunum (/dk)</label>
                        <input
                          type="number"
                          value={selectedPet.vitals.respRate}
                          onChange={(e) =>
                            updateSelectedPetField('vitals', { ...selectedPet.vitals, respRate: Number(e.target.value) || 0 })
                          }
                          className="form-input"
                          style={{ marginTop: '0.25rem', padding: '0.25rem 0.45rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                    </div>

                    {/* Diagnosis & Medical Notes */}
                    <div>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Klinik Tanı / Ön Teşhis</label>
                      <input
                        type="text"
                        value={selectedPet.diagnosis}
                        onChange={(e) => updateSelectedPetField('diagnosis', e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.76rem', padding: '0.42rem 0.65rem', marginBottom: '0.55rem' }}
                      />

                      <label className="form-label" style={{ fontSize: '0.7rem' }}>
                        <FileText size={11} style={{ display: 'inline' }} /> Muayene Sonu Tıbbi Not &amp; Reçete Talimatı
                      </label>
                      <textarea
                        rows={3}
                        value={selectedPet.medicalNote}
                        onChange={(e) => updateSelectedPetField('medicalNote', e.target.value)}
                        placeholder="Teşhis, uygulanan tedavi ve reçete talimatını yazın..."
                        className="form-input"
                        style={{ fontSize: '0.76rem', padding: '0.45rem 0.65rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Şikayet: {selectedPet.reason}</span>
                      <button
                        type="button"
                        onClick={() => {
                          updateStatus(selectedPet.id, 'Tamamlandı');
                          notify(`${selectedPet.petName} muayene notu kaydedildi ve işlem tamamlandı.`);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.74rem' }}
                      >
                        <Check size={13} /> Muayene Notunu Kaydet &amp; Tamamla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VACCINE CALENDAR & PASSPORT */}
            {activeTab === 'vaccines' && selectedPet && (
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.9rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ShieldCheck size={16} color="#10b981" /> Dijital Aşı Karnesi &amp; Hatırlatma Takvimi — {selectedPet.petName}
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Mikroçip: {selectedPet.microchip} • Sahip: {selectedPet.ownerName} ({selectedPet.ownerPhone})
                    </p>
                  </div>

                  <select
                    value={selectedPet.id}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="form-select"
                    style={{ width: 'auto', fontSize: '0.75rem', padding: '0.32rem 0.65rem' }}
                  >
                    {appointments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {SPECIES_EMOJI[a.species]} {a.petName} ({a.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: '0.75rem' }}>
                  {selectedPet.vaccines.map((vac) => {
                    const badgeColor =
                      vac.status === 'Güncel' ? '#10b981' : vac.status === 'Yaklaşıyor' ? '#f59e0b' : '#f43f5e';
                    return (
                      <div
                        key={vac.id}
                        style={{
                          background: '#111a2e',
                          border: `1px solid ${badgeColor}44`,
                          borderRadius: '10px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{vac.name}</strong>
                          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: badgeColor, background: `${badgeColor}20`, padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                            {vac.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Sonraki Doz: <strong style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{vac.dueDate}</strong>
                          {vac.lastApplied && <div>Son Uygulama: {vac.lastApplied}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <button
                            type="button"
                            onClick={() => handleApplyVaccine(selectedPet.id, vac.id)}
                            className="btn btn-sm btn-primary"
                            style={{ flex: 1, fontSize: '0.68rem', padding: '0.28rem 0.5rem' }}
                          >
                            <Syringe size={11} /> Uygula &amp; İşle
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              notify(`${selectedPet.ownerName} (${selectedPet.ownerPhone}) numarasına ${selectedPet.petName} için ${vac.name} hatırlatma SMS'i gönderildi.`)
                            }
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.68rem', padding: '0.28rem 0.5rem' }}
                          >
                            <Send size={11} /> SMS
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: HOSPITALIZATION & HEMOGRAM LAB */}
            {activeTab === 'inpatient' && selectedPet && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <HeartPulse size={15} color="#f43f5e" /> Yatan Hasta &amp; Müşahede Üniteleri ({cages.length} Dolu)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {cages.map((c) => (
                      <div key={c.cageNo} style={{ background: '#111a2e', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ color: '#00f0ff', fontSize: '0.8rem' }}>
                            {c.cageNo} — {c.petName}
                          </strong>
                          <button
                            type="button"
                            onClick={() => handleToggleCageMed(c.cageNo)}
                            className={`btn btn-sm ${c.medDone ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ fontSize: '0.67rem', padding: '0.2rem 0.5rem', color: c.medDone ? '#10b981' : undefined }}
                          >
                            {c.medDone ? '✓ Doz Uygulandı' : `${c.nextMedTime} Onayla`}
                          </button>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{c.species}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Sıvı: {c.fluidRate} • {c.condition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hematology Panel */}
                <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <FlaskConical size={15} color="#00f0ff" /> Hemogram &amp; Biyokimya Sonuçları — {selectedPet.petName}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {selectedPet.labResults.map((m) => {
                      const pct = Math.min(100, Math.max(8, ((m.value - m.min) / Math.max(0.1, m.max - m.min)) * 100));
                      const inRange = m.value >= m.min && m.value <= m.max;
                      return (
                        <div key={m.code} style={{ background: '#111a2e', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.3rem' }}>
                            <strong style={{ color: '#e2e8f0' }}>
                              {m.code} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({m.name})</span>
                            </strong>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: inRange ? '#10b981' : '#f59e0b' }}>
                              {m.value} {m.unit} <span style={{ color: '#64748b', fontSize: '0.66rem' }}>[{m.min}–{m.max}]</span>
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: inRange ? '#10b981' : '#f59e0b', borderRadius: '999px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VET BILLING */}
            {activeTab === 'billing' && selectedPet && (
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      Veteriner Tedavi &amp; İlaç Hesabı — {selectedPet.petName} ({selectedPet.ownerName})
                    </h4>
                  </div>
                  <select
                    value={selectedPet.id}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="form-select"
                    style={{ width: 'auto', fontSize: '0.74rem', padding: '0.28rem 0.6rem' }}
                  >
                    {appointments.map((a) => (
                      <option key={a.id} value={a.id}>{a.petName} — {a.ownerName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.9rem' }}>
                  {selectedPet.billing.map((item) => (
                    <div key={item.id} style={{ background: '#111a2e', borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#e2e8f0' }}>{item.title}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>₺{item.amount.toLocaleString('tr-TR')}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: item.paid ? '#10b981' : '#f59e0b' }}>
                          {item.paid ? 'Tahsil Edildi' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={selectedPet.billing.every((b) => b.paid)}
                  onClick={() => handleCollectVetPayment(selectedPet.id)}
                  className="btn btn-primary btn-sm"
                >
                  <CreditCard size={14} /> Açık Bakiyeyi Tahsil Et
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

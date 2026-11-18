'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Pill,
  Plus,
  Receipt,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  XCircle
} from 'lucide-react';

type NavTab = 'dashboard' | 'calendar' | 'emr' | 'billing' | 'sms';
type AppointmentStatus = 'Beklemede' | 'Onaylandı' | 'Muayenede' | 'Tamamlandı' | 'İptal Edildi';
type ToothCondition = 'healthy' | 'caries' | 'filling' | 'root_canal' | 'crown' | 'implant' | 'extraction';

interface PrescriptionItem {
  id: number;
  drug: string;
  dosage: string;
  instructions: string;
}

interface BillingItem {
  id: number;
  title: string;
  tooth?: string;
  amount: number;
  paid: boolean;
  receiptNo?: string;
}

interface ClinicPatient {
  id: number;
  protocolNo: string;
  name: string;
  age: number;
  phone: string;
  bloodType: string;
  allergies: string;
  chronicCondition: string;
  doctor: string;
  department: string;
  room: string;
  time: string;
  status: AppointmentStatus;
  complaint: string;
  vitals: { bp: string; pulse: number; temp: string; spo2: number };
  icdCode: string;
  soapNote: string;
  teethMap: Record<number, ToothCondition>;
  prescriptions: PrescriptionItem[];
  billing: BillingItem[];
  insuranceDiscountPct: number;
}

interface SmsLog {
  id: number;
  recipient: string;
  phone: string;
  channel: 'SMS' | 'WhatsApp';
  message: string;
  sentAt: string;
  status: 'İletildi';
}

const DOCTORS = [
  { name: 'Dt. Caner Eren', department: 'Ağız ve Diş Sağlığı', room: 'Ünit #1', color: '#00f0ff' },
  { name: 'Dr. Selin Yılmaz', department: 'Dahiliye & Kardiyoloji', room: 'Poliklinik 102', color: '#10b981' },
  { name: 'Dr. Meltem Akın', department: 'Ortodonti & Estetik', room: 'Ünit #2', color: '#a855f7' }
] as const;

const TIME_SLOTS = ['09:00', '09:45', '10:30', '11:30', '13:30', '14:15', '15:00', '16:15', '17:00'];

const TOOTH_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const TOOTH_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const TOOTH_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const TOOTH_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const TOOTH_CONDITION_META: Record<
  ToothCondition,
  { label: string; short: string; color: string; bg: string; price: number }
> = {
  healthy: { label: 'Sağlıklı', short: 'S', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', price: 0 },
  caries: { label: 'Çürük (Karies)', short: 'Ç', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.18)', price: 1200 },
  filling: { label: 'Kompozit Dolgu', short: 'D', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.18)', price: 2400 },
  root_canal: { label: 'Kanal Tedavisi', short: 'K', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.18)', price: 4800 },
  crown: { label: 'Zirkonyum Kuron', short: 'Z', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', price: 7500 },
  implant: { label: 'Dental İmplant', short: 'İ', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.22)', price: 16500 },
  extraction: { label: 'Çekim Planı', short: 'ÇK', color: '#fb7185', bg: 'rgba(225, 29, 72, 0.25)', price: 1800 }
};

const STATUS_META: Record<AppointmentStatus, { color: string; bg: string }> = {
  Beklemede: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' },
  Onaylandı: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' },
  Muayenede: { color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.14)' },
  Tamamlandı: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)' },
  'İptal Edildi': { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.14)' }
};

const QUICK_DRUGS = [
  { drug: 'Augmentin BID 1000 mg', dosage: '2x1 (Tok)', instructions: '7 gün düzenli antibiyotik kullanımı' },
  { drug: 'Majezik 100 mg Film Tablet', dosage: '2x1', instructions: 'Ağrı halinde yemek sonrası' },
  { drug: 'Klorhex %0.2 Oral Gargara', dosage: '3x1', instructions: 'Yemek sonrası 30 sn çalkalama' },
  { drug: 'Coraspin 100 mg', dosage: '1x1', instructions: 'Günlük kardiyoloji idame dozu' }
];

const INITIAL_PATIENTS: ClinicPatient[] = [
  {
    id: 101,
    protocolNo: 'SDM-2026-4081',
    name: 'Merve Tan',
    age: 31,
    phone: '+90 533 412 88 90',
    bloodType: 'A Rh+',
    allergies: 'Penisilin Hassasiyeti',
    chronicCondition: 'Yok',
    doctor: 'Dt. Caner Eren',
    department: 'Ağız ve Diş Sağlığı',
    room: 'Ünit #1',
    time: '09:45',
    status: 'Muayenede',
    complaint: 'Sağ üst azı dişinde sıcak-soğuk hassasiyeti ve ağrı',
    vitals: { bp: '118/76', pulse: 74, temp: '36.6', spo2: 99 },
    icdCode: 'K02.1 — Dentin Çürüğü & Endodontik Değerlendirme',
    soapNote: '16 nolu dişte derin dentin çürüğü gözlendi; 26 nolu dişe estetik zirkonyum kuron provası planlandı.',
    teethMap: { 16: 'root_canal', 26: 'crown', 36: 'filling', 46: 'caries' },
    prescriptions: [
      { id: 1, drug: 'Klorhex %0.2 Oral Gargara', dosage: '3x1', instructions: 'Operasyon sonrası 5 gün' }
    ],
    billing: [
      { id: 11, title: 'Panoramik Radyografi + Muayene', amount: 1450, paid: true, receiptNo: 'ESMM-2026-0811' },
      { id: 12, title: '16 Nolu Diş Kanal Tedavisi', tooth: '#16', amount: 4800, paid: false }
    ],
    insuranceDiscountPct: 10
  },
  {
    id: 102,
    protocolNo: 'SDM-2026-4082',
    name: 'Ahmet Karaca',
    age: 54,
    phone: '+90 532 710 44 19',
    bloodType: '0 Rh+',
    allergies: 'Bilinen Alerji Yok',
    chronicCondition: 'Esansiyel Hipertansiyon',
    doctor: 'Dr. Selin Yılmaz',
    department: 'Dahiliye & Kardiyoloji',
    room: 'Poliklinik 102',
    time: '10:30',
    status: 'Onaylandı',
    complaint: 'Rutin tansiyon regülasyonu ve EKG kontrolü',
    vitals: { bp: '138/88', pulse: 80, temp: '36.7', spo2: 98 },
    icdCode: 'I10 — Esansiyel (Primer) Hipertansiyon',
    soapNote: 'Son 14 günlük ev tansiyon günlüğü incelenecek; kan lipit paneli istenecek.',
    teethMap: { 11: 'filling', 47: 'implant' },
    prescriptions: [
      { id: 2, drug: 'Coraspin 100 mg', dosage: '1x1', instructions: 'Her sabah tok karnına' }
    ],
    billing: [
      { id: 21, title: 'Kardiyoloji Muayene + 12 Derivasyon EKG', amount: 2600, paid: false }
    ],
    insuranceDiscountPct: 20
  },
  {
    id: 103,
    protocolNo: 'SDM-2026-4083',
    name: 'Burak Demir',
    age: 26,
    phone: '+90 544 892 15 03',
    bloodType: 'B Rh-',
    allergies: 'Lateks Hassasiyeti',
    chronicCondition: 'Yok',
    doctor: 'Dr. Meltem Akın',
    department: 'Ortodonti & Estetik',
    room: 'Ünit #2',
    time: '11:30',
    status: 'Beklemede',
    complaint: 'Ön bölge estetik lamina / şeffaf plak değerlendirmesi',
    vitals: { bp: '120/78', pulse: 71, temp: '36.5', spo2: 99 },
    icdCode: 'K07.3 — Diş Pozisyon Anomalisi',
    soapNote: '3D intraoral tarama sonrası dijital gülüş tasarımı simülasyonu paylaşılacak.',
    teethMap: { 11: 'crown', 21: 'crown', 38: 'extraction' },
    prescriptions: [],
    billing: [
      { id: 31, title: '3D İntraoral Dijital Tarama + Planlama', amount: 1950, paid: false }
    ],
    insuranceDiscountPct: 0
  },
  {
    id: 104,
    protocolNo: 'SDM-2026-4084',
    name: 'Elif Şahin',
    age: 42,
    phone: '+90 505 330 61 72',
    bloodType: 'AB Rh+',
    allergies: 'Bilinen Alerji Yok',
    chronicCondition: 'Tip 2 Diyabet (Kontrollü)',
    doctor: 'Dt. Caner Eren',
    department: 'Ağız ve Diş Sağlığı',
    room: 'Ünit #1',
    time: '09:00',
    status: 'Tamamlandı',
    complaint: '36 nolu diş implant üstü ölçü kontrolü',
    vitals: { bp: '122/80', pulse: 75, temp: '36.6', spo2: 98 },
    icdCode: 'K08.1 — Kısmi Diş Eksikliği / İmplant Restorasyonu',
    soapNote: 'Osteointegrasyon stabil; zirkonyum abutment ve kuron siparişi laboratuvara iletildi.',
    teethMap: { 36: 'implant', 15: 'filling', 25: 'filling' },
    prescriptions: [],
    billing: [
      { id: 41, title: '36 Nolu Bölge İmplant Üstü Ölçü & Abutment', tooth: '#36', amount: 6400, paid: true, receiptNo: 'ESMM-2026-0809' }
    ],
    insuranceDiscountPct: 15
  }
];

const INITIAL_SMS_LOGS: SmsLog[] = [
  {
    id: 1,
    recipient: 'Ahmet Karaca',
    phone: '+90 532 710 44 19',
    channel: 'WhatsApp',
    message: 'Sayın Ahmet Karaca, Dr. Selin Yılmaz ile 10:30 Poliklinik 102 randevunuz onaylanmıştır.',
    sentAt: '08:42',
    status: 'İletildi'
  },
  {
    id: 2,
    recipient: 'Elif Şahin',
    phone: '+90 505 330 61 72',
    channel: 'SMS',
    message: 'SDM Klinik: 6.400 TL tutarındaki ESMM-2026-0809 nolu e-SMM makbuzunuz oluşturulmuştur.',
    sentAt: '09:28',
    status: 'İletildi'
  }
];

export default function DentalClinicApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [patients, setPatients] = useState<ClinicPatient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(101);
  const [doctorFilter, setDoctorFilter] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTooth, setSelectedTooth] = useState<number>(16);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(INITIAL_SMS_LOGS);
  const [toast, setToast] = useState<string | null>(null);

  // Quick New Appointment Modal / Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+90 532 ');
  const [newAge, setNewAge] = useState('32');
  const [newAllergy, setNewAllergy] = useState('Bilinen Alerji Yok');
  const [newDoctor, setNewDoctor] = useState<string>(DOCTORS[0].name);
  const [newTime, setNewTime] = useState('13:30');
  const [newComplaint, setNewComplaint] = useState('');

  // Custom Prescription Draft
  const [rxDrug, setRxDrug] = useState(QUICK_DRUGS[0].drug);
  const [rxDosage, setRxDosage] = useState(QUICK_DRUGS[0].dosage);
  const [rxNote, setRxNote] = useState(QUICK_DRUGS[0].instructions);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'Kredi Kartı' | 'Nakit' | 'Havale/EFT'>('Kredi Kartı');

  // Custom SMS Draft
  const [smsDraft, setSmsDraft] = useState('Randevu saatinizden 15 dakika önce danışmada bulunmanızı rica ederiz.');
  const [smsChannel, setSmsChannel] = useState<'SMS' | 'WhatsApp'>('WhatsApp');

  const notify = (msg: string) => {
    setToast(msg);
  };

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((p) => {
      const matchDoc = doctorFilter === 'Tümü' || p.doctor === doctorFilter;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.protocolNo.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q);
      return matchDoc && matchQuery;
    });
  }, [patients, doctorFilter, searchQuery]);

  // Live Aggregate Stats
  const stats = useMemo(() => {
    const activeCount = patients.filter((p) => p.status !== 'İptal Edildi').length;
    const inExamCount = patients.filter((p) => p.status === 'Muayenede').length;
    const waitingCount = patients.filter((p) => p.status === 'Beklemede' || p.status === 'Onaylandı').length;
    const completedCount = patients.filter((p) => p.status === 'Tamamlandı').length;
    const totalCollected = patients.reduce(
      (sum, p) => sum + p.billing.filter((b) => b.paid).reduce((s, item) => s + item.amount, 0),
      0
    );
    const totalPending = patients.reduce(
      (sum, p) => sum + p.billing.filter((b) => !b.paid).reduce((s, item) => s + item.amount, 0),
      0
    );
    return { activeCount, inExamCount, waitingCount, completedCount, totalCollected, totalPending };
  }, [patients]);

  const updatePatientStatus = (id: number, status: AppointmentStatus) => {
    const target = patients.find((p) => p.id === id);
    if (!target) return;
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (status === 'Onaylandı' || status === 'Muayenede') {
      const nowStr = new Date().toTimeString().slice(0, 5);
      const text =
        status === 'Muayenede'
          ? `Sayın ${target.name}, ${target.room} (${target.doctor}) muayene sıranız gelmiştir.`
          : `Sayın ${target.name}, ${target.time} ${target.doctor} randevunuz onaylanmıştır.`;
      setSmsLogs((prev) => [
        {
          id: Date.now(),
          recipient: target.name,
          phone: target.phone,
          channel: 'WhatsApp',
          message: text,
          sentAt: nowStr,
          status: 'İletildi'
        },
        ...prev
      ]);
    }
    notify(`${target.name} durumu "${status}" olarak güncellendi.`);
  };

  const handleAssignToothCondition = (toothNum: number, condition: ToothCondition) => {
    if (!selectedPatient) return;
    const meta = TOOTH_CONDITION_META[condition];
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatient.id) return p;
        const nextMap = { ...p.teethMap };
        if (condition === 'healthy') {
          delete nextMap[toothNum];
        } else {
          nextMap[toothNum] = condition;
        }

        // Add billing item automatically when assigning a clinical procedure
        const nextBilling =
          meta.price > 0
            ? [
                ...p.billing,
                {
                  id: Date.now(),
                  title: `#${toothNum} Nolu Diş — ${meta.label}`,
                  tooth: `#${toothNum}`,
                  amount: meta.price,
                  paid: false
                }
              ]
            : p.billing;

        return { ...p, teethMap: nextMap, billing: nextBilling };
      })
    );
    notify(
      meta.price > 0
        ? `#${toothNum} nolu dişe "${meta.label}" işlendi ve ${meta.price.toLocaleString('tr-TR')} ₺ tedavi planına eklendi.`
        : `#${toothNum} nolu diş sağlıklı olarak işaretlendi.`
    );
  };

  const handleUpdateSoap = (field: 'soapNote' | 'icdCode', val: string) => {
    if (!selectedPatient) return;
    setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? { ...p, [field]: val } : p)));
  };

  const handleAddPrescription = () => {
    if (!selectedPatient || !rxDrug.trim()) return;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              prescriptions: [
                ...p.prescriptions,
                { id: Date.now(), drug: rxDrug.trim(), dosage: rxDosage.trim(), instructions: rxNote.trim() }
              ]
            }
          : p
      )
    );
    notify(`${selectedPatient.name} e-Reçete listesine ${rxDrug.trim()} eklendi.`);
  };

  const handleCollectPayment = (patientId: number) => {
    const target = patients.find((p) => p.id === patientId);
    if (!target) return;
    const pendingSum = target.billing.filter((b) => !b.paid).reduce((s, x) => s + x.amount, 0);
    if (pendingSum <= 0) return;

    const discountedTotal = Math.round(pendingSum * (1 - target.insuranceDiscountPct / 100));
    const receiptNo = `ESMM-2026-${String(Math.floor(1000 + (Date.now() % 8999)))}`;
    const nowStr = new Date().toTimeString().slice(0, 5);

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, billing: p.billing.map((b) => (b.paid ? b : { ...b, paid: true, receiptNo })) }
          : p
      )
    );

    setSmsLogs((prev) => [
      {
        id: Date.now(),
        recipient: target.name,
        phone: target.phone,
        channel: 'SMS',
        message: `SDM Klinik: ${discountedTotal.toLocaleString('tr-TR')} TL (${paymentMethod}) tahsilatınız için ${receiptNo} no'lu e-SMM makbuzunuz kesildi.`,
        sentAt: nowStr,
        status: 'İletildi'
      },
      ...prev
    ]);

    notify(`${target.name} için ${discountedTotal.toLocaleString('tr-TR')} ₺ (${paymentMethod}) tahsil edildi ve ${receiptNo} e-SMM kesildi.`);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const docMeta = DOCTORS.find((d) => d.name === newDoctor) ?? DOCTORS[0];
    const nextId = Date.now();
    const protocolNo = `SDM-2026-${String(4085 + patients.length)}`;
    const created: ClinicPatient = {
      id: nextId,
      protocolNo,
      name: newName.trim(),
      age: Math.max(1, Number.parseInt(newAge, 10) || 30),
      phone: newPhone.trim() || '+90 532 000 00 00',
      bloodType: 'A Rh+',
      allergies: newAllergy.trim() || 'Bilinen Alerji Yok',
      chronicCondition: 'Yok',
      doctor: docMeta.name,
      department: docMeta.department,
      room: docMeta.room,
      time: newTime,
      status: 'Onaylandı',
      complaint: newComplaint.trim() || 'Genel poliklinik ve dental muayene talebi',
      vitals: { bp: '120/80', pulse: 74, temp: '36.6', spo2: 99 },
      icdCode: 'Z01.2 — Dental & Poliklinik Muayene',
      soapNote: 'Yeni hasta kaydı oluşturuldu; ilk muayene ve vital ölçüm bekleniyor.',
      teethMap: {},
      prescriptions: [],
      billing: [{ id: nextId + 1, title: `${docMeta.department} Muayene Ücreti`, amount: 1400, paid: false }],
      insuranceDiscountPct: 0
    };

    const nowStr = new Date().toTimeString().slice(0, 5);
    setPatients((prev) => [created, ...prev]);
    setSelectedPatientId(created.id);
    setSmsLogs((prev) => [
      {
        id: nextId + 2,
        recipient: created.name,
        phone: created.phone,
        channel: 'WhatsApp',
        message: `Sayın ${created.name}, ${docMeta.name} (${docMeta.room}) için saat ${created.time} randevunuz oluşturuldu. Protokol: ${protocolNo}`,
        sentAt: nowStr,
        status: 'İletildi'
      },
      ...prev
    ]);
    setNewName('');
    setNewComplaint('');
    setShowNewModal(false);
    notify(`${created.name} için saat ${created.time} randevusu açıldı ve otomatik WhatsApp onayı iletildi.`);
  };

  const handleSendManualSms = () => {
    if (!selectedPatient || !smsDraft.trim()) return;
    const nowStr = new Date().toTimeString().slice(0, 5);
    setSmsLogs((prev) => [
      {
        id: Date.now(),
        recipient: selectedPatient.name,
        phone: selectedPatient.phone,
        channel: smsChannel,
        message: smsDraft.trim(),
        sentAt: nowStr,
        status: 'İletildi'
      },
      ...prev
    ]);
    notify(`${selectedPatient.name} (${selectedPatient.phone}) numarasına ${smsChannel} gönderildi.`);
  };

  const renderToothButton = (num: number) => {
    const cond: ToothCondition = selectedPatient?.teethMap[num] ?? 'healthy';
    const meta = TOOTH_CONDITION_META[cond];
    const isSelected = selectedTooth === num;
    return (
      <button
        key={num}
        type="button"
        onClick={() => setSelectedTooth(num)}
        title={`Diş #${num}: ${meta.label}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.35rem 0.2rem',
          borderRadius: '8px',
          background: isSelected ? 'rgba(0, 240, 255, 0.16)' : meta.bg,
          border: isSelected ? '1.5px solid #00f0ff' : `1px solid ${meta.color}44`,
          color: '#f8fafc',
          cursor: 'pointer',
          minWidth: '34px',
          transition: 'transform 0.12s ease'
        }}
      >
        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#cbd5e1', fontWeight: 700 }}>{num}</span>
        <span
          style={{
            marginTop: '0.18rem',
            fontSize: '0.64rem',
            fontWeight: 800,
            color: meta.color,
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '4px',
            padding: '0.05rem 0.3rem'
          }}
        >
          {meta.short}
        </span>
      </button>
    );
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
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top Clinical OS Header */}
      <header
        style={{
          background: 'linear-gradient(90deg, #0b1220 0%, #0e1729 100%)',
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
              background: 'linear-gradient(135deg, rgba(0,240,255,0.22), rgba(16,185,129,0.22))',
              border: '1px solid rgba(0,240,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Stethoscope size={20} color="#00f0ff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', letterSpacing: '0.01em' }}>
                SDM Klinik OS — Diş &amp; Poliklinik EMR Sistemi
              </strong>
              <span className="live-indicator" style={{ fontSize: '0.7rem' }}>
                <span className="live-dot" /> Canlı Senkronizasyon
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              FDI Diş Şeması (Odontogram) • Dijital Hasta Kabul • e-Reçete • e-SMM Tahsilat • WhatsApp/SMS Otomasyonu
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#64748b" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hasta, protokol veya tel ara..."
              className="form-input"
              style={{ padding: '0.35rem 0.65rem 0.35rem 1.85rem', fontSize: '0.74rem', width: '205px' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.4rem 0.8rem' }}
          >
            <Plus size={14} /> Yeni Randevu / Hasta
          </button>

          <a
            href="https://github.com/sudemkavuzkoz/Dental-Clinik"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.4rem 0.7rem' }}
          >
            <ExternalLink size={12} /> GitHub
          </a>
        </div>
      </header>

      {/* Navigation Strip */}
      <nav
        style={{
          background: '#0a101d',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.5rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {[
            { id: 'dashboard', label: 'Genel Bakış & Sıra', icon: LayoutDashboard },
            { id: 'calendar', label: 'Hekim Takvimi', icon: Calendar },
            { id: 'emr', label: 'Diş Şeması & Muayene (EMR)', icon: Activity },
            { id: 'billing', label: 'Kasa & e-SMM Fatura', icon: Receipt },
            { id: 'sms', label: `SMS / WhatsApp (${smsLogs.length})`, icon: MessageSquare }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as NavTab)}
                className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.74rem', padding: '0.36rem 0.75rem' }}
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', fontSize: '0.74rem', padding: '0.32rem 0.65rem' }}
        >
          <option value="Tümü">Tüm Hekimler ({patients.length})</option>
          {DOCTORS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} — {d.department}
            </option>
          ))}
        </select>
      </nav>

      {/* Toast Notification Bar */}
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

      {/* Main Content Workspace */}
      <div style={{ flex: 1, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* TAB 1: DASHBOARD & LIVE WAITING QUEUE */}
        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Aktif Randevular</span> <Users size={14} color="#00f0ff" />
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {stats.activeCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#00f0ff' }}>{stats.inExamCount} hasta koltukta/muayenede</div>
              </div>

              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bekleme Salonu</span> <Clock size={14} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {stats.waitingCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Tamamlanan: {stats.completedCount} işlem</div>
              </div>

              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Günlük Tahsilat (e-SMM)</span> <CreditCard size={14} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  ₺{stats.totalCollected.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Bekleyen Bakiye: ₺{stats.totalPending.toLocaleString('tr-TR')}</div>
              </div>

              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Otomatik Bildirim</span> <MessageSquare size={14} color="#a855f7" />
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {smsLogs.length} İleti
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>%100 Teslimat Başarısı</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
              {/* Live Queue Panel */}
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '0.8rem 1rem', background: '#111a2e', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Canlı Bekleme Salonu &amp; Hasta Akışı</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Satıra tıklayıp EMR açın</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredPatients.map((p) => {
                    const st = STATUS_META[p.status];
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: p.id === selectedPatient?.id ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00f0ff', fontSize: '0.78rem' }}>{p.time}</span>
                            <strong style={{ color: '#f8fafc', fontSize: '0.84rem' }}>{p.name}</strong>
                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{p.protocolNo}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {p.doctor} • <strong style={{ color: '#cbd5e1' }}>{p.room}</strong> • {p.complaint.slice(0, 48)}
                            {p.complaint.length > 48 ? '...' : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: st.color,
                              background: st.bg,
                              padding: '0.16rem 0.55rem',
                              borderRadius: '999px'
                            }}
                          >
                            {p.status}
                          </span>

                          {(p.status === 'Beklemede' || p.status === 'Onaylandı') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePatientStatus(p.id, 'Muayenede');
                              }}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                            >
                              <UserCheck size={11} /> Odaya Çağır
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatientId(p.id);
                              setActiveTab('emr');
                            }}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                          >
                            EMR / Diş Şeması
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Doctor Occupancy + Quick EMR Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.95rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                    Hekim &amp; Ünit Doluluk Durumu
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {DOCTORS.map((doc) => {
                      const docCount = patients.filter((p) => p.doctor === doc.name && p.status !== 'İptal Edildi').length;
                      const pct = Math.min(100, Math.round((docCount / TIME_SLOTS.length) * 100) + 28);
                      return (
                        <div key={doc.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                              {doc.name} <span style={{ color: '#64748b' }}>({doc.room})</span>
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: doc.color }}>
                              {docCount} vaka • %{pct}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: doc.color, borderRadius: '999px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedPatient && (
                  <div style={{ background: '#0c1322', border: '1px solid rgba(0,240,255,0.18)', borderRadius: '12px', padding: '0.95rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#00f0ff', fontWeight: 700 }}>SEÇİLİ HASTA ÖZETİ</div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.15rem' }}>
                          {selectedPatient.name} ({selectedPatient.age} yaş)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {selectedPatient.protocolNo} • Kan Grubu: {selectedPatient.bloodType}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('emr')}
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: '0.7rem', padding: '0.28rem 0.6rem' }}
                      >
                        Muayeneyi Aç
                      </button>
                    </div>

                    {selectedPatient.allergies !== 'Bilinen Alerji Yok' && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          background: 'rgba(244, 63, 94, 0.14)',
                          border: '1px solid rgba(244, 63, 94, 0.35)',
                          color: '#fda4af',
                          fontSize: '0.72rem',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <ShieldAlert size={13} color="#f43f5e" /> Kritik Alerji Uyarısı: <strong>{selectedPatient.allergies}</strong>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem', marginTop: '0.75rem' }}>
                      {[
                        { k: 'Tansiyon', v: selectedPatient.vitals.bp },
                        { k: 'Nabız', v: `${selectedPatient.vitals.pulse}` },
                        { k: 'Ateş', v: `${selectedPatient.vitals.temp}°C` },
                        { k: 'SpO2', v: `%${selectedPatient.vitals.spo2}` }
                      ].map((vital) => (
                        <div key={vital.k} style={{ background: '#111a2e', borderRadius: '8px', padding: '0.45rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{vital.k}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{vital.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: INTERACTIVE DOCTOR TIME-SLOT MATRIX */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.95rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>Hekim &amp; Ünit Bazlı Günlük Randevu Matrisi</h4>
                  <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Boş bir slota tıklayarak doğrudan o saat ve hekime yeni hasta randevusu açabilirsiniz.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '640px' }}>
                <thead>
                  <tr style={{ background: '#111a2e', color: '#94a3b8' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', width: '80px' }}>Saat</th>
                    {DOCTORS.map((d) => (
                      <th key={d.name} style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>
                        <span style={{ color: d.color }}>●</span> {d.name} <span style={{ fontWeight: 400, color: '#64748b' }}>({d.room})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00f0ff' }}>{slot}</td>
                      {DOCTORS.map((doc) => {
                        const booking = patients.find((p) => p.doctor === doc.name && p.time === slot && p.status !== 'İptal Edildi');
                        return (
                          <td key={doc.name} style={{ padding: '0.45rem 0.75rem' }}>
                            {booking ? (
                              <div
                                onClick={() => {
                                  setSelectedPatientId(booking.id);
                                  setActiveTab('emr');
                                }}
                                style={{
                                  background: STATUS_META[booking.status].bg,
                                  border: `1px solid ${STATUS_META[booking.status].color}55`,
                                  borderRadius: '8px',
                                  padding: '0.45rem 0.65rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '0.4rem'
                                }}
                              >
                                <div>
                                  <strong style={{ color: '#f8fafc', display: 'block' }}>{booking.name}</strong>
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{booking.complaint.slice(0, 32)}...</span>
                                </div>
                                <span style={{ fontSize: '0.64rem', fontWeight: 700, color: STATUS_META[booking.status].color }}>
                                  {booking.status}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewDoctor(doc.name);
                                  setNewTime(slot);
                                  setShowNewModal(true);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.42rem 0.6rem',
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px dashed rgba(255,255,255,0.12)',
                                  borderRadius: '8px',
                                  color: '#64748b',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                + Müsait — Randevu Ekle
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status Pipeline List */}
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.6rem' }}>Hızlı Randevu Durumu Yönetimi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#111a2e',
                      borderRadius: '8px',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.76rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', marginRight: '0.5rem' }}>{p.time}</strong>
                      <strong style={{ color: '#f8fafc' }}>{p.name}</strong>
                      <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>({p.doctor})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {p.status === 'Beklemede' && (
                        <button type="button" onClick={() => updatePatientStatus(p.id, 'Onaylandı')} className="btn btn-sm btn-secondary" style={{ fontSize: '0.68rem', color: '#10b981' }}>
                          <CheckCircle2 size={12} /> Onayla
                        </button>
                      )}
                      {(p.status === 'Beklemede' || p.status === 'Onaylandı') && (
                        <button type="button" onClick={() => updatePatientStatus(p.id, 'Muayenede')} className="btn btn-sm btn-primary" style={{ fontSize: '0.68rem' }}>
                          Muayeneye Al
                        </button>
                      )}
                      {p.status === 'Muayenede' && (
                        <button type="button" onClick={() => updatePatientStatus(p.id, 'Tamamlandı')} className="btn btn-sm btn-secondary" style={{ fontSize: '0.68rem', color: '#a855f7' }}>
                          Tamamla
                        </button>
                      )}
                      {p.status !== 'İptal Edildi' && p.status !== 'Tamamlandı' && (
                        <button type="button" onClick={() => updatePatientStatus(p.id, 'İptal Edildi')} className="btn btn-sm btn-secondary" style={{ fontSize: '0.68rem', color: '#f43f5e' }}>
                          <XCircle size={12} /> İptal
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE FDI DENTAL CHART (ODONTOGRAM) + CLINICAL SOAP EMR + E-PRESCRIPTION */}
        {activeTab === 'emr' && selectedPatient && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {/* Left Selector & Patient Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>Aktif Hasta Dosyası</span>
                  <select
                    value={selectedPatient.id}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="form-select"
                    style={{ width: 'auto', fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.protocolNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.55 }}>
                  <div><strong style={{ color: '#e2e8f0' }}>Şikayet:</strong> {selectedPatient.complaint}</div>
                  <div>
                    <strong style={{ color: '#e2e8f0' }}>Alerji / Kronik:</strong>{' '}
                    <span style={{ color: selectedPatient.allergies !== 'Bilinen Alerji Yok' ? '#fda4af' : '#10b981' }}>
                      {selectedPatient.allergies}
                    </span>{' '}
                    • {selectedPatient.chronicCondition}
                  </div>
                </div>
              </div>

              {/* Interactive FDI Odontogram */}
              <div style={{ background: '#0c1322', border: '1px solid rgba(0,240,255,0.18)', borderRadius: '12px', padding: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>İnteraktif FDI Dental Odontogram</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Seçili Diş: <strong style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>#{selectedTooth}</strong> — Aşağıdan işlem atayarak tedavi planını güncelleyin.
                    </div>
                  </div>
                </div>

                {/* Upper Arch */}
                <div style={{ fontSize: '0.64rem', color: '#64748b', textAlign: 'center', marginBottom: '0.25rem' }}>ÜST ÇENE (Maksilla • Sağ 18–11 | Sol 21–28)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem', paddingBottom: '0.55rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                  {[...TOOTH_UPPER_RIGHT, ...TOOTH_UPPER_LEFT].map(renderToothButton)}
                </div>

                {/* Lower Arch */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem', paddingTop: '0.55rem' }}>
                  {[...TOOTH_LOWER_RIGHT, ...TOOTH_LOWER_LEFT].map(renderToothButton)}
                </div>
                <div style={{ fontSize: '0.64rem', color: '#64748b', textAlign: 'center', marginTop: '0.25rem' }}>ALT ÇENE (Mandibula • Sağ 48–41 | Sol 31–38)</div>

                {/* Tooth Action Palette */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem' }}>
                    #{selectedTooth} Nolu Dişe İşlem / Tanı Ata:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(Object.keys(TOOTH_CONDITION_META) as ToothCondition[]).map((cond) => {
                      const m = TOOTH_CONDITION_META[cond];
                      const activeCond = (selectedPatient.teethMap[selectedTooth] ?? 'healthy') === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleAssignToothCondition(selectedTooth, cond)}
                          style={{
                            padding: '0.3rem 0.55rem',
                            borderRadius: '7px',
                            fontSize: '0.69rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: activeCond ? m.color : m.bg,
                            color: activeCond ? '#041019' : m.color,
                            border: `1px solid ${m.color}55`
                          }}
                        >
                          {m.label} {m.price > 0 ? `(${m.price}₺)` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Clinical SOAP Notes + ICD-10 + e-Reçete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                  <FileText size={15} color="#00f0ff" /> Klinik Anamnez &amp; ICD-10 Muayene Notu
                </div>

                <label className="form-label" style={{ fontSize: '0.7rem' }}>ICD-10 Tanı Kodu</label>
                <input
                  type="text"
                  value={selectedPatient.icdCode}
                  onChange={(e) => handleUpdateSoap('icdCode', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.76rem', marginBottom: '0.6rem', padding: '0.42rem 0.65rem' }}
                />

                <label className="form-label" style={{ fontSize: '0.7rem' }}>Hekim Klinik Bulguları &amp; Tedavi Planı</label>
                <textarea
                  rows={3}
                  value={selectedPatient.soapNote}
                  onChange={(e) => handleUpdateSoap('soapNote', e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.76rem', padding: '0.5rem 0.65rem', resize: 'vertical' }}
                />

                <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Değişiklikler hasta kartına anlık işlenir</span>
                  {selectedPatient.status !== 'Tamamlandı' && (
                    <button
                      type="button"
                      onClick={() => updatePatientStatus(selectedPatient.id, 'Tamamlandı')}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Muayeneyi Tamamla &amp; Faturaya Aktar
                    </button>
                  )}
                </div>
              </div>

              {/* e-Reçete Module */}
              <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                  <Pill size={15} color="#a855f7" /> Elektronik Reçete (e-Reçete) Modülü
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                  {QUICK_DRUGS.map((qd) => (
                    <button
                      key={qd.drug}
                      type="button"
                      onClick={() => {
                        setRxDrug(qd.drug);
                        setRxDosage(qd.dosage);
                        setRxNote(qd.instructions);
                      }}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.67rem', padding: '0.22rem 0.5rem' }}
                    >
                      + {qd.drug.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={rxDrug}
                    onChange={(e) => setRxDrug(e.target.value)}
                    placeholder="İlaç adı"
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.38rem 0.6rem' }}
                  />
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    placeholder="Doz (2x1)"
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.38rem 0.6rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={rxNote}
                    onChange={(e) => setRxNote(e.target.value)}
                    placeholder="Kullanım talimatı..."
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.38rem 0.6rem' }}
                  />
                  <button type="button" onClick={handleAddPrescription} className="btn btn-sm btn-purple" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    Reçeteye Ekle
                  </button>
                </div>

                {selectedPatient.prescriptions.length === 0 ? (
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Henüz yazılmış ilaç bulunmuyor.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedPatient.prescriptions.map((rx) => (
                      <div key={rx.id} style={{ background: '#111a2e', borderRadius: '8px', padding: '0.5rem 0.7rem', fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#e2e8f0' }}>{rx.drug}</strong>{' '}
                          <span style={{ color: '#a855f7', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>({rx.dosage})</span>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{rx.instructions}</div>
                        </div>
                        <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>e-Reçete</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BILLING & E-SMM INVOICING */}
        {activeTab === 'billing' && selectedPatient && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    Hasta Tedavi Hesabı — {selectedPatient.name}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Protokol: {selectedPatient.protocolNo}</p>
                </div>
                <select
                  value={selectedPatient.id}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.74rem', padding: '0.28rem 0.6rem' }}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {selectedPatient.billing.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#111a2e',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#e2e8f0' }}>{item.title}</strong>
                      {item.receiptNo && (
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                          Makbuz No: {item.receiptNo}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                        ₺{item.amount.toLocaleString('tr-TR')}
                      </div>
                      <span style={{ fontSize: '0.66rem', color: item.paid ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                        {item.paid ? 'Tahsil Edildi' : 'Ödeme Bekliyor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#0c1322', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                  GİB e-SMM / e-Fatura Tahsilat Özeti
                </h4>

                {(() => {
                  const pending = selectedPatient.billing.filter((b) => !b.paid).reduce((s, x) => s + x.amount, 0);
                  const discount = Math.round(pending * (selectedPatient.insuranceDiscountPct / 100));
                  const netDue = pending - discount;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Açık İşlem Toplamı:</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₺{pending.toLocaleString('tr-TR')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Kurumsal / Sigorta İndirimi (%{selectedPatient.insuranceDiscountPct}):</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>-₺{discount.toLocaleString('tr-TR')}</span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
                        <span>Ödenecek Net Tutar:</span>
                        <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>₺{netDue.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['Kredi Kartı', 'Nakit', 'Havale/EFT'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`btn btn-sm ${paymentMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.7rem', padding: '0.32rem' }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={selectedPatient.billing.every((b) => b.paid)}
                  onClick={() => handleCollectPayment(selectedPatient.id)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Receipt size={14} /> Tahsil Et &amp; e-SMM Makbuzu Kes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SMS & WHATSAPP AUTOMATION LOGS */}
        {activeTab === 'sms' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                Tekil Bildirim / Randevu Hatırlatma Gönder
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <select
                  value={selectedPatient?.id ?? ''}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="form-select"
                  style={{ fontSize: '0.76rem' }}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['WhatsApp', 'SMS'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSmsChannel(ch)}
                      className={`btn btn-sm ${smsChannel === ch ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.72rem' }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={smsDraft}
                  onChange={(e) => setSmsDraft(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.76rem' }}
                />

                <button type="button" onClick={handleSendManualSms} className="btn btn-primary btn-sm">
                  <Send size={13} /> {smsChannel} Gönder
                </button>
              </div>
            </div>

            <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem' }}>
                Gönderilen Otomatik Bildirim Geçmişi ({smsLogs.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {smsLogs.map((log) => (
                  <div key={log.id} style={{ background: '#111a2e', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#e2e8f0' }}>
                        {log.recipient} <span style={{ color: '#64748b', fontWeight: 400 }}>({log.phone})</span>
                      </strong>
                      <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                        {log.channel} • {log.sentAt}
                      </span>
                    </div>
                    <div style={{ color: '#94a3b8' }}>{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Patient & Appointment */}
      {showNewModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(4, 8, 16, 0.78)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <form
            onSubmit={handleCreateAppointment}
            style={{
              background: '#0d1526',
              border: '1px solid rgba(0,240,255,0.35)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '470px',
              padding: '1.25rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.65)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Plus size={16} color="#00f0ff" /> Yeni Hasta Kabul &amp; Randevu Oluştur
              </h4>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Kapat
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label">Hasta Adı Soyadı</label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Örn: Zeynep Kaya" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Yaş</label>
                  <input type="number" min="1" max="110" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label"><Phone size={11} style={{ display: 'inline' }} /> Telefon</label>
                  <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Alerji Uyarısı</label>
                  <input type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label">Hekim &amp; Poliklinik</label>
                  <select value={newDoctor} onChange={(e) => setNewDoctor(e.target.value)} className="form-select">
                    {DOCTORS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Saat</label>
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="form-select">
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Başvuru Şikayeti / Not</label>
                <input
                  type="text"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Örn: Sağ alt azı dişinde ağrı ve kanal kontrolü"
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.4rem' }}>
                Kaydet ve WhatsApp Onayı Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Plus,
  Search,
  Send,
  Sparkles,
  UserCog,
  Users,
  X
} from 'lucide-react';

type ImpressionType = 'conventional' | 'digital';
type ProsthesisType =
  | 'zirconia'
  | 'implant_supported'
  | 'removable_denture'
  | 'laminate_veneer'
  | 'metal_porcelain';

type JobStatus =
  | 'pending'
  | 'digital_scan_received'
  | 'lab_received_model'
  | 'cad_design'
  | 'cam_milling_3d_print'
  | 'metal_framework_try_in'
  | 'zirconia_framework_try_in'
  | 'wax_try_in'
  | 'dentin_try_in'
  | 'glaze_polish'
  | 'completed'
  | 'delivered';

interface ProtezJob {
  id: string;
  caseCode: string;
  patient_name: string;
  doctor_name: string;
  prosthesis_type: ProsthesisType;
  due_date: string;
  isUrgentTomorrow: boolean;
  status: JobStatus;
  impression_type: ImpressionType;
  vita_shade: string;
  tooth_numbers: number[];
  medical_notes?: string;
}

interface ActionLog {
  id: string;
  job_id: string;
  action_type: 'JOB_CREATED' | 'STATUS_CHANGED' | 'NOTE_ADDED';
  description: string;
  created_at: string;
  performed_by: string;
}

const CONVENTIONAL_STAGES: { status: JobStatus; label: string }[] = [
  { status: 'pending', label: 'Ölçü Alındı / Bekliyor' },
  { status: 'lab_received_model', label: 'Laboratuvarda / Model' },
  { status: 'metal_framework_try_in', label: 'Metal / Altyapı Provası' },
  { status: 'wax_try_in', label: 'Mumlu Kapanış Provası' },
  { status: 'dentin_try_in', label: 'Dentin / Renk Provası' },
  { status: 'glaze_polish', label: 'Cila & Glaze' },
  { status: 'completed', label: 'Tamamlandı' },
  { status: 'delivered', label: 'Kliniğe Teslim Edildi' }
];

const DIGITAL_STAGES: { status: JobStatus; label: string }[] = [
  { status: 'digital_scan_received', label: 'Dijital Tarama Bekliyor' },
  { status: 'cad_design', label: 'CAD Tasarım Aşaması' },
  { status: 'cam_milling_3d_print', label: 'CAM Kazıma / 3D Baskı' },
  { status: 'zirconia_framework_try_in', label: 'Zirkonyum / Altyapı Provası' },
  { status: 'dentin_try_in', label: 'Dentin / Renk Provası' },
  { status: 'glaze_polish', label: 'Cila & Glaze' },
  { status: 'completed', label: 'Tamamlandı' },
  { status: 'delivered', label: 'Kliniğe Teslim Edildi' }
];

const PROSTHESIS_LABELS: Record<ProsthesisType, string> = {
  zirconia: 'Zirkonyum Kuron/Köprü',
  metal_porcelain: 'Metal Destekli Porselen',
  implant_supported: 'İmplant Üstü Protez',
  removable_denture: 'Hareketli Total/Parsiyel Protez',
  laminate_veneer: 'Laminate Veneer'
};

const QUICK_FDI_TEETH = [11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 26, 36, 37, 46, 47];

const INITIAL_JOBS: ProtezJob[] = [
  {
    id: '1',
    caseCode: 'ADSP-2601',
    patient_name: 'Ahmet Yılmaz',
    doctor_name: 'Dt. Kadir Kurt',
    prosthesis_type: 'zirconia',
    due_date: 'Yarın (09:30)',
    isUrgentTomorrow: true,
    status: 'cad_design',
    impression_type: 'digital',
    vita_shade: 'A2',
    tooth_numbers: [11, 21],
    medical_notes: 'Ön bölge estetik monolitik zirkonyum — insizal şeffaflık yüksek tutulsun.'
  },
  {
    id: '2',
    caseCode: 'ADSP-2602',
    patient_name: 'Ayşe Demir',
    doctor_name: 'Dt. Selin Kaya',
    prosthesis_type: 'metal_porcelain',
    due_date: '2 Gün Sonra',
    isUrgentTomorrow: false,
    status: 'lab_received_model',
    impression_type: 'conventional',
    vita_shade: 'B1',
    tooth_numbers: [36, 37],
    medical_notes: 'Alt çene arka köprü metal altyapı dökümü ve marjin uyumu kontrolü.'
  },
  {
    id: '3',
    caseCode: 'ADSP-2603',
    patient_name: 'Mehmet Kaya',
    doctor_name: 'Dt. Kadir Kurt',
    prosthesis_type: 'implant_supported',
    due_date: 'Yarın (14:00)',
    isUrgentTomorrow: true,
    status: 'zirconia_framework_try_in',
    impression_type: 'digital',
    vita_shade: 'A1',
    tooth_numbers: [14, 15, 16],
    medical_notes: 'Ti-Base abutment üzeri vidalı zirkonyum köprü.'
  },
  {
    id: '4',
    caseCode: 'ADSP-2604',
    patient_name: 'Fatma Kara',
    doctor_name: 'Dt. Caner Eren',
    prosthesis_type: 'removable_denture',
    due_date: '3 Gün Sonra',
    isUrgentTomorrow: false,
    status: 'wax_try_in',
    impression_type: 'conventional',
    vita_shade: 'A3',
    tooth_numbers: [11, 12, 13, 21, 22, 23],
    medical_notes: 'Üst çene tam protez mumlu dikey boyut & gülüş hattı provası.'
  },
  {
    id: '5',
    caseCode: 'ADSP-2605',
    patient_name: 'Deniz Aksoy',
    doctor_name: 'Dt. Kadir Kurt',
    prosthesis_type: 'laminate_veneer',
    due_date: 'Teslim Edildi',
    isUrgentTomorrow: false,
    status: 'delivered',
    impression_type: 'digital',
    vita_shade: 'BL2',
    tooth_numbers: [11, 12, 21, 22],
    medical_notes: 'Ultra ince E-max yaprak porselen seti sorunsuz yapıştırıldı.'
  }
];

const INITIAL_LOGS: ActionLog[] = [
  {
    id: '101',
    job_id: '1',
    action_type: 'JOB_CREATED',
    description: 'Dt. Kadir Kurt dijital zirkonyum iş emri (ADSP-2601) oluşturdu.',
    created_at: '18.11.2026 • 09:15',
    performed_by: 'Dt. Kadir Kurt'
  },
  {
    id: '102',
    job_id: '2',
    action_type: 'STATUS_CHANGED',
    description: "Ali Can (Teknisyen) işi 'Ölçü Alındı' aşamasından 'Laboratuvarda / Model' aşamasına güncelledi.",
    created_at: '18.11.2026 • 11:40',
    performed_by: 'Ali Can (Teknisyen)'
  },
  {
    id: '103',
    job_id: '3',
    action_type: 'STATUS_CHANGED',
    description: 'CAM kazıma tamamlandı; Zirkonyum / Altyapı Provası aşamasına geçirildi.',
    created_at: '18.11.2026 • 15:20',
    performed_by: 'Ali Can (Teknisyen)'
  }
];

export default function ProtezTakipApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [roleView, setRoleView] = useState<'clinic' | 'technician'>('clinic');
  const [activeTab, setActiveTab] = useState<ImpressionType>('digital');
  const [jobs, setJobs] = useState<ProtezJob[]>(INITIAL_JOBS);
  const [logs, setLogs] = useState<ActionLog[]>(INITIAL_LOGS);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [prosthesisFilter, setProsthesisFilter] = useState<'all' | ProsthesisType>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [drawerNoteDraft, setDrawerNoteDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // New Case Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newImpression, setNewImpression] = useState<ImpressionType>('digital');
  const [newProsthesis, setNewProsthesis] = useState<ProsthesisType>('zirconia');
  const [newShade, setNewShade] = useState('A2');
  const [newSelectedTeeth, setNewSelectedTeeth] = useState<number[]>([11, 21]);
  const [newDueOffset, setNewDueOffset] = useState('1');
  const [newNotes, setNewNotes] = useState('');

  const stages = activeTab === 'conventional' ? CONVENTIONAL_STAGES : DIGITAL_STAGES;

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((j) => {
      if (j.impression_type !== activeTab) return false;
      if (prosthesisFilter !== 'all' && j.prosthesis_type !== prosthesisFilter) return false;
      if (urgentOnly && (!j.isUrgentTomorrow || j.status === 'delivered')) return false;
      if (!q) return true;
      return (
        j.patient_name.toLowerCase().includes(q) ||
        j.caseCode.toLowerCase().includes(q) ||
        j.tooth_numbers.join(',').includes(q)
      );
    });
  }, [jobs, activeTab, prosthesisFilter, urgentOnly, searchQuery]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const dueTomorrowJobs = jobs.filter((j) => j.status !== 'delivered' && j.isUrgentTomorrow);

  const metrics = useMemo(() => {
    const active = jobs.filter((j) => j.status !== 'delivered').length;
    const digitalCount = jobs.filter((j) => j.impression_type === 'digital').length;
    const digitalPct = Math.round((digitalCount / Math.max(1, jobs.length)) * 100);
    const deliveredCount = jobs.filter((j) => j.status === 'delivered').length;
    return { active, urgent: dueTomorrowJobs.length, digitalPct, deliveredCount };
  }, [jobs, dueTomorrowJobs.length]);

  const formatNow = () => {
    const d = new Date();
    return `${d.toLocaleDateString('tr-TR')} • ${d.toTimeString().slice(0, 5)}`;
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;
    const stageLabel =
      [...CONVENTIONAL_STAGES, ...DIGITAL_STAGES].find((s) => s.status === newStatus)?.label ?? newStatus;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    setLogs((prev) => [
      {
        id: String(Date.now()),
        job_id: jobId,
        action_type: 'STATUS_CHANGED',
        description: `Ali Can (Teknisyen) ${target.patient_name} (${target.caseCode}) vakasını '${stageLabel}' aşamasına taşıdı.`,
        created_at: formatNow(),
        performed_by: 'Ali Can (Teknisyen)'
      },
      ...prev
    ]);
    setToast(`${target.patient_name} (${target.caseCode}) '${stageLabel}' aşamasına alındı.`);
  };

  const handleAddDrawerNote = () => {
    if (!selectedJob || !drawerNoteDraft.trim()) return;
    const actor = roleView === 'clinic' ? 'Dt. Kadir Kurt (Hekim)' : 'Ali Can (Teknisyen)';
    setLogs((prev) => [
      {
        id: String(Date.now()),
        job_id: selectedJob.id,
        action_type: 'NOTE_ADDED',
        description: drawerNoteDraft.trim(),
        created_at: formatNow(),
        performed_by: actor
      },
      ...prev
    ]);
    setDrawerNoteDraft('');
    setToast(`${selectedJob.caseCode} işlem kronolojisine not eklendi.`);
  };

  const toggleNewTooth = (num: number) => {
    setNewSelectedTeeth((prev) => (prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num].sort((a, b) => a - b)));
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;
    const initialStatus: JobStatus = newImpression === 'conventional' ? 'pending' : 'digital_scan_received';
    const nextId = String(Date.now());
    const caseCode = `ADSP-${String(2606 + jobs.length)}`;

    const created: ProtezJob = {
      id: nextId,
      caseCode,
      patient_name: newPatientName.trim(),
      doctor_name: 'Dt. Kadir Kurt',
      prosthesis_type: newProsthesis,
      impression_type: newImpression,
      vita_shade: newShade,
      due_date: newDueOffset === '1' ? 'Yarın (Acil)' : `${newDueOffset} Gün Sonra`,
      isUrgentTomorrow: newDueOffset === '1',
      status: initialStatus,
      tooth_numbers: newSelectedTeeth.length > 0 ? newSelectedTeeth : [11],
      medical_notes: newNotes.trim() || undefined
    };

    setJobs((prev) => [created, ...prev]);
    setLogs((prev) => [
      {
        id: String(Date.now() + 1),
        job_id: created.id,
        action_type: 'JOB_CREATED',
        description: `Dt. Kadir Kurt ${created.patient_name} (${caseCode}) için ${PROSTHESIS_LABELS[created.prosthesis_type]} iş emri oluşturdu.`,
        created_at: formatNow(),
        performed_by: 'Dt. Kadir Kurt'
      },
      ...prev
    ]);
    setActiveTab(newImpression);
    setSelectedJobId(created.id);
    setNewPatientName('');
    setNewNotes('');
    setIsNewModalOpen(false);
    setToast(`${caseCode} — ${created.patient_name} iş emri laboratuvara gönderildi.`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullHeight ? 'none' : '1px solid var(--border-subtle)',
        background: '#060a14',
        color: '#f8fafc',
        minHeight: fullHeight ? '100vh' : '680px',
        position: 'relative'
      }}
    >
      {/* Top Role Switcher & GitHub/Vercel Header */}
      <header
        style={{
          background: 'linear-gradient(90deg, #0b1322 0%, #101b2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(0,240,255,0.22))',
              border: '1px solid rgba(99,102,241,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Layers size={19} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ color: '#fff', fontSize: '0.98rem' }}>
                ADSP Protez Takip &amp; CAD/CAM Laboratuvar OS
              </strong>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: roleView === 'clinic' ? '#00f0ff' : '#fbbf24',
                  fontWeight: 700,
                  background: roleView === 'clinic' ? 'rgba(0,240,255,0.1)' : 'rgba(245,158,11,0.14)',
                  border: `1px solid ${roleView === 'clinic' ? 'rgba(0,240,255,0.35)' : 'rgba(245,158,11,0.35)'}`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px'
                }}
              >
                {roleView === 'clinic' ? 'Klinik Hekim Görünümü' : 'Teknisyen Laboratuvar Görünümü'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              8 Aşamalı Konvansiyonel &amp; Dijital İş Akışı • VITA Renk Takibi • Canlı İşlem Kronolojisi
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => setRoleView('clinic')}
            className={`btn btn-sm ${roleView === 'clinic' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.73rem', padding: '0.38rem 0.75rem' }}
          >
            <Users size={13} /> Hekim / Klinik
          </button>
          <button
            type="button"
            onClick={() => setRoleView('technician')}
            className={`btn btn-sm ${roleView === 'technician' ? 'btn-purple' : 'btn-secondary'}`}
            style={{ fontSize: '0.73rem', padding: '0.38rem 0.75rem' }}
          >
            <UserCog size={13} /> Laboratuvar Teknisyeni
          </button>

          {roleView === 'clinic' && (
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.73rem', padding: '0.38rem 0.75rem' }}
            >
              <Plus size={13} /> Yeni Vaka Emri
            </button>
          )}

          <a
            href={
              roleView === 'clinic'
                ? 'https://protez-takip-sistemi-adsp.vercel.app/dashboard/clinic'
                : 'https://protez-takip-sistemi-adsp.vercel.app/dashboard/technician'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.71rem', padding: '0.38rem 0.65rem', color: '#34d399', borderColor: 'rgba(16,185,129,0.35)' }}
          >
            <ExternalLink size={12} /> Canlı Vercel
          </a>
        </div>
      </header>

      {/* KPI Strip */}
      <div style={{ padding: '0.85rem 1.25rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem' }}>
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.68rem 0.85rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Aktif Üretimdeki Vakalar</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{metrics.active}</div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Toplam {jobs.length} iş emri</div>
        </div>
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.68rem 0.85rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Acil (Yarın Teslim)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>{metrics.urgent}</div>
          <div style={{ fontSize: '0.65rem', color: '#fda4af' }}>Öncelikli üretim</div>
        </div>
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.68rem 0.85rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Dijital CAD/CAM Payı</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>%{metrics.digitalPct}</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>3D İntraoral Tarama</div>
        </div>
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.68rem 0.85rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Teslim Edilen Vakalar</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{metrics.deliveredCount}</div>
          <div style={{ fontSize: '0.65rem', color: '#10b981' }}>Klinik onayı tamam</div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            margin: '0.7rem 1.25rem 0',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            borderRadius: '10px',
            padding: '0.5rem 0.85rem',
            fontSize: '0.76rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} color="#10b981" /> {toast}
          </span>
          <button type="button" onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.72rem' }}>
            Kapat
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: '0.9rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* TomorrowDueAlert */}
        {dueTomorrowJobs.length > 0 && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderLeft: '4px solid #f43f5e',
              padding: '0.75rem 1rem',
              borderRadius: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <AlertTriangle size={16} color="#f43f5e" />
                <strong style={{ color: '#fda4af', fontSize: '0.84rem' }}>
                  ACİL TESLİMAT UYARISI: Yarın Kliniğe Gidecek {dueTomorrowJobs.length} İş Var!
                </strong>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Kartlara tıklayarak detay çekmecesini açın</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              {dueTomorrowJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setActiveTab(job.impression_type);
                    setSelectedJobId(job.id);
                  }}
                  style={{
                    background: '#0c1322',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f8fafc' }}>
                      {job.patient_name} <span style={{ color: '#64748b', fontSize: '0.68rem' }}>({job.caseCode})</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {PROSTHESIS_LABELS[job.prosthesis_type]} • {job.vita_shade}
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.66rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    <Clock size={11} /> YARIN
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban Board Controls */}
        <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.65rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('digital')}
                className={`btn btn-sm ${activeTab === 'digital' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
              >
                Dijital İş Akışı ({jobs.filter((j) => j.impression_type === 'digital').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conventional')}
                className={`btn btn-sm ${activeTab === 'conventional' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
              >
                Konvansiyonel İş Akışı ({jobs.filter((j) => j.impression_type === 'conventional').length})
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} color="#64748b" style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hasta, kod veya diş no..."
                  className="form-input"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem 0.3rem 1.65rem', width: '175px' }}
                />
              </div>

              <select
                value={prosthesisFilter}
                onChange={(e) => setProsthesisFilter(e.target.value as typeof prosthesisFilter)}
                className="form-select"
                style={{ width: 'auto', fontSize: '0.72rem', padding: '0.3rem 0.55rem' }}
              >
                <option value="all">Tüm Protez Tipleri</option>
                {(Object.keys(PROSTHESIS_LABELS) as ProsthesisType[]).map((pt) => (
                  <option key={pt} value={pt}>{PROSTHESIS_LABELS[pt]}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setUrgentOnly((v) => !v)}
                className={`btn btn-sm ${urgentOnly ? 'btn-danger' : 'btn-secondary'}`}
                style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
              >
                {urgentOnly ? 'Yalnızca Aciller ✓' : 'Sadece Acil Teslim'}
              </button>
            </div>
          </div>

          {/* Horizontal Kanban Columns */}
          <div style={{ display: 'flex', gap: '0.7rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {stages.map((stage, stageIdx) => {
              const colJobs = filteredJobs.filter((j) => j.status === stage.status);
              return (
                <div
                  key={stage.status}
                  style={{
                    width: '245px',
                    flexShrink: 0,
                    background: '#080d18',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: '0.55rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px 10px 0 0' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1' }}>{stage.label}</span>
                    <span style={{ background: 'rgba(0,240,255,0.12)', color: '#00f0ff', fontSize: '0.68rem', fontWeight: 700, padding: '0.08rem 0.45rem', borderRadius: '999px' }}>
                      {colJobs.length}
                    </span>
                  </div>

                  <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '115px' }}>
                    {colJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        style={{
                          background: '#0e172a',
                          border: selectedJobId === job.id ? '1.5px solid #00f0ff' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>{job.caseCode}</span>
                          {job.isUrgentTomorrow && job.status !== 'delivered' && (
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b' }}>⏰ {job.due_date}</span>
                          )}
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                          {job.patient_name}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                          <span style={{ background: 'rgba(0,240,255,0.12)', color: '#00f0ff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                            {PROSTHESIS_LABELS[job.prosthesis_type].split(' ')[0]}
                          </span>
                          <span style={{ fontWeight: 700, color: '#fda4af' }}>VITA: {job.vita_shade}</span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          Diş No: <strong style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{job.tooth_numbers.join(', ')}</strong>
                        </div>

                        {roleView === 'technician' && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', gap: '0.3rem' }}>
                            {stageIdx > 0 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(job.id, stages[stageIdx - 1].status);
                                }}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.64rem', padding: '0.2rem 0.45rem' }}
                              >
                                <ArrowLeft size={10} /> Geri
                              </button>
                            ) : <span />}

                            {stageIdx < stages.length - 1 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(job.id, stages[stageIdx + 1].status);
                                }}
                                className="btn btn-sm btn-primary"
                                style={{ fontSize: '0.64rem', padding: '0.2rem 0.5rem' }}
                              >
                                İlerlet <ArrowRight size={10} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.66rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                                <CheckCircle2 size={11} /> Teslimde
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {colJobs.length === 0 && (
                      <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b' }}>
                        Aşamada vaka yok
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Slide-Over Drawer: Case Detail + ActionTimeline */}
      {selectedJob && (
        <aside
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '360px',
            maxWidth: '94%',
            background: '#0b1220',
            borderLeft: '1px solid rgba(0,240,255,0.3)',
            boxShadow: '-12px 0 36px rgba(0,0,0,0.6)',
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '0.9rem 1rem', background: '#111a2e', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                {selectedJob.patient_name} <span style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>{selectedJob.caseCode}</span>
              </h4>
              <div style={{ fontSize: '0.72rem', color: roleView === 'technician' ? '#fbbf24' : '#94a3b8' }}>
                {selectedJob.doctor_name} • {selectedJob.due_date}
              </div>
            </div>
            <button type="button" onClick={() => setSelectedJobId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <div style={{ background: '#111a2e', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.76rem', color: '#cbd5e1' }}>
              <div style={{ marginBottom: '0.35rem' }}>Protez Tipi: <strong style={{ color: '#fff' }}>{PROSTHESIS_LABELS[selectedJob.prosthesis_type]}</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>Ölçü Tipi: <strong>{selectedJob.impression_type === 'digital' ? 'Dijital Tarama (STL)' : 'Konvansiyonel Ölçü'}</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>VITA Renk Skalası: <strong style={{ color: '#fda4af' }}>{selectedJob.vita_shade}</strong></div>
              <div>Diş Numaraları: <strong style={{ color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>{selectedJob.tooth_numbers.join(', ')}</strong></div>
              {selectedJob.medical_notes && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  <strong>Not:</strong> {selectedJob.medical_notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={drawerNoteDraft}
                onChange={(e) => setDrawerNoteDraft(e.target.value)}
                placeholder="Kronolojiye vaka notu ekle..."
                className="form-input"
                style={{ fontSize: '0.74rem', padding: '0.38rem 0.6rem' }}
              />
              <button type="button" onClick={handleAddDrawerNote} className="btn btn-sm btn-primary" style={{ padding: '0.38rem 0.65rem' }}>
                <Send size={12} />
              </button>
            </div>

            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={14} color="#00f0ff" /> Canlı İşlem Kronolojisi
            </h5>

            <div style={{ borderLeft: '2px solid rgba(0,240,255,0.3)', marginLeft: '0.4rem', paddingLeft: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {logs
                .filter((l) => l.job_id === selectedJob.id || logs.length <= 4)
                .map((log) => (
                  <div key={log.id} style={{ background: '#0e172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#00f0ff' }}>{log.performed_by}</strong>
                      <span style={{ color: '#64748b' }}>{log.created_at}</span>
                    </div>
                    <p style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.45, margin: 0 }}>{log.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      )}

      {/* New Job Modal (Clinic View) */}
      {isNewModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(4,8,16,0.78)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <form
            onSubmit={handleCreateJob}
            style={{
              background: '#0d1526',
              border: '1px solid rgba(0,240,255,0.35)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '470px',
              padding: '1.25rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f8fafc' }}>Yeni Protez İş Emri Oluştur</h4>
              <button type="button" onClick={() => setIsNewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.78rem' }}>
              <div>
                <label className="form-label">Hasta Adı Soyadı</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Zeynep Aydın"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label">Ölçü Tipi</label>
                  <select value={newImpression} onChange={(e) => setNewImpression(e.target.value as ImpressionType)} className="form-select">
                    <option value="digital">Dijital Tarama (STL)</option>
                    <option value="conventional">Konvansiyonel Ölçü</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Protez Tipi</label>
                  <select value={newProsthesis} onChange={(e) => setNewProsthesis(e.target.value as ProsthesisType)} className="form-select">
                    <option value="zirconia">Zirkonyum</option>
                    <option value="metal_porcelain">Metal Porselen</option>
                    <option value="implant_supported">İmplant Üstü</option>
                    <option value="removable_denture">Hareketli Protez</option>
                    <option value="laminate_veneer">Laminate Veneer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="form-label">VITA Renk Skalası</label>
                  <select value={newShade} onChange={(e) => setNewShade(e.target.value)} className="form-select">
                    {['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'BL2'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Teslim Önceliği</label>
                  <select value={newDueOffset} onChange={(e) => setNewDueOffset(e.target.value)} className="form-select">
                    <option value="1">Yarın (Acil)</option>
                    <option value="2">2 Gün Sonra</option>
                    <option value="4">4 Gün Sonra</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">FDI Diş Numaraları ({newSelectedTeeth.join(', ') || 'Seçiniz'})</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
                  {QUICK_FDI_TEETH.map((t) => {
                    const active = newSelectedTeeth.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleNewTooth(t)}
                        style={{
                          padding: '0.22rem 0.42rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: active ? '#00f0ff' : '#111a2e',
                          color: active ? '#041019' : '#94a3b8',
                          border: active ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Hekim Teknik Notu</label>
                <input
                  type="text"
                  placeholder="Marjin bitimi, renk detayı vb..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.3rem' }}>
                İş Emrini Laboratuvara Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

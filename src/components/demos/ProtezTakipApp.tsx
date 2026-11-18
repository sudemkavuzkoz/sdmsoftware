'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Plus,
  Users,
  UserCog,
  Activity,
  ExternalLink,
  X,
  ArrowRight
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
  patient_name: string;
  prosthesis_type: ProsthesisType;
  due_date: string;
  status: JobStatus;
  impression_type: ImpressionType;
  vita_shade: string;
  tooth_numbers: number[];
  medical_notes?: string;
}

interface ActionLog {
  id: string;
  job_id: string;
  action_type: 'JOB_CREATED' | 'STATUS_CHANGED';
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

function offsetIsoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function getInitialJobs(): ProtezJob[] {
  return [
    {
      id: '1',
      patient_name: 'Ahmet Yılmaz',
      prosthesis_type: 'zirconia',
      due_date: offsetIsoDate(1),
      status: 'cad_design',
      impression_type: 'digital',
      vita_shade: 'A2',
      tooth_numbers: [11, 21],
      medical_notes: 'Ön bölge estetik zirkonyum — yarın provaya hazır olmalı.'
    },
    {
      id: '2',
      patient_name: 'Ayşe Demir',
      prosthesis_type: 'metal_porcelain',
      due_date: offsetIsoDate(2),
      status: 'lab_received_model',
      impression_type: 'conventional',
      vita_shade: 'B1',
      tooth_numbers: [36, 37],
      medical_notes: 'Alt çene arka köprü metal altyapı.'
    },
    {
      id: '3',
      patient_name: 'Mehmet Kaya',
      prosthesis_type: 'implant_supported',
      due_date: offsetIsoDate(1),
      status: 'zirconia_framework_try_in',
      impression_type: 'digital',
      vita_shade: 'A1',
      tooth_numbers: [14, 15, 16],
      medical_notes: 'İmplant üstü vidalı zirkonyum restorasyon.'
    },
    {
      id: '4',
      patient_name: 'Fatma Kara',
      prosthesis_type: 'removable_denture',
      due_date: offsetIsoDate(3),
      status: 'wax_try_in',
      impression_type: 'conventional',
      vita_shade: 'A3',
      tooth_numbers: [11, 12, 13, 21, 22, 23],
      medical_notes: 'Üst çene tam protez mumlu kapanış kontrolü.'
    }
  ];
}

function getInitialLogs(): ActionLog[] {
  return [
    {
      id: '101',
      job_id: '1',
      action_type: 'JOB_CREATED',
      description: 'Dt. Kadir Kurt (doctor) yeni dijital zirkonyum iş emri oluşturdu.',
      created_at: offsetIsoDate(-2),
      performed_by: 'Dt. Kadir Kurt'
    },
    {
      id: '102',
      job_id: '2',
      action_type: 'STATUS_CHANGED',
      description: "Ali Can (technician) iş durumunu 'pending' aşamasından 'lab_received_model' aşamasına güncelledi.",
      created_at: offsetIsoDate(-1),
      performed_by: 'Ali Can'
    }
  ];
}

export default function ProtezTakipApp({ fullHeight = false }: { fullHeight?: boolean }) {
  const [roleView, setRoleView] = useState<'clinic' | 'technician'>('clinic');
  const [activeTab, setActiveTab] = useState<ImpressionType>('digital');
  const [jobs, setJobs] = useState<ProtezJob[]>(getInitialJobs);
  const [logs, setLogs] = useState<ActionLog[]>(getInitialLogs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Yeni Vaka Modalı
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newImpression, setNewImpression] = useState<ImpressionType>('digital');
  const [newProsthesis, setNewProsthesis] = useState<ProsthesisType>('zirconia');
  const [newShade, setNewShade] = useState('A2');
  const [newTeeth, setNewTeeth] = useState('11, 21');
  const [newDueOffset, setNewDueOffset] = useState('1');
  const [newNotes, setNewNotes] = useState('');

  const stages = activeTab === 'conventional' ? CONVENTIONAL_STAGES : DIGITAL_STAGES;
  const filteredJobs = jobs.filter((j) => j.impression_type === activeTab);
  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  // TomorrowDueAlert logic from protez-takip-sistemi-adsp
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
  const dueTomorrowJobs = jobs.filter(
    (j) => j.status !== 'delivered' && new Date(j.due_date).toISOString().split('T')[0] === tomorrowDateStr
  );

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    setLogs((prev) => [
      {
        id: String(Date.now()),
        job_id: jobId,
        action_type: 'STATUS_CHANGED',
        description: `Ali Can (technician) ${target.patient_name} vakasını '${target.status}' aşamasından '${newStatus}' aşamasına ilerletti.`,
        created_at: new Date().toISOString(),
        performed_by: 'Ali Can (Teknisyen)'
      },
      ...prev
    ]);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;
    const initialStatus: JobStatus = newImpression === 'conventional' ? 'pending' : 'digital_scan_received';
    const parsedTeeth = newTeeth
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    const created: ProtezJob = {
      id: String(Date.now()),
      patient_name: newPatientName.trim(),
      prosthesis_type: newProsthesis,
      impression_type: newImpression,
      vita_shade: newShade,
      due_date: offsetIsoDate(parseInt(newDueOffset, 10) || 1),
      status: initialStatus,
      tooth_numbers: parsedTeeth.length > 0 ? parsedTeeth : [11],
      medical_notes: newNotes.trim() || undefined
    };

    setJobs((prev) => [created, ...prev]);
    setLogs((prev) => [
      {
        id: String(Date.now() + 1),
        job_id: created.id,
        action_type: 'JOB_CREATED',
        description: `Dt. Kadir Kurt (doctor) ${created.patient_name} için ${PROSTHESIS_LABELS[created.prosthesis_type]} iş emri oluşturdu.`,
        created_at: new Date().toISOString(),
        performed_by: 'Dt. Kadir Kurt'
      },
      ...prev
    ]);
    setActiveTab(newImpression);
    setNewPatientName('');
    setNewNotes('');
    setIsNewModalOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: fullHeight ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullHeight ? 'none' : '1px solid rgba(148,163,184,0.2)',
        background: '#f8fafc',
        color: '#0f172a',
        minHeight: fullHeight ? '100vh' : '640px',
        position: 'relative'
      }}
    >
      {/* Top Role Switcher & GitHub/Vercel Header */}
      <div
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '0.7rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#fff', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
            KADİR KURT ADSP
          </strong>
          <span style={{ fontSize: '0.72rem', color: roleView === 'clinic' ? '#60a5fa' : '#fbbf24', fontWeight: 700, background: 'rgba(255,255,255,0.08)', padding: '0.18rem 0.55rem', borderRadius: '999px' }}>
            {roleView === 'clinic' ? 'Klinik Yönetim Paneli' : 'Laboratuvar / Teknisyen Paneli'}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setRoleView('clinic')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.8rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: roleView === 'clinic' ? '#2563eb' : '#1e293b',
              color: '#fff'
            }}
          >
            <Users size={14} /> Hekim / Klinik Paneli
          </button>
          <button
            type="button"
            onClick={() => setRoleView('technician')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.8rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: roleView === 'technician' ? '1px solid #f59e0b' : '1px solid #334155',
              cursor: 'pointer',
              background: roleView === 'technician' ? '#d97706' : '#1e293b',
              color: '#fff'
            }}
          >
            <UserCog size={14} /> Laboratuvar / Teknisyen Paneli
          </button>

          <a
            href={
              roleView === 'clinic'
                ? 'https://protez-takip-sistemi-adsp.vercel.app/dashboard/clinic'
                : 'https://protez-takip-sistemi-adsp.vercel.app/dashboard/technician'
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.38rem 0.7rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399'
            }}
          >
            <ExternalLink size={12} /> Canlı Vercel
          </a>
        </div>
      </div>

      {/* Sub-header matching protez-takip-sistemi-adsp */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
            {roleView === 'clinic' ? 'Vaka Panosu (Hekim Görünümü)' : 'Laboratuvar Panosu (Teknisyen Görünümü)'}
          </h3>
          <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
            {roleView === 'clinic'
              ? 'Yeni vaka oluşturun ve vakaların üretim aşamalarını canlı izleyin.'
              : 'Teknisyen olarak vakaların üzerindeki "İlerlet →" butonuyla aşama güncelleyin.'}
          </p>
        </div>

        {roleView === 'clinic' && (
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Yeni Vaka Aç
          </button>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '1.15rem', overflowY: 'auto' }}>
        {/* TomorrowDueAlert */}
        {dueTomorrowJobs.length > 0 && (
          <div
            style={{
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>
                DİKKAT: Yarın Gidecek {dueTomorrowJobs.length} İş Var!
              </strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.5rem' }}>
              {dueTomorrowJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: '#fff',
                    border: '1px solid #fee2e2',
                    borderRadius: '6px',
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{job.patient_name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{job.prosthesis_type.replace('_', ' ').toUpperCase()}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    <Clock size={11} /> YARIN
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DynamicKanban Container */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
          {/* Workflow Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('conventional')}
              style={{
                padding: '0.55rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'conventional' ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === 'conventional' ? '#2563eb' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Konvansiyonel İş Akışı ({jobs.filter((j) => j.impression_type === 'conventional').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('digital')}
              style={{
                padding: '0.55rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'digital' ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === 'digital' ? '#2563eb' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Dijital İş Akışı ({jobs.filter((j) => j.impression_type === 'digital').length})
            </button>
          </div>

          {/* Horizontal Kanban Columns */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {stages.map((stage, stageIdx) => {
              const colJobs = filteredJobs.filter((j) => j.status === stage.status);
              return (
                <div
                  key={stage.status}
                  style={{
                    width: '235px',
                    flexShrink: 0,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px 10px 0 0' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>{stage.label}</span>
                    <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                      {colJobs.length}
                    </span>
                  </div>

                  <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', minHeight: '110px' }}>
                    {colJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        style={{
                          background: '#ffffff',
                          border: selectedJobId === job.id ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                          {job.patient_name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', marginBottom: '0.45rem' }}>
                          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                            {job.prosthesis_type}
                          </span>
                          <span style={{ fontWeight: 700, color: '#334155' }}>Renk: {job.vita_shade}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          Diş No: {job.tooth_numbers.join(', ')}
                        </div>

                        {roleView === 'technician' && stageIdx < stages.length - 1 && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(job.id, stages[stageIdx + 1].status);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '0.28rem 0.6rem',
                                cursor: 'pointer'
                              }}
                            >
                              İlerlet <ArrowRight size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {colJobs.length === 0 && (
                      <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed #cbd5e1', borderRadius: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                        Vaka yok
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
            width: '340px',
            maxWidth: '92%',
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-8px 0 24px rgba(15,23,42,0.16)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '0.9rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{selectedJob.patient_name}</h4>
              <div style={{ fontSize: '0.72rem', color: roleView === 'technician' ? '#d97706' : '#64748b', fontWeight: 600 }}>
                {roleView === 'technician' ? 'Laboratuvar Bilgi Kartı' : 'Vaka Detayı ve İşlem Geçmişi'}
              </div>
            </div>
            <button type="button" onClick={() => setSelectedJobId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <div style={{ background: roleView === 'technician' ? '#fffbeb' : '#eff6ff', border: `1px solid ${roleView === 'technician' ? '#fde68a' : '#bfdbfe'}`, borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
              <div style={{ marginBottom: '0.35rem' }}>
                Protez Tipi: <strong>{PROSTHESIS_LABELS[selectedJob.prosthesis_type]}</strong>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                Ölçü Tipi: <strong>{selectedJob.impression_type === 'digital' ? 'Dijital Tarama' : 'Konvansiyonel Ölçü'}</strong>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>
                VITA Renk Skalası: <strong style={{ color: '#dc2626' }}>{selectedJob.vita_shade}</strong>
              </div>
              <div>Diş Numaraları: <strong>{selectedJob.tooth_numbers.join(', ')}</strong></div>
              {selectedJob.medical_notes && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', color: '#475569' }}>
                  Not: {selectedJob.medical_notes}
                </div>
              )}
            </div>

            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={14} color="#2563eb" /> İşlem Kronolojisi
            </h5>

            <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '0.5rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {logs
                .filter((l) => l.job_id === selectedJob.id || logs.length <= 3)
                .map((log) => (
                  <div key={log.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#1e293b' }}>
                        {log.action_type === 'JOB_CREATED' ? 'Yeni Vaka' : 'Durum Güncellemesi'}
                      </strong>
                      <span style={{ color: '#94a3b8' }}>{new Date(log.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>{log.description}</p>
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
            background: 'rgba(15,23,42,0.55)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <form
            onSubmit={handleCreateJob}
            style={{
              background: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '440px',
              padding: '1.25rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Yeni Protez İş Emri Oluştur</h4>
              <button type="button" onClick={() => setIsNewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Hasta Adı Soyadı</label>
                <input
                  type="text"
                  required
                  placeholder="örn: Zeynep Aydın"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Ölçü Tipi</label>
                  <select
                    value={newImpression}
                    onChange={(e) => setNewImpression(e.target.value as ImpressionType)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="digital">Dijital Tarama</option>
                    <option value="conventional">Konvansiyonel Ölçü</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Protez Tipi</label>
                  <select
                    value={newProsthesis}
                    onChange={(e) => setNewProsthesis(e.target.value as ProsthesisType)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="zirconia">Zirkonyum</option>
                    <option value="metal_porcelain">Metal Porselen</option>
                    <option value="implant_supported">İmplant Üstü</option>
                    <option value="removable_denture">Hareketli Protez</option>
                    <option value="laminate_veneer">Laminate Veneer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>VITA Renk</label>
                  <select
                    value={newShade}
                    onChange={(e) => setNewShade(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    {['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'D2'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Diş No</label>
                  <input
                    type="text"
                    value={newTeeth}
                    onChange={(e) => setNewTeeth(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Teslim</label>
                  <select
                    value={newDueOffset}
                    onChange={(e) => setNewDueOffset(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="1">Yarın (Acil)</option>
                    <option value="2">2 Gün Sonra</option>
                    <option value="4">4 Gün Sonra</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#334155' }}>Hekim Notu</label>
                <input
                  type="text"
                  placeholder="Opsiyonel tıbbi not..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.4rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Vaka Emrini Laboratuvara Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

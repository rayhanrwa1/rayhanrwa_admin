import { useEffect, useState } from 'react';
import { CircleNotch, DownloadSimple, FileText, FloppyDisk, Plus, Sparkle, Trash } from '@phosphor-icons/react';
import Layout from '../components/layout';
import api from '../utils/api';

const templates = [
  { id: 'ats_classic', name: 'Classic ATS', description: 'Nama dan kontak, ringkasan, pengalaman, pendidikan, lalu keterampilan.' },
  { id: 'ats_modern', name: 'Modern ATS', description: 'Header ringkas, ringkasan dan keterampilan terlihat lebih awal.' },
  { id: 'ats_executive', name: 'Executive ATS', description: 'Header formal dan ringkasan profil sebelum rekam jejak.' },
  { id: 'ats_minimal', name: 'Minimal ATS', description: 'Tanpa garis dekoratif; tipografi dan spasi yang membedakan bagian.' },
  { id: 'ats_technical', name: 'Technical ATS', description: 'Keterampilan dan proyek ditampilkan sebelum pengalaman.' },
  { id: 'ats_academic', name: 'Academic ATS', description: 'Pendidikan dan publikasi/sertifikasi didahulukan.' },
];

const fonts = [
  { id: 'arial', name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { id: 'calibri', name: 'Calibri', family: 'Calibri, Carlito, Arial, sans-serif' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'times_new_roman', name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { id: 'verdana', name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { id: 'garamond', name: 'Garamond', family: 'Garamond, "Times New Roman", serif' },
];

const emptyResume = () => ({
  title: 'CV Baru',
  template: 'ats_classic',
  font_family: 'arial',
  full_name: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
});

const emptyExperience = () => ({
  role: '',
  company: '',
  location: '',
  start_date: '',
  end_date: '',
  description: [],
});

const emptyEducation = () => ({
  degree: '',
  institution: '',
  location: '',
  start_date: '',
  end_date: '',
  description: [],
});

const emptyProject = () => ({ name: '', link: '', description: [] });
const emptyCertification = () => ({ name: '', issuer: '', date: '', credential: '' });

function getCVRequestError(error, action) {
  const status = error.response?.status;
  if (status === 404) {
    return `API CV tidak ditemukan saat ${action} (404). Backend online belum diperbarui; deploy backend terbaru.`;
  }
  if (status >= 500) {
    return `Server gagal ${action}. Pastikan migrasi CV sudah diterapkan dan periksa log backend.`;
  }
  if (!error.response) return `Tidak dapat terhubung ke server API saat ${action}. Periksa koneksi dan URL API.`;
  return error.response.data?.message || error.message || `Gagal ${action}.`;
}

function Input({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = '', rows = 3 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SectionHeading({ children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
      <h2 className="font-semibold text-gray-900">{children}</h2>
      {action}
    </div>
  );
}

function getResumeDensity(resume) {
  const textLength = [
    resume.full_name,
    resume.headline,
    resume.summary,
    resume.email,
    resume.phone,
    resume.location,
    resume.website,
    resume.linkedin,
    ...(resume.experience || []).flatMap((item) => [item.role, item.company, item.location, ...(item.description || [])]),
    ...(resume.education || []).flatMap((item) => [item.degree, item.institution, item.location, ...(item.description || [])]),
    ...(resume.skills || []),
    ...(resume.projects || []).flatMap((item) => [item.name, item.link, ...(item.description || [])]),
    ...(resume.certifications || []).flatMap((item) => [item.name, item.issuer, item.credential]),
  ].reduce((total, value) => total + String(value || '').length, 0);
  const sectionCount = [
    Boolean(resume.summary),
    resume.experience?.some((item) => item.role || item.company),
    resume.education?.some((item) => item.degree || item.institution),
    resume.skills?.some(Boolean),
    resume.projects?.some((item) => item.name),
    resume.certifications?.some((item) => item.name),
  ].filter(Boolean).length;

  if (textLength > 4200 || textLength > 3200 && sectionCount >= 5) return 0.78;
  if (textLength > 3000 || textLength > 2200 && sectionCount >= 4) return 0.84;
  if (textLength > 1800 || textLength > 1300 && sectionCount >= 4) return 0.92;
  return 1;
}

function ResumePreview({ resume }) {
  const template = resume.template || 'ats_classic';
  const font = fonts.find((option) => option.id === resume.font_family)?.family || fonts[0].family;
  const density = getResumeDensity(resume);
  const pageStyle = {
    fontFamily: font,
    '--cv-body-size': `${Math.max(9.5, 11 * density)}px`,
    '--cv-small-size': `${Math.max(8.5, 9.5 * density)}px`,
    '--cv-entry-size': `${Math.max(10, 11.5 * density)}px`,
    '--cv-section-size': `${Math.max(9.5, 10.5 * density)}px`,
    '--cv-name-size': `${Math.max(20, 24 * density)}px`,
  };
  const contact = [resume.location, resume.phone, resume.email, resume.website, resume.linkedin].filter(Boolean);
  const dateRange = (start, end) => [start, end].filter(Boolean).join(' – ');

  const sectionContent = {
    summary: resume.summary && (
      <PreviewSection key="summary" title="Professional Summary" template={template}>
        <p className="whitespace-pre-line">{resume.summary}</p>
      </PreviewSection>
    ),
    experience: resume.experience?.some((item) => item.role || item.company) && (
      <PreviewSection key="experience" title="Professional Experience" template={template}>
        {resume.experience.filter((item) => item.role || item.company).map((item, index) => (
          <div key={`experience-${index}`} className="mb-2.5 break-inside-avoid last:mb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <strong className="cv-entry-title">{template === 'ats_academic' ? item.role || item.company : item.company || item.role}</strong>
              <span className="cv-small-text text-gray-600">{dateRange(item.start_date, item.end_date)}</span>
            </div>
            {(item.role && item.company || item.location) && (
              <p className={template === 'ats_minimal' ? 'text-gray-700' : 'italic text-gray-700'}>
                {[item.role && item.company ? item.role : '', item.location].filter(Boolean).join(' · ')}
              </p>
            )}
            {item.description?.filter(Boolean).length > 0 && (
              <ul className="mt-0.5 list-disc space-y-0 pl-4 leading-[1.25]">
                {item.description.filter(Boolean).map((line, lineIndex) => <li key={`exp-line-${lineIndex}`}>{line}</li>)}
              </ul>
            )}
          </div>
        ))}
      </PreviewSection>
    ),
    education: resume.education?.some((item) => item.degree || item.institution) && (
      <PreviewSection key="education" title="Education" template={template}>
        {resume.education.filter((item) => item.degree || item.institution).map((item, index) => (
          <div key={`education-${index}`} className="mb-2 break-inside-avoid last:mb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <strong className="cv-entry-title">{item.degree}</strong>
              <span className="cv-small-text text-gray-600">{dateRange(item.start_date, item.end_date)}</span>
            </div>
            <p>{[item.institution, item.location].filter(Boolean).join(' · ')}</p>
            {item.description?.filter(Boolean).length > 0 && <p className="mt-1">{item.description.filter(Boolean).join(' · ')}</p>}
          </div>
        ))}
      </PreviewSection>
    ),
    skills: resume.skills?.filter(Boolean).length > 0 && (
      <PreviewSection key="skills" title="Skills" template={template}>
        <p>{resume.skills.filter(Boolean).join(template === 'ats_technical' ? '  |  ' : ' · ')}</p>
      </PreviewSection>
    ),
    projects: resume.projects?.some((item) => item.name) && (
      <PreviewSection key="projects" title="Selected Projects" template={template}>
        {resume.projects.filter((item) => item.name).map((item, index) => (
          <div key={`project-${index}`} className="mb-2 break-inside-avoid last:mb-0">
            <strong className="cv-entry-title">{item.name}</strong>
            {item.link && <p className="break-all cv-small-text text-gray-600">{item.link}</p>}
            {item.description?.filter(Boolean).length > 0 && <ul className="mt-0.5 list-disc space-y-0 pl-4 leading-[1.25]">{item.description.filter(Boolean).map((line, lineIndex) => <li key={`project-line-${lineIndex}`}>{line}</li>)}</ul>}
          </div>
        ))}
      </PreviewSection>
    ),
    certifications: resume.certifications?.some((item) => item.name) && (
      <PreviewSection key="certifications" title="Certifications" template={template}>
        {resume.certifications.filter((item) => item.name).map((item, index) => (
          <div key={`certification-${index}`} className="mb-2 break-inside-avoid last:mb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <strong>{item.name}</strong>
              <span className="cv-small-text text-gray-600">{item.date}</span>
            </div>
            <p>{[item.issuer, item.credential].filter(Boolean).join(' · ')}</p>
          </div>
        ))}
      </PreviewSection>
    ),
  };
  const sectionOrders = {
    ats_classic: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    ats_modern: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    ats_executive: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
    ats_minimal: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    ats_technical: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    ats_academic: ['education', 'summary', 'experience', 'certifications', 'skills', 'projects'],
  };
  const sectionSpacing = template === 'ats_academic' ? 'space-y-3' : 'space-y-2.5';
  const headerStyle = {
    ats_classic: 'mb-4 border-b border-gray-400 pb-3',
    ats_modern: 'mb-4 border-l-4 border-gray-700 pb-2 pl-3',
    ats_executive: 'mb-4 border-b border-gray-400 pb-3 text-center',
    ats_minimal: 'mb-3 pb-2',
    ats_technical: 'mb-4 border-b-2 border-gray-800 pb-2',
    ats_academic: 'mb-4 border-b border-gray-400 pb-3 text-center',
  }[template] || 'mb-4 border-b border-gray-400 pb-3';
  const nameStyle = template === 'ats_technical'
    ? 'font-bold uppercase leading-tight tracking-wide'
    : template === 'ats_academic' || template === 'ats_executive'
      ? 'font-serif font-bold leading-tight'
      : template === 'ats_minimal'
        ? 'font-medium leading-tight'
        : 'font-bold leading-tight';
  const orderedSections = sectionOrders[template] || sectionOrders.ats_classic;

  return (
    <article
      className={`cv-print-area cv-body-text mx-auto aspect-[210/297] w-full max-w-[794px] bg-white px-6 py-7 leading-[1.25] text-gray-800 sm:px-9 sm:py-9 ${template === 'ats_academic' || template === 'ats_executive' ? 'font-serif' : ''}`}
      style={pageStyle}
    >
      <header className={`break-inside-avoid ${headerStyle}`}>
        <div className={`flex items-start justify-between gap-3 ${template === 'ats_executive' || template === 'ats_academic' ? 'flex-col items-center' : ''}`}>
          <div className={`${template === 'ats_executive' || template === 'ats_academic' ? 'text-center' : ''} min-w-0`}>
            <h1 className={`cv-name break-words ${nameStyle}`}>{resume.full_name || 'Nama Lengkap'}</h1>
            {resume.headline && <p className="mt-0.5 text-base font-medium">{resume.headline}</p>}
          </div>
          {contact.length > 0 && (
            <div className={`cv-small-text break-words leading-tight text-gray-700 ${template === 'ats_executive' || template === 'ats_academic' ? 'text-center' : 'max-w-[48%] shrink-0 text-right'}`}>
              {template === 'ats_classic' || template === 'ats_minimal' || template === 'ats_technical'
                ? <p>{contact.join(' · ')}</p>
                : contact.map((detail) => <p key={detail}>{detail}</p>)}
            </div>
          )}
        </div>
      </header>
      <div className={sectionSpacing}>
        {orderedSections.map((key) => sectionContent[key])}
      </div>
    </article>
  );
}

function PreviewSection({ title, template, children }) {
  const headingStyle = {
    ats_classic: 'mb-1.5 border-b border-gray-500 pb-0.5 font-bold uppercase tracking-wide',
    ats_modern: 'mb-1.5 border-l-2 border-gray-600 pb-0.5 pl-1.5 font-semibold normal-case',
    ats_executive: 'mb-1.5 border-b border-gray-500 pb-0.5 text-center font-bold uppercase tracking-widest',
    ats_minimal: 'mb-1 font-semibold normal-case',
    ats_technical: 'mb-1.5 border-b-2 border-gray-800 pb-0.5 font-bold uppercase tracking-wider',
    ats_academic: 'mb-1.5 border-b border-gray-500 pb-0.5 font-serif font-bold normal-case',
  }[template] || 'mb-1.5 border-b border-gray-500 pb-0.5 font-bold uppercase tracking-wide';
  return (
    <section>
      <h2 className={`cv-section-title text-gray-900 ${headingStyle}`}>{title}</h2>
      {children}
    </section>
  );
}

function TemplateSamples({ selectedTemplate, onSelect }) {
  const sectionOrders = {
    ats_classic: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    ats_modern: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    ats_executive: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
    ats_minimal: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    ats_technical: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    ats_academic: ['education', 'summary', 'experience', 'certifications', 'skills', 'projects'],
  };
  const sampleContent = {
    summary: (
      <>
        <p>Product designer with 6+ years creating accessible digital products for health and finance.</p>
        <p className="mt-1">Combines user research, interaction design, and product analytics to improve task completion and customer satisfaction.</p>
      </>
    ),
    experience: (
      <>
        <div className="mb-2">
          <p className="font-bold">Senior Product Designer <span className="float-right font-normal text-gray-500">2022–Present</span></p>
          <p className="text-gray-600">Northstar Health · Jakarta</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-3">
            <li>Led discovery and design for 3 patient-facing product areas.</li>
            <li>Improved appointment completion by 24% through usability testing.</li>
          </ul>
        </div>
        <div>
          <p className="font-bold">Product Designer <span className="float-right font-normal text-gray-500">2019–2022</span></p>
          <p className="text-gray-600">Fintech Studio · Bandung</p>
          <ul className="mt-1 list-disc pl-3"><li>Built a reusable design system for 2 product teams.</li></ul>
        </div>
      </>
    ),
    education: (
      <>
        <div className="mb-2">
          <p className="font-bold">B.Sc. Information Systems <span className="float-right font-normal text-gray-500">2015–2019</span></p>
          <p>Universitas Indonesia · GPA 3.82/4.00</p>
          <p className="text-gray-600">Thesis: Accessible mobile services for public health.</p>
        </div>
        <p><strong>UX Research Methods</strong> · Interaction Design Foundation · 2021</p>
      </>
    ),
    skills: (
      <>
        <p><strong>Design:</strong> Figma, Prototyping, Design Systems, Accessibility</p>
        <p className="mt-1"><strong>Research:</strong> Interviews, Usability Testing, Surveys</p>
        <p className="mt-1"><strong>Tools:</strong> Jira, FigJam, Amplitude, HTML/CSS</p>
      </>
    ),
    projects: (
      <>
        <div className="mb-2">
          <p className="font-bold">CarePath Appointment Flow</p>
          <p>Redesigned the patient booking journey; reduced incomplete bookings by 24%.</p>
          <p className="text-gray-600">Research · Journey mapping · Prototyping</p>
        </div>
        <div>
          <p className="font-bold">Unified Design System</p>
          <p>Created 48 reusable components adopted by 4 cross-functional teams.</p>
        </div>
      </>
    ),
    certifications: (
      <>
        <p><strong>Accessibility Core Competencies</strong> · IAAP · 2023</p>
        <p className="mt-1"><strong>Google UX Design Certificate</strong> · Google · 2020</p>
      </>
    ),
  };
  const sectionTitles = {
    summary: 'Professional Summary',
    experience: 'Professional Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Selected Projects',
    certifications: 'Certifications',
  };

  return (
    <section className="mb-5 border-b border-gray-200 pb-5 print:hidden">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((template) => {
          const headerClass = {
            ats_classic: 'mb-2 border-b border-gray-400 pb-1.5',
            ats_modern: 'mb-2 border-l-2 border-gray-700 pb-1 pl-1.5',
            ats_executive: 'mb-2 border-b border-gray-400 pb-1.5 text-center font-serif',
            ats_minimal: 'mb-1.5 pb-1',
            ats_technical: 'mb-2 border-b-2 border-gray-800 pb-1',
            ats_academic: 'mb-2 border-b border-gray-400 pb-1.5 text-center font-serif',
          }[template.id];
          const headingClass = {
            ats_classic: 'mb-0.5 border-b border-gray-400 pb-0.5 text-[6px] font-bold uppercase tracking-wide',
            ats_modern: 'mb-0.5 border-l border-gray-500 pl-1 text-[6px] font-semibold',
            ats_executive: 'mb-0.5 border-b border-gray-400 pb-0.5 text-center text-[6px] font-bold uppercase tracking-wider',
            ats_minimal: 'mb-0.5 text-[6px] font-semibold',
            ats_technical: 'mb-0.5 border-b-2 border-gray-700 pb-0.5 text-[6px] font-bold uppercase tracking-wider',
            ats_academic: 'mb-0.5 border-b border-gray-400 pb-0.5 font-serif text-[6px] font-bold',
          }[template.id];
          const sampleSpacing = template.id === 'ats_minimal' ? 'space-y-1' : 'space-y-1.5';
          const centeredHeader = template.id === 'ats_executive' || template.id === 'ats_academic';

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              aria-pressed={selectedTemplate === template.id}
              className={`rounded-md border p-2 text-left transition-colors ${selectedTemplate === template.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <div className={`mx-auto aspect-[210/297] w-full max-w-48 overflow-hidden border border-gray-300 bg-white p-2.5 text-[6px] leading-[1.2] text-gray-700 ${template.id === 'ats_executive' || template.id === 'ats_academic' ? 'font-serif' : ''}`}>
                <header className={headerClass}>
                  <div className={`flex items-start justify-between gap-2 ${centeredHeader ? 'flex-col items-center' : ''}`}>
                    <div>
                      <p className="text-[10px] font-bold text-gray-900">ALEX MORGAN</p>
                      <p className="mt-0.5 text-[7px] font-semibold">SENIOR PRODUCT DESIGNER</p>
                    </div>
                    <div className={`${centeredHeader ? 'text-center' : 'text-right'} text-gray-600`}>
                      <p>alex.morgan@email.com</p>
                      <p>+62 812 3456 7890</p>
                      <p>Jakarta, Indonesia</p>
                    </div>
                  </div>
                </header>
                <div className={sampleSpacing}>
                  {sectionOrders[template.id].map((sectionKey) => (
                    <section key={sectionKey}>
                      <h3 className={`${headingClass} text-gray-900`}>{sectionTitles[sectionKey]}</h3>
                      <div>{sampleContent[sectionKey]}</div>
                    </section>
                  ))}
                </div>
              </div>
              <span className="mt-2 block text-xs font-semibold text-gray-800">{template.name}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{template.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function CVBuilder() {
  const [resumes, setResumes] = useState([]);
  const [resume, setResume] = useState(emptyResume);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [inputMode, setInputMode] = useState('database');
  const [sourceText, setSourceText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [draftLanguage, setDraftLanguage] = useState('id');
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const printResume = () => window.print();

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes(selectId = activeId) {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/cv-resumes');
      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      setResumes(items);
      const selected = items.find((item) => item.id === selectId) || items[0];
      if (selected) {
        setActiveId(selected.id);
        setResume({ ...emptyResume(), ...selected });
      } else {
        setActiveId(null);
        setResume(emptyResume());
      }
    } catch (requestError) {
      console.error('Failed to load CVs', requestError);
      setError(getCVRequestError(requestError, 'memuat daftar CV'));
    } finally {
      setLoading(false);
    }
  }

  const setValue = (key, value) => setResume((current) => ({ ...current, [key]: value }));
  const updateItem = (section, index, key, value) => setResume((current) => ({
    ...current,
    [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));
  const removeItem = (section, index) => setResume((current) => ({
    ...current,
    [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
  }));

  const startNew = () => {
    setActiveId(null);
    setResume(emptyResume());
    setGeneratedDraft(null);
    setError('');
    setNotice('');
  };

  const generateDraft = async () => {
    setGenerating(true);
    setError('');
    setNotice('');
    setGeneratedDraft(null);
    try {
      const response = await api.post('/cv-resumes/generate', {
        source_mode: inputMode === 'database' ? 'database' : 'text',
        source_text: sourceText,
        target_role: targetRole,
        language: draftLanguage,
      });
      const draft = response.data?.data;
      if (!draft || typeof draft !== 'object') throw new Error('AI tidak mengembalikan draf CV yang valid.');
      setGeneratedDraft({ ...emptyResume(), ...draft });
      setNotice('Draf AI siap ditinjau. Draf belum disimpan.');
    } catch (requestError) {
      console.error('Failed to generate CV draft', requestError);
      setError(getCVRequestError(requestError, 'membuat draf AI'));
    } finally {
      setGenerating(false);
    }
  };

  const applyGeneratedDraft = () => {
    const hasCurrentContent = Object.entries(resume).some(([key, value]) => {
      if (key === 'title' || key === 'template') return false;
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === 'string' && value.trim() !== '';
    });
    if (hasCurrentContent && !window.confirm('Gunakan draf AI? Data yang sudah ada di form akan diganti.')) return;
    setResume({
      ...emptyResume(),
      ...generatedDraft,
      title: resume.title && resume.title !== 'CV Baru' ? resume.title : generatedDraft.title,
      template: resume.template,
      font_family: resume.font_family,
    });
    setGeneratedDraft(null);
    setNotice('Draf AI sudah diterapkan ke form. Periksa dan lengkapi sebelum menyimpan.');
  };

  const saveResume = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = activeId
        ? await api.put(`/cv-resumes/${activeId}`, resume)
        : await api.post('/cv-resumes', resume);
      const saved = response.data?.data;
      if (!saved?.id) throw new Error('Server tidak mengembalikan ID CV yang tersimpan.');
      setActiveId(saved.id);
      setResume({ ...emptyResume(), ...saved });
      await loadResumes(saved.id);
      setNotice('CV berhasil disimpan.');
    } catch (requestError) {
      console.error('Failed to save CV', requestError);
      setError(getCVRequestError(requestError, 'menyimpan CV'));
    } finally {
      setSaving(false);
    }
  };

  const deleteResume = async () => {
    if (!activeId || !window.confirm(`Hapus CV "${resume.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError('');
    try {
      await api.delete(`/cv-resumes/${activeId}`);
      await loadResumes(null);
      setNotice('CV berhasil dihapus.');
    } catch (requestError) {
      console.error('Failed to delete CV', requestError);
      setError(getCVRequestError(requestError, 'menghapus CV'));
    }
  };

  const skillsText = resume.skills.join(', ');

  return (
    <Layout>
      <style>{`
        .cv-print-area {
          box-sizing: border-box;
        }
        .cv-print-area.cv-body-text {
          font-size: var(--cv-body-size) !important;
        }
        .cv-print-area .cv-small-text {
          font-size: var(--cv-small-size) !important;
        }
        .cv-print-area .cv-entry-title,
        .cv-print-area .text-base {
          font-size: var(--cv-entry-size) !important;
        }
        .cv-print-area .cv-section-title {
          font-size: var(--cv-section-size) !important;
        }
        .cv-print-area .cv-name {
          font-size: var(--cv-name-size) !important;
        }
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; }
          body * { visibility: hidden !important; }
          .cv-print-area, .cv-print-area * { visibility: visible !important; }
          .cv-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            padding: 10mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Career documents</p>
          <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">CV & ATS Resume Builder</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">Susun data CV, pilih template profesional, lalu simpan.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Plus size={18} /> CV Baru
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div role={error ? 'alert' : 'status'} className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          <span>{error || notice}</span>
          {error && !loading && (
            <button type="button" onClick={() => loadResumes()} className="rounded-md border border-current px-3 py-1.5 text-xs font-semibold hover:bg-white">
              Tampilkan lagi
            </button>
          )}
        </div>
      )}

      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">CV tersimpan</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {resumes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setActiveId(item.id); setResume({ ...emptyResume(), ...item }); setGeneratedDraft(null); setError(''); setNotice(''); }}
              className={`min-w-52 rounded-md border p-3 text-left transition-colors ${activeId === item.id ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-400'}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900"><FileText size={17} />{item.title}</span>
              <span className="mt-1 block truncate text-xs text-gray-500">{item.full_name || 'Nama belum diisi'} · {templates.find((template) => template.id === item.template)?.name || 'ATS'}</span>
            </button>
          ))}
          {!loading && !error && resumes.length === 0 && <p className="border border-gray-200 px-4 py-3 text-sm text-gray-500">Belum ada CV. Isi form di bawah untuk membuat CV pertama.</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center border-y border-gray-200 bg-white"><CircleNotch className="animate-spin text-gray-600" size={30} /></div>
      ) : (
        <form onSubmit={saveResume} className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
          <div className="space-y-5 print:hidden">
            <section className="border-b border-gray-200 bg-white py-5">
              <SectionHeading>Cara mengisi CV</SectionHeading>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setInputMode('database')} className={`rounded-md border p-3 text-left transition-colors ${inputMode === 'database' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 hover:border-gray-400'}`}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Sparkle size={18} /> Ambil dari database</span>
                  <span className="mt-1 block text-xs text-gray-500">Gunakan profil dan data portofolio Anda.</span>
                </button>
                <button type="button" onClick={() => setInputMode('ai')} className={`rounded-md border p-3 text-left transition-colors ${inputMode === 'ai' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 hover:border-gray-400'}`}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Sparkle size={18} /> Pakai teks sendiri</span>
                  <span className="mt-1 block text-xs text-gray-500">Tempel informasi untuk disusun AI.</span>
                </button>
                <button type="button" onClick={() => setInputMode('manual')} className={`rounded-md border p-3 text-left transition-colors ${inputMode === 'manual' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 hover:border-gray-400'}`}>
                  <span className="block text-sm font-semibold text-gray-900">Isi manual</span>
                  <span className="mt-1 block text-xs text-gray-500">Isi dan edit langsung di form.</span>
                </button>
              </div>
              {inputMode !== 'manual' ? (
                <div className="space-y-4">
                  {inputMode === 'ai' && (
                    <TextArea label="Informasi CV" value={sourceText} onChange={setSourceText} rows={7} placeholder="Tempel pengalaman kerja, pendidikan, keahlian, proyek, dan pencapaian. AI hanya menyusun informasi yang Anda berikan." />
                  )}
                  <Input label="Posisi yang dituju (opsional)" value={targetRole} onChange={setTargetRole} placeholder="Contoh: Senior Backend Engineer" />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Bahasa draf</span>
                    <select value={draftLanguage} onChange={(event) => setDraftLanguage(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {inputMode === 'database'
                      ? 'Saat diminta, profil, ringkasan bio, proyek, keterampilan, sertifikasi, dan tautan dari database akan dikirim ke DeepSeek untuk membuat draf. Data tidak diambil atau dikirim sampai tombol ditekan.'
                      : 'Teks yang ditempel dikirim ke DeepSeek hanya saat tombol ditekan.'}
                    {' '}Draf tidak disimpan otomatis; periksa kembali agar semua fakta akurat.
                  </p>
                  <button type="button" onClick={generateDraft} disabled={generating || (inputMode === 'ai' && sourceText.trim().length < 20)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {generating ? <CircleNotch className="animate-spin" size={18} /> : <Sparkle size={18} />}
                    {generating ? 'AI sedang menyusun draf...' : inputMode === 'database' ? 'Ambil data DB & buat draf AI' : 'Buat draf dengan AI'}
                  </button>
                  {generatedDraft && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <p className="text-sm font-semibold text-gray-900">Draf siap ditinjau</p>
                      <p className="mt-1 text-sm text-gray-700">{generatedDraft.full_name || 'Nama belum terdeteksi'}{generatedDraft.headline ? ` · ${generatedDraft.headline}` : ''}</p>
                      <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-gray-600">{generatedDraft.summary || 'AI belum menemukan ringkasan dari informasi yang diberikan.'}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        {generatedDraft.experience.length} pengalaman · {generatedDraft.education.length} pendidikan · {generatedDraft.skills.length} keterampilan · {generatedDraft.projects.length} proyek
                      </p>
                      <button type="button" onClick={applyGeneratedDraft} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800">
                        Gunakan draf AI
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-gray-600">Isi bagian CV di bawah secara manual. AI tidak digunakan dalam mode ini.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading>Identitas CV</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nama dokumen" value={resume.title} onChange={(value) => setValue('title', value)} placeholder="CV Software Engineer 2026" />
                <Input label="Nama lengkap" value={resume.full_name} onChange={(value) => setValue('full_name', value)} placeholder="Nama sesuai dokumen profesional" />
                <div className="sm:col-span-2"><Input label="Posisi / headline" value={resume.headline} onChange={(value) => setValue('headline', value)} placeholder="Software Engineer | Backend Developer" /></div>
                <Input label="Email" type="email" value={resume.email} onChange={(value) => setValue('email', value)} placeholder="nama@email.com" />
                <Input label="Telepon" value={resume.phone} onChange={(value) => setValue('phone', value)} placeholder="+62 ..." />
                <Input label="Kota, negara" value={resume.location} onChange={(value) => setValue('location', value)} placeholder="Jakarta, Indonesia" />
                <Input label="Website / portfolio" value={resume.website} onChange={(value) => setValue('website', value)} placeholder="https://..." />
                <div className="sm:col-span-2"><Input label="LinkedIn" value={resume.linkedin} onChange={(value) => setValue('linkedin', value)} placeholder="linkedin.com/in/..." /></div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading>Template & font</SectionHeading>
              <div className="grid gap-3">
                {templates.map((template) => (
                  <label key={template.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${resume.template === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="template" value={template.id} checked={resume.template === template.id} onChange={() => setValue('template', template.id)} className="mt-1 accent-blue-600" />
                    <span><span className="block text-sm font-semibold text-gray-900">{template.name}</span><span className="mt-0.5 block text-xs text-gray-500">{template.description}</span></span>
                  </label>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Jenis font</span>
                <select
                  value={resume.font_family}
                  onChange={(event) => setValue('font_family', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {fonts.map((font) => <option key={font.id} value={font.id}>{font.name}</option>)}
                </select>
              </label>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">Semua template satu kolom, tanpa tabel, ikon, grafik, atau foto agar mudah dibaca sistem ATS. Pilihan template dan font tersimpan bersama CV.</p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading>Ringkasan profesional</SectionHeading>
              <TextArea label="Profil singkat dan kekuatan utama" value={resume.summary} onChange={(value) => setValue('summary', value)} rows={5} placeholder="Tulis ringkasan yang relevan dengan posisi target. Sertakan keahlian dan pencapaian terukur." />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading action={<button type="button" onClick={() => setValue('experience', [...resume.experience, emptyExperience()])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Plus size={15} /> Tambah</button>}>Pengalaman kerja</SectionHeading>
              <div className="space-y-4">
                {resume.experience.map((item, index) => (
                  <div key={`experience-form-${index}`} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <EntryHeader index={index} label="Pengalaman" onRemove={() => removeItem('experience', index)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Jabatan" value={item.role} onChange={(value) => updateItem('experience', index, 'role', value)} />
                      <Input label="Perusahaan" value={item.company} onChange={(value) => updateItem('experience', index, 'company', value)} />
                      <Input label="Lokasi" value={item.location} onChange={(value) => updateItem('experience', index, 'location', value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Mulai" value={item.start_date} onChange={(value) => updateItem('experience', index, 'start_date', value)} placeholder="Jan 2023" />
                        <Input label="Selesai" value={item.end_date} onChange={(value) => updateItem('experience', index, 'end_date', value)} placeholder="Sekarang" />
                      </div>
                      <div className="sm:col-span-2"><TextArea label="Pencapaian (satu poin per baris)" value={item.description.join('\n')} onChange={(value) => updateItem('experience', index, 'description', value.split('\n'))} rows={4} placeholder="Mengurangi waktu proses 30% dengan ..." /></div>
                    </div>
                  </div>
                ))}
                {resume.experience.length === 0 && <EmptySection text="Tambahkan pengalaman yang paling relevan dengan pekerjaan target." />}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading action={<button type="button" onClick={() => setValue('education', [...resume.education, emptyEducation()])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Plus size={15} /> Tambah</button>}>Pendidikan</SectionHeading>
              <div className="space-y-4">
                {resume.education.map((item, index) => (
                  <div key={`education-form-${index}`} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <EntryHeader index={index} label="Pendidikan" onRemove={() => removeItem('education', index)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Gelar / jurusan" value={item.degree} onChange={(value) => updateItem('education', index, 'degree', value)} />
                      <Input label="Institusi" value={item.institution} onChange={(value) => updateItem('education', index, 'institution', value)} />
                      <Input label="Lokasi" value={item.location} onChange={(value) => updateItem('education', index, 'location', value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Mulai" value={item.start_date} onChange={(value) => updateItem('education', index, 'start_date', value)} />
                        <Input label="Selesai" value={item.end_date} onChange={(value) => updateItem('education', index, 'end_date', value)} />
                      </div>
                      <div className="sm:col-span-2"><TextArea label="Keterangan (opsional)" value={item.description.join('\n')} onChange={(value) => updateItem('education', index, 'description', value.split('\n'))} rows={2} /></div>
                    </div>
                  </div>
                ))}
                {resume.education.length === 0 && <EmptySection text="Tambahkan pendidikan formal atau pelatihan yang relevan." />}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading>Keterampilan</SectionHeading>
              <TextArea label="Pisahkan dengan koma" value={skillsText} onChange={(value) => setValue('skills', value.split(',').map((skill) => skill.trim()).filter(Boolean))} rows={3} placeholder="Go, PostgreSQL, React, Docker, ..." />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading action={<button type="button" onClick={() => setValue('projects', [...resume.projects, emptyProject()])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Plus size={15} /> Tambah</button>}>Proyek pilihan</SectionHeading>
              <div className="space-y-4">
                {resume.projects.map((item, index) => (
                  <div key={`project-form-${index}`} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <EntryHeader index={index} label="Proyek" onRemove={() => removeItem('projects', index)} />
                    <div className="grid gap-3">
                      <Input label="Nama proyek" value={item.name} onChange={(value) => updateItem('projects', index, 'name', value)} />
                      <Input label="Link (opsional)" value={item.link} onChange={(value) => updateItem('projects', index, 'link', value)} />
                      <TextArea label="Dampak / kontribusi (satu poin per baris)" value={item.description.join('\n')} onChange={(value) => updateItem('projects', index, 'description', value.split('\n'))} rows={3} />
                    </div>
                  </div>
                ))}
                {resume.projects.length === 0 && <EmptySection text="Pilih proyek yang menunjukkan dampak dan kemampuan utama." />}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeading action={<button type="button" onClick={() => setValue('certifications', [...resume.certifications, emptyCertification()])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Plus size={15} /> Tambah</button>}>Sertifikasi</SectionHeading>
              <div className="space-y-4">
                {resume.certifications.map((item, index) => (
                  <div key={`certification-form-${index}`} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <EntryHeader index={index} label="Sertifikasi" onRemove={() => removeItem('certifications', index)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Nama sertifikasi" value={item.name} onChange={(value) => updateItem('certifications', index, 'name', value)} />
                      <Input label="Penerbit" value={item.issuer} onChange={(value) => updateItem('certifications', index, 'issuer', value)} />
                      <Input label="Tanggal" value={item.date} onChange={(value) => updateItem('certifications', index, 'date', value)} placeholder="2025" />
                      <Input label="Credential ID / URL" value={item.credential} onChange={(value) => updateItem('certifications', index, 'credential', value)} />
                    </div>
                  </div>
                ))}
                {resume.certifications.length === 0 && <EmptySection text="Tambahkan sertifikasi yang mendukung posisi target." />}
              </div>
            </section>

            <div className="sticky bottom-3 z-10 flex flex-wrap justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              {activeId ? <button type="button" onClick={deleteResume} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash size={17} /> Hapus</button> : <span />}
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <CircleNotch className="animate-spin" size={18} /> : <FloppyDisk size={18} />}
                {saving ? 'Menyimpan...' : 'Simpan CV'}
              </button>
            </div>
          </div>

          <section className="min-w-0 xl:sticky xl:top-4">
            <div className="mb-3 flex items-center justify-between print:hidden">
              <div>
                <h2 className="font-semibold text-gray-900">Pratinjau langsung</h2>
                <p className="text-xs text-gray-500">Format satu kolom yang ramah ATS</p>
              </div>
              <button type="button" onClick={printResume} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <DownloadSimple size={15} /> Cetak / PDF
              </button>
            </div>
            <div className="overflow-auto rounded-xl bg-gray-100 p-3 sm:p-5 print:overflow-visible print:bg-white print:p-0">
              <ResumePreview resume={resume} />
            </div>
          </section>
        </form>
      )}
    </Layout>
  );
}

function EntryHeader({ index, label, onRemove }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label} {index + 1}</p>
      <button type="button" onClick={onRemove} aria-label={`Hapus ${label.toLowerCase()} ${index + 1}`} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash size={16} /></button>
    </div>
  );
}

function EmptySection({ text }) {
  return <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-500">{text}</p>;
}

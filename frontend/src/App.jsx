import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen,
  CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardList, Clock3, FileText, HeartHandshake, HeartPulse, LayoutDashboard, LogOut,
  MessageCircle, MessageSquareText, ShieldCheck, Sparkles, UserRound, UsersRound, X,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from './api.js';
import OrbitalScene from './components/OrbitalScene.jsx';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Basics of Mechanical Engineering', 'CSE',
  'Communication Skills', 'Ethics and Human Mindfulness',
];
const SUBJECT_SHORT = {
  'Mathematics': 'MATH', 'Physics': 'PHYS', 'Basics of Mechanical Engineering': 'BME',
  'CSE': 'CSE', 'Communication Skills': 'COMM', 'Ethics and Human Mindfulness': 'ETHICS',
};
const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance tracking', icon: CalendarDays },
  { id: 'feedback', label: 'Feedback to teacher', icon: MessageSquareText },
  { id: 'grades', label: 'Grades display', icon: Activity },
  { id: 'assignments', label: 'Remaining assignments', icon: ClipboardList },
  { id: 'mental', label: 'Mental health', icon: HeartPulse },
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getErrorMessage(error) {
  return error?.message || 'Something went wrong. Please try again.';
}

function BrandMark({ small = false }) {
  return <div className={`brand-mark ${small ? 'brand-mark-small' : ''}`}><span>A</span><i /></div>;
}

function LoginPage({ onLogin }) {
  const [step, setStep] = useState('identify');
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const rollIsValid = useMemo(() => {
    const value = roll.trim().toUpperCase();
    const match = value.match(/^26(BPH|BME)(\d{3})$/);
    if (!match) return false;
    const n = Number(match[2]);
    return match[1] === 'BPH' ? n >= 1 && n <= 50 : n >= 91 && n <= 125;
  }, [roll]);

  async function handleIdentify(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const result = await api('/api/auth/student/identify', {
        method: 'POST', noAuth: true,
        body: JSON.stringify({ name: name.trim(), roll_no: roll.trim().toUpperCase() }),
      });
      setNotice(result.message);
      setStep(result.setup_required ? 'setup' : 'password');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleCredentialSubmit(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (step === 'setup') {
        if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (password !== confirmPassword) throw new Error('The two passwords do not match.');
        const result = await api('/api/auth/student/setup-password', {
          method: 'POST', noAuth: true,
          body: JSON.stringify({ name: name.trim(), roll_no: roll.trim().toUpperCase(), password }),
        });
        onLogin(result);
      } else {
        const result = await api('/api/auth/student/login', {
          method: 'POST', noAuth: true,
          body: JSON.stringify({ name: name.trim(), roll_no: roll.trim().toUpperCase(), password }),
        });
        onLogin(result);
      }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  function backToIdentify() { setStep('identify'); setPassword(''); setConfirmPassword(''); setError(''); setNotice(''); }

  return (
    <div className="login-shell">
      <div className="login-grain" />
      <header className="login-header">
        <div className="brand-lockup"><BrandMark /><div><strong>ACRM<span> / </span>SECTION C</strong><small>STUDENT SUPPORT SYSTEM</small></div></div>
        <div className="header-system"><span className="live-dot" /> SYSTEM READY <span className="header-divider" /> v1.0.0</div>
      </header>
      <main className="login-main">
        <div className="login-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> STUDENT-FIRST CAMPUS INTELLIGENCE</div>
          <h1>Be seen.<br /><em>Be supported.</em></h1>
          <p className="login-intro">One connected space for attendance, academics, and wellbeing — built around the student, with a clear handshake to faculty.</p>
          <div className="login-feature-list">
            <div><span className="feature-icon mint"><CalendarDays size={17} /></span><div><b>Academic clarity</b><small>Attendance, assignments and grades in one view.</small></div></div>
            <div><span className="feature-icon lilac"><MessageCircle size={17} /></span><div><b>A direct line to faculty</b><small>Send academic questions and non-academic concerns.</small></div></div>
            <div><span className="feature-icon peach"><HeartHandshake size={17} /></span><div><b>Wellbeing matters</b><small>Request a teacher follow-up when you need support.</small></div></div>
          </div>
          <div className="data-window-note"><ShieldCheck size={15} /><span>DEMO RECORDS: <b>20 AUG — 10 OCT 2026</b></span></div>
        </div>
        <div className="login-visual">
          <OrbitalScene />
          <div className="orbit-tag tag-top"><span className="tag-pulse" /> STUDENT / FACULTY / ADMIN</div>
          <div className="orbit-tag tag-bottom"><span className="tag-code">ACRM</span><span>CONNECTED BY CARE</span></div>
          <div className="visual-center-text"><span>SECTION C</span><b>YOUR SPACE.<br />YOUR PROGRESS.</b></div>
        </div>
        <section className="login-card-wrap">
          <div className="login-card">
            <div className="card-topline"><span>STUDENT PORTAL</span><span className="lock-status"><ShieldCheck size={13} /> SECURE ACCESS</span></div>
            <div className="login-card-heading">
              <div className="login-avatar"><UserRound size={23} /></div>
              <div><h2>{step === 'identify' ? 'Welcome to ACRM' : step === 'setup' ? 'Create your password' : 'Welcome back'}</h2><p>{step === 'identify' ? 'Verify your Section C identity to continue.' : step === 'setup' ? 'This is a one-time step for your account.' : 'Your account is registered. Sign in to continue.'}</p></div>
            </div>
            {step === 'identify' ? (
              <form onSubmit={handleIdentify} className="login-form">
                <label>Student name <span>AS IN SECTION C ROSTER</span></label>
                <input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" minLength={2} required />
                <label>Roll number <span>26BPH001–050 OR 26BME091–125</span></label>
                <input autoComplete="off" value={roll} onChange={e => setRoll(e.target.value.toUpperCase())} placeholder="e.g. 26BPH001" required aria-invalid={roll.length > 0 && !rollIsValid} />
                <div className={`roll-helper ${roll.length ? (rollIsValid ? 'valid' : 'invalid') : ''}`}>{roll.length ? (rollIsValid ? <><Check size={13} /> Format looks valid — roster match will be checked.</> : <><AlertCircle size={13} /> Check the prefix and three-digit range.</>) : 'Your roll number must match the official roster.'}</div>
                {error && <ErrorBanner message={error} />}
                <button className="primary-button full-button" disabled={busy || !name.trim() || !rollIsValid}>{busy ? 'VERIFYING…' : 'VERIFY & CONTINUE'} <ArrowRight size={16} /></button>
              </form>
            ) : (
              <form onSubmit={handleCredentialSubmit} className="login-form">
                <div className="identity-chip"><div className="identity-initial">{name.trim().charAt(0).toUpperCase()}</div><div><b>{name}</b><small>{roll.toUpperCase()}</small></div><button className="quiet-icon" type="button" onClick={backToIdentify} aria-label="Change identity"><ArrowLeft size={16} /></button></div>
                {step === 'setup' && <div className="setup-callout"><Sparkles size={15} /><span>First login detected. Choose a password you can remember; it will be saved as a secure hash.</span></div>}
                <label>{step === 'setup' ? 'Create password' : 'Password'}</label>
                <input type="password" autoComplete={step === 'setup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} minLength={step === 'setup' ? 8 : 1} placeholder={step === 'setup' ? 'At least 8 characters' : 'Enter your password'} required />
                {step === 'setup' && <><label>Confirm password</label><input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} placeholder="Enter it again" required /></>}
                {notice && <div className="success-inline"><CheckCircleIcon />{notice}</div>}
                {error && <ErrorBanner message={error} />}
                <button className="primary-button full-button" disabled={busy || !password || (step === 'setup' && !confirmPassword)}>{busy ? 'AUTHENTICATING…' : step === 'setup' ? 'CREATE PASSWORD & ENTER' : 'SIGN IN TO ACRM'} <ArrowRight size={16} /></button>
                <button type="button" className="text-button center-button" onClick={backToIdentify}>Not you? Start again</button>
              </form>
            )}
            <div className="login-card-footer"><span><span className="tiny-lock">⌑</span> Local prototype · encrypted password hashes</span><span>SECTION C</span></div>
          </div>
          <p className="login-footnote">Teacher inbox and shared deployment are prepared for the next build phase. This local version saves data to the backend on this computer.</p>
        </section>
      </main>
      <footer className="login-footer"><span>ANTI CLASS REPRESENTATIVE MOTION</span><span>BUILT FOR STUDENTS, WITH STUDENTS <span className="footer-spark">✳</span></span><span>© ACRM · 2026</span></footer>
    </div>
  );
}

function CheckCircleIcon() { return <CheckCheck size={16} />; }
function ErrorBanner({ message }) { return <div className="error-banner"><AlertCircle size={15} /><span>{message}</span></div>; }

function Dashboard({ student, onLogout }) {
  const [view, setView] = useState('overview');
  const [subject, setSubject] = useState('Mathematics');
  const [month, setMonth] = useState(10);
  const [year, setYear] = useState(2026);
  const [overview, setOverview] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [wellbeingModal, setWellbeingModal] = useState(false);
  const [alertId, setAlertId] = useState(null);
  const [wellbeingNote, setWellbeingNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('academic');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    let live = true;
    async function load() {
      setPageError(''); setNotice('');
      if (view === 'feedback' || view === 'mental') { setLoading(false); return; }
      setLoading(true);
      try {
        if (view === 'overview') {
          const [overviewData, gradeData, assignmentData] = await Promise.all([
            api('/api/student/overview'), api('/api/student/grades'), api('/api/student/assignments'),
          ]);
          if (!live) return;
          setOverview(overviewData); setGrades(gradeData.grades); setAssignments(assignmentData.assignments);
        } else if (view === 'attendance' || view === 'statistics') {
          const path = `/api/student/attendance?subject=${encodeURIComponent(subject)}&year=${year}&month=${month}`;
          const result = await api(path);
          if (live) setAttendance(result);
        } else if (view === 'grades') {
          const result = await api(`/api/student/grades?subject=${encodeURIComponent(subject)}`);
          if (live) setGrades(result.grades);
        } else if (view === 'assignments') {
          const result = await api(`/api/student/assignments?subject=${encodeURIComponent(subject)}`);
          if (live) setAssignments(result.assignments);
        }
      } catch (error) {
        if (live) setPageError(getErrorMessage(error));
        if (error?.message?.toLowerCase().includes('session has expired')) onLogout();
      } finally { if (live) setLoading(false); }
    }
    load();
    return () => { live = false; };
  }, [view, subject, month, year, refresh, onLogout]);

  const navigate = useCallback((nextView) => { setView(nextView); setNotice(''); setPageError(''); }, []);
  const openCheckIn = async () => {
    setSubmitting(true); setPageError(''); setNotice('');
    try {
      const result = await api('/api/student/mental-health/alert', { method: 'POST', body: JSON.stringify({}) });
      setAlertId(result.alert_id); setWellbeingNote(''); setWellbeingModal(true);
    } catch (error) { setPageError(getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };
  const submitWellbeingNote = async (event) => {
    event.preventDefault(); setSubmitting(true); setPageError('');
    try {
      await api(`/api/student/mental-health/${alertId}/note`, { method: 'POST', body: JSON.stringify({ message: wellbeingNote.trim() }) });
      setWellbeingModal(false); setNotice('Your check-in and note have been saved to the teacher-inbox queue.'); setView('mental'); setWellbeingNote('');
    } catch (error) { setPageError(getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };
  const submitFeedback = async (event) => {
    event.preventDefault(); setSubmitting(true); setPageError(''); setNotice('');
    try {
      const result = await api('/api/student/feedback', { method: 'POST', body: JSON.stringify({ subject, category: feedbackType, message: feedbackMessage.trim() }) });
      setNotice(`${result.message} Reference #${result.message_id}.`); setFeedbackMessage('');
    } catch (error) { setPageError(getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };
  const changeMonth = (increment) => {
    const date = new Date(year, month - 1 + increment, 1);
    const key = date.getFullYear() * 12 + date.getMonth();
    const lower = 2026 * 12 + 7; // August 2026
    const upper = 2026 * 12 + 9; // October 2026
    if (key < lower || key > upper) return;
    setMonth(date.getMonth() + 1); setYear(date.getFullYear());
  };

  const activeNav = view === 'statistics' ? 'attendance' : view;
  const activeItem = NAV.find(item => item.id === activeNav) || NAV[0];
  const lowSubjects = overview?.subjects?.filter(item => item.percentage < 75).length || 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><BrandMark small /><div><strong>ACRM</strong><small>ANTI CLASS REPRESENTATIVE<br />MOTION</small></div></div>
        <div className="sidebar-section-label">STUDENT WORKSPACE</div>
        <nav className="main-nav">
          {NAV.map(item => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => navigate(item.id)} className={`nav-item ${activeNav === item.id ? 'active' : ''} ${item.id === 'mental' ? 'nav-wellbeing' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.id === 'mental' && <span className="nav-heart-dot" />}</button>;
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-support-card">
          <div className="support-orbit"><HeartPulse size={18} /></div>
          <b>You matter here.</b>
          <p>Need a check-in? Reach out to your teachers from the wellbeing space.</p>
          <button onClick={() => navigate('mental')}>Open wellbeing <ArrowUpRight size={14} /></button>
        </div>
        <div className="sidebar-bottom"><div className="secure-mark"><ShieldCheck size={14} /><span>SECTION C · PRIVATE SPACE</span></div><div className="sidebar-version">ACRM STUDENT PORTAL <span>v1.0</span></div></div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="breadcrumb"><span>ACRM</span><ChevronRight size={14} /><span>Student portal</span><ChevronRight size={14} /><b>{activeItem.label}</b></div>
          <div className="topbar-right"><div className="term-pill"><span className="live-dot" /> SECTION C</div><div className="topbar-divider" /><div className="profile-mini"><div className="profile-avatar">{student.name.slice(0, 1).toUpperCase()}</div><div><b>{student.name}</b><span>{student.roll_no}</span></div></div><button className="logout-button" onClick={onLogout} title="Log out"><LogOut size={17} /></button></div>
        </header>
        <div className="content-scroll">
          {pageError && <div className="global-error"><ErrorBanner message={pageError} /><button onClick={() => setPageError('')} aria-label="Dismiss"><X size={15} /></button></div>}
          {notice && <div className="global-success"><CheckCircleIcon /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
          {view === 'overview' && <OverviewPage student={student} overview={overview} grades={grades} assignments={assignments} loading={loading} onNavigate={navigate} onCheckIn={() => navigate('mental')} />}
          {(view === 'attendance' || view === 'statistics') && <AttendancePage data={attendance} loading={loading} subject={subject} setSubject={setSubject} month={month} year={year} changeMonth={changeMonth} view={view} navigate={navigate} />}
          {view === 'feedback' && <FeedbackPage subject={subject} setSubject={setSubject} type={feedbackType} setType={setFeedbackType} message={feedbackMessage} setMessage={setFeedbackMessage} onSubmit={submitFeedback} submitting={submitting} />}
          {view === 'grades' && <GradesPage data={grades} loading={loading} subject={subject} setSubject={setSubject} />}
          {view === 'assignments' && <AssignmentsPage data={assignments} loading={loading} subject={subject} setSubject={setSubject} />}
          {view === 'mental' && <MentalHealthPage onOpenCheckIn={openCheckIn} submitting={submitting} />}
          <footer className="page-footer"><span>ACRM <i>·</i> SUPPORT THROUGH CONNECTION</span><span>DEMO ACADEMIC DATA THROUGH 10 OCT 2026 <span className="footer-separator">/</span> TEACHER CONTROLS COMING NEXT</span></footer>
        </div>
      </main>

      {wellbeingModal && <div className="modal-backdrop" role="presentation"><div className="wellbeing-modal" role="dialog" aria-modal="true" aria-labelledby="wellbeing-title"><div className="modal-symbol"><HeartHandshake size={25} /></div><button className="modal-close" onClick={() => setWellbeingModal(false)} aria-label="Close dialog"><X size={18} /></button><div className="modal-kicker">YOUR WELLBEING CHECK-IN</div><h2 id="wellbeing-title">What's on your mind?</h2><p className="modal-intro">Your teachers have been notified that you'd like support. You can share as much or as little as feels comfortable.</p><form onSubmit={submitWellbeingNote}><label className="field-label">Your note <span>SHARED WITH YOUR TEACHERS</span></label><textarea value={wellbeingNote} onChange={e => setWellbeingNote(e.target.value)} minLength={1} maxLength={5000} required placeholder="You can write about how you've been feeling, what has been difficult, or what kind of support would help…" rows={5} /><div className="consent-note"><ShieldCheck size={15} /><span>This note will be stored with your check-in alert for teachers to review. This is not an emergency service.</span></div>{pageError && <ErrorBanner message={pageError} />}<button className="primary-button full-button" disabled={submitting || !wellbeingNote.trim()}>{submitting ? 'SAVING NOTE…' : 'SEND NOTE TO TEACHERS'} <ArrowRight size={16} /></button><button type="button" className="text-button center-button" onClick={() => setWellbeingModal(false)}>Close and leave the alert only</button></form></div></div>}
    </div>
  );
}

function PageTitle({ eyebrow, title, description, actions }) {
  return <div className="page-title-row"><div><div className="page-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-title-actions">{actions}</div>}</div>;
}
function SubjectPicker({ subject, setSubject }) {
  return <label className="subject-picker"><span>SUBJECT</span><div><BookOpen size={15} /><select value={subject} onChange={e => setSubject(e.target.value)} aria-label="Select subject">{SUBJECTS.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label>;
}
function StatCard({ label, value, suffix, icon: Icon, tone = 'mint', note, trend }) {
  return <div className={`stat-card tone-${tone}`}><div className="stat-card-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-foot"><span>{note}</span>{trend && <span className="stat-trend">{trend}</span>}</div></div>;
}
function LoadingState() { return <div className="loading-state"><span className="loading-spinner" /><span>Loading your student records…</span></div>; }
function EmptyState({ title, description }) { return <div className="empty-state"><CircleHelp size={25} /><b>{title}</b><p>{description}</p></div>; }

function OverviewPage({ student, overview, grades, assignments, loading, onNavigate, onCheckIn }) {
  if (loading && !overview) return <><PageTitle eyebrow="YOUR STUDENT SPACE" title={`Good to see you, ${student.name.split(' ')[0]}.`} description="Your academic snapshot, attendance and support tools — all in one place." /><LoadingState /></>;
  const totalHeld = overview?.overall?.classes_held ?? 0;
  const overallPct = overview?.overall?.percentage ?? 0;
  const chartData = (overview?.subjects || []).map(item => ({ subject: SUBJECT_SHORT[item.subject] || item.subject, fullName: item.subject, percentage: item.percentage }));
  const low = (overview?.subjects || []).filter(item => item.percentage < 75);
  const pending = assignments.filter(item => item.status === 'missing' || item.status === 'late').length;
  return <>
    <PageTitle eyebrow="SUNDAY · 11 OCTOBER 2026" title={`Your space, ${student.name.split(' ')[0]}.`} description="Here's your current academic pulse. One step at a time — your progress matters." actions={<button onClick={onCheckIn} className="soft-button"><HeartPulse size={16} /> Wellbeing check-in</button>} />
    <section className="welcome-strip"><div className="welcome-graphic"><span className="welcome-dot d1" /><span className="welcome-dot d2" /><Sparkles size={25} /></div><div className="welcome-message"><span>SECTION C · STUDENT PROFILE</span><b>{student.name}</b><p>Roll no. <strong>{student.roll_no}</strong> <i>·</i> Your records are updated through <strong>10 October 2026</strong>.</p></div><div className="welcome-right"><span className="welcome-badge"><ShieldCheck size={14} /> PERSONAL DASHBOARD</span><span>6 subjects connected</span></div></section>
    <div className="stats-grid overview-stats">
      <StatCard label="OVERALL ATTENDANCE" value={overallPct.toFixed(1)} suffix="%" icon={CalendarDays} tone={overallPct < 75 ? 'peach' : 'mint'} note={`${overview?.overall?.classes_present ?? 0} of ${totalHeld} classes attended`} trend={overallPct < 75 ? 'Below 75%' : 'On track'} />
      <StatCard label="CLASSES RECORDED" value={totalHeld} suffix="" icon={CheckCheck} tone="blue" note="Across all six subjects" />
      <StatCard label="SUBJECTS TO WATCH" value={low.length} suffix=" / 6" icon={Activity} tone={low.length ? 'peach' : 'lilac'} note={low.length ? 'Attendance below 75%' : 'No shortage flagged'} />
      <StatCard label="WORK TO REVIEW" value={pending} suffix="" icon={ClipboardList} tone="lilac" note="Late or missing demo assignments" />
    </div>
    <div className="overview-grid">
      <section className="panel attendance-panel"><div className="panel-heading"><div><span className="panel-eyebrow">ATTENDANCE ANALYTICS</span><h2>Subject attendance</h2></div><button className="panel-link" onClick={() => onNavigate('attendance')}>View details <ArrowUpRight size={15} /></button></div>
        <div className="chart-legend"><span><i className="legend-dot" /> Attendance</span><span><i className="legend-line" /> 75% threshold</span></div>
        {chartData.length ? <div className="attendance-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 6, right: 12, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#273147" /><XAxis dataKey="subject" tick={{ fill: '#8b96ad', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#68758f', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<AttendanceTooltip />} cursor={{ fill: 'rgba(133,151,186,.08)' }} /><Bar dataKey="percentage" name="Attendance" radius={[5, 5, 0, 0]} maxBarSize={28}>{chartData.map((entry, index) => <Cell key={entry.subject} fill={entry.percentage < 75 ? '#ed9b77' : ['#68e0c0', '#7eafff', '#b6a0ff', '#74cfdf', '#82d4a5', '#d1a4ed'][index % 6]} />)}</Bar></BarChart></ResponsiveContainer><div className="threshold-line-label">75%</div></div> : <EmptyState title="Attendance not available" description="Your records will appear here once loaded." />}
        <div className="chart-footer"><span><span className="status-dot green" /> Present</span><span><span className="status-dot red" /> Absent</span><span className="chart-footer-note">Demo attendance · 20 Aug – 10 Oct</span></div>
      </section>
      <section className="panel subject-status-panel"><div className="panel-heading"><div><span className="panel-eyebrow">QUICK CHECK</span><h2>Six subject signals</h2></div><span className="subtle-count">{overview?.subjects?.length || 0} MODULES</span></div><div className="subject-status-list">{(overview?.subjects || []).map((item, index) => <button key={item.subject} className="subject-status-item" onClick={() => onNavigate('attendance')}><span className={`subject-mini-icon color-${index}`}><BookOpen size={15} /></span><span className="subject-status-name"><b>{item.subject}</b><small>{item.classes_present}/{item.classes_held} classes attended</small></span><span className={`subject-status-pct ${item.percentage < 75 ? 'text-risk' : ''}`}>{item.percentage.toFixed(1)}%</span><span className="status-chevron"><ChevronRight size={15} /></span></button>)}</div><button className="panel-bottom-link" onClick={() => onNavigate('attendance')}>Explore attendance calendar <ArrowRight size={15} /></button></section>
    </div>
    <div className="overview-bottom-grid"><section className="mini-panel"><span className="panel-eyebrow">ACADEMIC RECORD</span><div className="mini-panel-head"><div><h2>Latest grades</h2><p>Demo marks until the teacher dashboard is connected.</p></div><button className="icon-link" onClick={() => onNavigate('grades')} aria-label="Open grades"><ArrowUpRight size={17} /></button></div><div className="grade-preview-list">{grades.slice(0, 3).map(item => <div className="grade-preview" key={item.id}><span className="grade-subject-dot" /><span>{item.subject}</span><b>{Number(item.score).toFixed(1)}<small> / {item.max_score}</small></b></div>)}</div><button className="mini-action" onClick={() => onNavigate('grades')}>Open gradebook <ArrowRight size={14} /></button></section>
      <section className="mini-panel assignments-mini"><span className="panel-eyebrow">STAY ON TOP OF IT</span><div className="mini-panel-head"><div><h2>Assignments</h2><p>Submission status is set by faculty only.</p></div><span className="assignment-count">{assignments.length} <small>DEMO TASKS</small></span></div><div className="assignment-mini-list">{assignments.slice(0, 3).map(item => <div className="assignment-mini-item" key={item.id}><span className={`assignment-status-dot ${item.status}`} /><span><b>{item.title}</b><small>{item.subject} · Due {formatDate(item.due_date)}</small></span><StatusPill status={item.status} /></div>)}</div><button className="mini-action" onClick={() => onNavigate('assignments')}>View all assignments <ArrowRight size={14} /></button></section>
    </div>
  </>;
}

function AttendanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return <div className="chart-tooltip"><span>{item.fullName}</span><b>{item.percentage.toFixed(1)}% attendance</b></div>;
}
function formatDate(value) {
  const d = new Date(`${value}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AttendancePage({ data, loading, subject, setSubject, month, year, changeMonth, view, navigate }) {
  const isStats = view === 'statistics';
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const dayMap = useMemo(() => new Map((data?.days || []).map(item => [item.date, item.status])), [data]);
  const cells = Array.from({ length: cellCount }, (_, i) => {
    const day = i - firstWeekday + 1;
    return day < 1 || day > daysInMonth ? null : day;
  });
  const earliest = year === 2026 && month === 8;
  const latest = year === 2026 && month === 10;
  const pct = data?.percentage || 0;
  return <>
    <PageTitle eyebrow={isStats ? 'ATTENDANCE / ANALYTICS' : 'ATTENDANCE / CALENDAR'} title={isStats ? 'Know where you stand.' : 'Your attendance, at a glance.'} description={isStats ? 'A clear breakdown of attendance totals and the 75% threshold.' : 'Green means present, red means absent. Select a subject to review its calendar.'} actions={<SubjectPicker subject={subject} setSubject={setSubject} />} />
    <div className="subpage-toolbar"><div className="date-range-note"><CalendarDays size={15} /><span>DEMO WINDOW <b>20 AUG — 10 OCT 2026</b></span></div><div className="view-toggle"><button className={!isStats ? 'selected' : ''} onClick={() => navigate('attendance')}><CalendarDays size={14} /> Calendar</button><button className={isStats ? 'selected' : ''} onClick={() => navigate('statistics')}><Activity size={14} /> Statistics</button></div></div>
    {loading ? <LoadingState /> : !data ? <EmptyState title="No attendance record" description="Records for this subject are not available." /> : isStats ? <>
      <div className="stats-grid attendance-stat-cards"><StatCard label="CLASSES HELD" value={data.classes_held} icon={CalendarDays} tone="blue" note="From 20 August to 10 October" /><StatCard label="CLASSES PRESENT" value={data.classes_present} icon={CheckCheck} tone="mint" note={`${data.classes_held ? Math.round(data.classes_present / data.classes_held * 100) : 0}% of all classes`} /><StatCard label="CLASSES ABSENT" value={data.classes_absent} icon={ArrowDownRight} tone="peach" note="Missed sessions" /><StatCard label="ATTENDANCE PERCENTAGE" value={pct.toFixed(1)} suffix="%" icon={Activity} tone={pct < 75 ? 'peach' : 'lilac'} note={pct < 75 ? 'Below required threshold' : 'At or above 75%'} /></div>
      <div className="analysis-grid"><section className="panel analysis-gauge-panel"><span className="panel-eyebrow">ATTENDANCE HEALTH</span><h2>Current position</h2><div className="gauge-wrap"><div className={`attendance-gauge ${pct < 75 ? 'gauge-risk' : ''}`} style={{ '--gauge-pct': `${Math.min(pct, 100) * 3.6}deg` }}><div className="gauge-inner"><b>{pct.toFixed(1)}<small>%</small></b><span>ATTENDANCE</span></div></div></div><div className="gauge-legend"><span>0%</span><span className="gauge-threshold">75% threshold</span><span>100%</span></div>{pct < 75 ? <div className="shortage-alert"><AlertCircle size={18} /><div><b>Shortage of attendance</b><p>Your attendance is below 75%. You may be at risk of detainment under applicable institute rules. Consider contacting your teacher to discuss your circumstances.</p></div></div> : <div className="healthy-alert"><CheckCircleIcon /><div><b>Above the 75% threshold</b><p>Keep attending regularly to maintain a healthy buffer.</p></div></div>}</section>
        <section className="panel attendance-breakdown"><div className="panel-heading"><div><span className="panel-eyebrow">CLASS BREAKDOWN</span><h2>{subject}</h2></div><span className="subtle-count">{data.classes_held} SESSIONS</span></div><div className="breakdown-numbers"><div><span className="breakdown-bullet present" /><small>Present</small><b>{data.classes_present}</b></div><div><span className="breakdown-bullet absent" /><small>Absent</small><b>{data.classes_absent}</b></div></div><div className="stacked-bar"><span className="stack-present" style={{ width: `${data.classes_held ? data.classes_present / data.classes_held * 100 : 0}%` }} /><span className="stack-absent" /></div><div className="breakdown-legend"><span>Present <b>{data.classes_held ? (data.classes_present / data.classes_held * 100).toFixed(1) : '0.0'}%</b></span><span>Absent <b>{data.classes_held ? (data.classes_absent / data.classes_held * 100).toFixed(1) : '0.0'}%</b></span></div><div className="attendance-tip"><Sparkles size={17} /><p><b>Build a buffer.</b> Every class attended now makes it easier to stay above the threshold if an unavoidable absence comes up later.</p></div><button className="panel-bottom-link" onClick={() => navigate('attendance')}>Back to month calendar <ArrowRight size={15} /></button></section></div>
    </> : <div className="calendar-layout"><section className="panel calendar-panel"><div className="calendar-top"><div><span className="panel-eyebrow">MONTHLY VIEW</span><h2>{MONTHS[month - 1]} <span>{year}</span></h2></div><div className="month-controls"><button disabled={earliest} onClick={() => changeMonth(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button><button disabled={latest} onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={18} /></button></div></div><div className="calendar-weekdays">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{cells.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} className="calendar-cell empty" />;
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = dayMap.get(iso);
        const future = iso > '2026-10-10' || iso < '2026-08-20';
        return <div key={iso} className={`calendar-cell ${status || ''} ${future ? 'out-window' : ''} ${!status && !future ? 'no-session' : ''}`} title={status ? `${iso}: ${status}` : future ? 'Outside demo attendance window' : 'No class recorded'}><span className="calendar-day-num">{day}</span>{status ? <span className={`day-status-mark ${status}`}><i />{status === 'present' ? 'PRESENT' : 'ABSENT'}</span> : <span className="day-no-class">{future ? '—' : 'NO CLASS'}</span>}</div>;
      })}</div><div className="calendar-legend"><span><i className="calendar-legend-dot present" /> Present</span><span><i className="calendar-legend-dot absent" /> Absent</span><span><i className="calendar-legend-dot none" /> No class</span><small>Each marked date is one demo class for this subject.</small></div></section>
      <aside className="calendar-side"><section className="panel month-summary"><span className="panel-eyebrow">SUBJECT SNAPSHOT</span><h2>{subject}</h2><div className="month-percent"><b>{pct.toFixed(1)}<small>%</small></b><span className={pct < 75 ? 'risk-label' : 'good-label'}>{pct < 75 ? 'NEEDS ATTENTION' : 'ON TRACK'}</span></div><div className="mini-progress"><span style={{ width: `${pct}%`, background: pct < 75 ? '#ed9b77' : '#68e0c0' }} /></div><div className="mini-progress-label"><span>0%</span><span>75% target</span><span>100%</span></div><div className="month-counts"><div><span className="present-square" /><span>Classes present</span><b>{data.classes_present}</b></div><div><span className="absent-square" /><span>Classes absent</span><b>{data.classes_absent}</b></div><div><span className="total-square" /><span>Total classes</span><b>{data.classes_held}</b></div></div>{pct < 75 && <div className="inline-shortage"><AlertCircle size={15} /><span>Attendance below 75%. Detainment risk may apply under institute policy.</span></div>}<button className="primary-button full-button" onClick={() => navigate('statistics')}>Statistical attendance analysis <ArrowRight size={15} /></button></section><section className="panel calendar-note"><div className="note-icon"><CircleHelp size={17} /></div><div><b>How to read your calendar</b><p>Coloured dates show a recorded class. Days labelled “No class” have no attendance session in the demo schedule.</p></div></section></aside></div>}
  </>;
}

function FeedbackPage({ subject, setSubject, type, setType, message, setMessage, onSubmit, submitting }) {
  return <><PageTitle eyebrow="STUDENT / FACULTY HANDSHAKE" title="Start a conversation." description="Questions, clarifications or something on your mind — route a message to the relevant teacher." actions={<SubjectPicker subject={subject} setSubject={setSubject} />} /><div className="feedback-layout"><section className="panel feedback-form-panel"><div className="feedback-intro"><div className="feedback-icon"><MessageSquareText size={21} /></div><div><span className="panel-eyebrow">NEW MESSAGE</span><h2>Feedback to teacher</h2><p>Your message will be saved for the teacher inbox.</p></div></div><form onSubmit={onSubmit} className="feedback-form"><label className="field-label">SELECT SUBJECT</label><div className="subject-context"><BookOpen size={17} /><span><small>MESSAGE ROUTED TO</small><b>{subject}</b></span><span className="route-chip">SUBJECT ROUTE</span></div><label className="field-label">WHAT IS THIS ABOUT?</label><div className="choice-cards"><button type="button" className={`choice-card ${type === 'academic' ? 'selected' : ''}`} onClick={() => setType('academic')}><span className="choice-icon blue"><BookOpen size={17} /></span><span><b>Academic doubt</b><small>Topic, concept, classwork or assessment.</small></span><span className="choice-radio" /></button><button type="button" className={`choice-card ${type === 'non_academic' ? 'selected' : ''}`} onClick={() => setType('non_academic')}><span className="choice-icon lilac"><MessageCircle size={17} /></span><span><b>Non-academic concern</b><small>Communication, support or another concern.</small></span><span className="choice-radio" /></button></div><label className="field-label" htmlFor="feedback-message">YOUR MESSAGE <span>{message.length}/5000</span></label><textarea id="feedback-message" value={message} onChange={e => setMessage(e.target.value)} minLength={3} maxLength={5000} rows={7} required placeholder={type === 'academic' ? 'Describe the concept or question you need help with…' : 'Share what you would like your teacher to know…'} /><div className="form-privacy"><ShieldCheck size={15} /><span>Respectful messages help your teachers understand the issue and respond constructively.</span></div><button className="primary-button" disabled={submitting || message.trim().length < 3}>{submitting ? 'SENDING…' : 'SEND TO TEACHER'} <ArrowRight size={16} /></button></form></section><aside className="feedback-side"><div className="feedback-side-art"><div className="message-orbit orbit-a" /><div className="message-orbit orbit-b" /><div className="message-orbit orbit-c" /><div className="chat-art"><MessageCircle size={30} /><span><i /><i /><i /></span></div></div><span className="panel-eyebrow">A TWO-WAY HANDSHAKE</span><h2>Speaking up is a strength.</h2><p>ACRM is designed to make it easier to ask for help, explain a concern and keep student-teacher communication in one place.</p><div className="flow-steps"><div><span>01</span><div><b>You send a message</b><small>Choose the subject and type of concern.</small></div></div><div><span>02</span><div><b>It enters the teacher queue</b><small>Your identity and message travel together.</small></div></div><div><span>03</span><div><b>Faculty follow up</b><small>Teacher inbox interface is the next build phase.</small></div></div></div><div className="demo-note"><AlertCircle size={15} /><span>This prototype queues messages in the local database; it does not send email or push notifications.</span></div></aside></div></>;
}

function GradesPage({ data, loading, subject, setSubject }) {
  const average = data.length ? data.reduce((sum, item) => sum + Number(item.score), 0) / data.length : 0;
  return <><PageTitle eyebrow="ACADEMIC RECORD / MARKS" title="Your grades, clearly." description="Review marks recorded for this subject. Grade editing is reserved for teachers." actions={<SubjectPicker subject={subject} setSubject={setSubject} />} />{loading ? <LoadingState /> : <><div className="stats-grid grades-stats"><StatCard label="ASSESSMENT SCORE" value={data[0] ? Number(data[0].score).toFixed(1) : '—'} suffix={data[0] ? ` / ${data[0].max_score}` : ''} icon={Activity} tone="mint" note="Demo internal assessment" /><StatCard label="SUBJECT" value={data.length ? '01' : '00'} suffix=" record" icon={BookOpen} tone="blue" note={subject} /><StatCard label="GRADE SOURCE" value="DEMO" suffix="" icon={ShieldCheck} tone="lilac" note="Until faculty records are connected" /></div><section className="panel gradebook-panel"><div className="panel-heading"><div><span className="panel-eyebrow">GRADEBOOK</span><h2>{subject}</h2></div><span className="demo-data-chip"><span /> DEMO DATA</span></div>{data.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>ASSESSMENT</th><th>SUBJECT</th><th>MARKS</th><th>PROGRESS</th><th>SOURCE</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td><b>{item.assessment}</b><small>Recorded result</small></td><td>{item.subject}</td><td><strong className="table-score">{Number(item.score).toFixed(1)} <small>/ {item.max_score}</small></strong></td><td><div className="table-progress"><span style={{ width: `${item.score / item.max_score * 100}%` }} /></div><small className="table-progress-label">{(item.score / item.max_score * 100).toFixed(1)}%</small></td><td><span className="source-label">Demo seed</span></td></tr>)}</tbody></table></div> : <EmptyState title="No grades recorded" description="There are no grades for this subject yet." />}<div className="gradebook-footer"><ShieldCheck size={15} /><span>Students can view records only. Official grades should be entered and published by the teacher dashboard.</span></div></section></>}</>;
}

function StatusPill({ status }) {
  const label = status === 'submitted' ? 'Submitted' : status === 'late' ? 'Late' : 'Missing';
  return <span className={`status-pill ${status}`}>{status === 'submitted' ? <Check size={12} /> : status === 'late' ? <Clock3 size={12} /> : <AlertCircle size={12} />}{label}</span>;
}
function AssignmentsPage({ data, loading, subject, setSubject }) {
  const pending = data.filter(item => item.status === 'missing').length;
  const late = data.filter(item => item.status === 'late').length;
  return <><PageTitle eyebrow="ACADEMIC RECORD / COURSEWORK" title="Make room for the next step." description="See upcoming coursework and your current submission status. Only teachers can change these records." actions={<SubjectPicker subject={subject} setSubject={setSubject} />} />{loading ? <LoadingState /> : <><div className="stats-grid assignment-stats"><StatCard label="TOTAL ASSIGNMENTS" value={data.length} icon={ClipboardList} tone="blue" note="For selected subject" /><StatCard label="MISSING" value={pending} icon={AlertCircle} tone={pending ? 'peach' : 'mint'} note="Marked by demo faculty" /><StatCard label="LATE SUBMISSIONS" value={late} icon={Clock3} tone="lilac" note="Read-only status" /></div><div className="assignment-cards">{data.length ? data.map(item => <article className="panel assignment-card" key={item.id}><div className="assignment-card-top"><span className="assignment-type-icon"><FileText size={18} /></span><StatusPill status={item.status} /></div><div className="assignment-subject-label">{item.subject}</div><h2>{item.title}</h2><p>{item.description}</p><div className="assignment-card-bottom"><div><CalendarDays size={15} /><span><small>DUE DATE</small><b>{formatDate(item.due_date)}</b></span></div><span className="demo-data-chip"><span /> DEMO TASK</span></div></article>) : <EmptyState title="No assignments for this subject" description="New tasks will appear here when teachers publish them." />}</div><div className="read-only-note"><ShieldCheck size={17} /><p><b>Submission status is read-only.</b> In the teacher dashboard, faculty will be able to mark each assignment as submitted, late or missing. Students cannot edit these statuses.</p></div></>}</>;
}

function MentalHealthPage({ onOpenCheckIn, submitting }) {
  return <><PageTitle eyebrow="WELLBEING / YOU MATTER" title={<>You don't have to figure it all out<br className="desktop-break" /> on your own.</>} description="A simple way to let your teachers know you would like support. Start with what feels manageable." /><section className="wellbeing-hero panel"><div className="wellbeing-hero-content"><div className="wellbeing-pill"><span /> A SPACE TO BE HEARD</div><h2>It's okay to ask<br /><em>for a little help.</em></h2><p>Academic pressure, personal worries, or just feeling unlike yourself — you deserve to be listened to. Request a check-in and share what you'd like your teachers to know.</p><button className="primary-button wellbeing-start" onClick={onOpenCheckIn} disabled={submitting}><HeartPulse size={17} /> {submitting ? 'CREATING CHECK-IN…' : 'REQUEST A TEACHER CHECK-IN'} <ArrowRight size={16} /></button><div className="wellbeing-reassurance"><ShieldCheck size={15} /><span>You'll be told before your written note is shared with teachers.</span></div></div><div className="wellbeing-hero-art"><div className="soft-orb orb-one" /><div className="soft-orb orb-two" /><div className="soft-orb orb-three" /><div className="heart-ring ring-one" /><div className="heart-ring ring-two" /><div className="heart-center"><HeartPulse size={44} strokeWidth={1.4} /></div><div className="floating-note note-left"><span /><span /><span /></div><div className="floating-note note-right"><HeartHandshake size={19} /><span>YOU ARE<br />NOT ALONE</span></div></div></section><div className="wellbeing-info-grid"><section className="panel wellbeing-info-card"><div className="info-number">01</div><div className="info-card-icon mint"><MessageCircle size={18} /></div><h3>Ask for a check-in</h3><p>One button sends a high-priority alert to the local teacher-inbox queue.</p></section><section className="panel wellbeing-info-card"><div className="info-number">02</div><div className="info-card-icon lilac"><FileText size={18} /></div><h3>Share at your pace</h3><p>You can add a note, explain how things feel, or leave the alert without adding details.</p></section><section className="panel wellbeing-info-card"><div className="info-number">03</div><div className="info-card-icon peach"><UsersRound size={18} /></div><h3>Connect with a teacher</h3><p>Your request is intended to help a trusted faculty member follow up when the inbox is connected.</p></section></div><div className="wellbeing-boundary"><div><ShieldCheck size={17} /><b>Before you share</b></div><p>Your written note is stored with your check-in and will be visible to teachers through the future teacher inbox. ACRM is not an emergency response service. If you are in immediate danger, contact local emergency services or a trusted person nearby.</p></div></>;
}

export default function App() {
  const [student, setStudent] = useState(null);
  const [booting, setBooting] = useState(true);
  const acceptLogin = useCallback((result) => {
    sessionStorage.setItem('acrm_access_token', result.access_token);
    setStudent(result.student);
  }, []);
  const logout = useCallback(() => {
    sessionStorage.removeItem('acrm_access_token'); setStudent(null);
  }, []);
  useEffect(() => {
    let live = true;
    const token = sessionStorage.getItem('acrm_access_token');
    if (!token) { setBooting(false); return () => { live = false; }; }
    api('/api/student/me').then(data => { if (live) setStudent(data); }).catch(() => { sessionStorage.removeItem('acrm_access_token'); }).finally(() => { if (live) setBooting(false); });
    return () => { live = false; };
  }, []);
  if (booting) return <div className="app-loading"><BrandMark /><span>CONNECTING TO ACRM</span><div className="loading-spinner" /></div>;
  return student ? <Dashboard key={student.roll_no} student={student} onLogout={logout} /> : <LoginPage onLogin={acceptLogin} />;
}

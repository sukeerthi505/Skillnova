// ════════════════════════════════════════════════════════════
//  USER — pages/ResumeBuilder.jsx (Premium Portfolio Builder)
// ════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, GraduationCap, User, Mail, Linkedin, Github, 
  Plus, Trash2, Download, RefreshCw, Sparkles, Phone, Globe, Award, Layout, Check, Save
} from 'lucide-react';
import { Card, SectionHeader } from '../../shared/components/UI';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import notify from '../../lib/toast';

const MotionDiv = motion.div;

const ResumeBuilder = () => {
  const { user } = useAuthStore();
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [template, setTemplate] = useState('modern'); // 'modern' | 'minimal' | 'creative'
  
  // Resume State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    title: 'Software Engineer Intern',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    summary: 'Proactive and detail-oriented intern with hands-on experience developing features, resolving bugs, and writing documentation during my internship at UptoSkills.'
  });

  const [experience, setExperience] = useState([
    {
      id: '1',
      company: 'UptoSkills (Skillnova)',
      role: 'Intern Software Engineer',
      startDate: '2026-06',
      endDate: 'Present',
      description: '• Actively collaborated with the development team to implement new features.\n• Participated in sprint planning and daily standups.'
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Skillnova Intern Platform',
      role: 'Contributor',
      description: 'Worked on front-end components, API integrations, and analytics widgets.'
    }
  ]);

  const [education, setEducation] = useState([
    {
      id: '1',
      school: '',
      degree: 'Bachelor of Technology in Computer Science',
      year: '2027'
    }
  ]);

  const [skills, setSkills] = useState(['React', 'JavaScript', 'Node.js', 'TailwindCSS', 'REST APIs', 'Git']);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Hydrate from DB on load, fall back to user details if not found
  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await api.get('/resume');
        if (response.data?.resume) {
          const r = response.data.resume;
          if (r.template) setTemplate(r.template);
          if (r.personalInfo) setPersonalInfo(r.personalInfo);
          if (r.experience) setExperience(r.experience);
          if (r.projects) setProjects(r.projects);
          if (r.education) setEducation(r.education);
          if (r.skills) setSkills(r.skills);
        } else if (user) {
          setPersonalInfo(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            title: `${user.department || 'Software Engineer'} Intern`,
            linkedin: user.linkedinUrl || prev.linkedin,
          }));
          if (user.college) {
            setEducation([
              {
                id: '1',
                school: user.college,
                degree: user.yearOfStudy ? `Year ${user.yearOfStudy} Student` : 'Bachelor of Technology',
                year: user.yearOfStudy ? `Graduation ${2024 + parseInt(user.yearOfStudy) || '2027'}` : '2027'
              }
            ]);
          }
          if (user.skills) {
            const parsed = user.skills.split(',').map(s => s.trim()).filter(Boolean);
            if (parsed.length > 0) {
              setSkills(parsed);
            }
          }
        }
      } catch (err) {
        console.error('Could not load resume', err);
      }
    };

    loadResume();
  }, [user]);

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      await api.post('/resume', {
        template,
        personalInfo,
        experience,
        projects,
        education,
        skills,
      });
      notify.success('Resume saved to profile successfully!');
    } catch (err) {
      console.error(err);
      notify.error('Could not save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch finished tasks and build achievements list
  const handleAutoPopulateTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await api.get('/tasks', { params: { limit: 100 } });
      const allTasks = response.data.items || [];
      const completedTasks = allTasks.filter(t => t.status === 'DONE');
      
      if (completedTasks.length === 0) {
        notify.success('Auto-populated standard template (no completed tasks found in task board).');
        return;
      }

      // Generate bullet points from completed tasks
      const bulletPoints = completedTasks.map(t => `• Successfully completed: ${t.title} (${t.priority} priority).`).join('\n');
      
      // Update internship experience with these bullet points
      setExperience(prev => prev.map(exp => {
        if (exp.company.includes('UptoSkills')) {
          return {
            ...prev[0],
            description: `• Developed and deployed several application updates as an intern.\n• Collaborated on project sprints and task items.\n${bulletPoints}`
          };
        }
        return exp;
      }));

      notify.success(`Imported ${completedTasks.length} completed tasks into Experience!`);
    } catch (err) {
      notify.error('Could not load tasks from board.');
    } finally {
      setLoadingTasks(false);
    }
  };

  // List Management Helpers
  const addExperience = () => {
    setExperience([...experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '' }]);
  };

  const removeExperience = (id) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const addProject = () => {
    setProjects([...projects, { id: Date.now().toString(), name: '', role: '', description: '' }]);
  };

  const removeProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const addEducation = () => {
    setEducation([...education, { id: Date.now().toString(), school: '', degree: '', year: '' }]);
  };

  const removeEducation = (id) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="print:hidden">
        <SectionHeader 
          title="Resume Builder & Portfolio Hub" 
          subtitle="Craft a stunning professional CV powered by your UptoSkills internship metrics" 
          action={
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoPopulateTasks}
                disabled={loadingTasks}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition"
                style={{ 
                  background: 'var(--card)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}
              >
                <RefreshCw size={14} className={loadingTasks ? 'animate-spin' : ''} />
                Sync Internship Tasks
              </button>
              <button
                onClick={handleSaveResume}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition"
                style={{ 
                  background: 'var(--card)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}
              >
                <Save size={14} className={saving ? 'animate-pulse' : ''} />
                {saving ? 'Saving...' : 'Save Resume'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <Download size={14} />
                Download PDF / Print
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BUILDER FORM */}
        <div className="xl:col-span-5 space-y-6 max-h-[85vh] overflow-y-auto pr-2 no-scrollbar print:hidden">
          {/* Personal Info */}
          <Card className="p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text)' }}>
              <User size={16} style={{ color: '#ff6d34' }} /> Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Full Name</label>
                <input 
                  type="text" 
                  value={personalInfo.name} 
                  onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Professional Title</label>
                <input 
                  type="text" 
                  value={personalInfo.title} 
                  onChange={e => setPersonalInfo({...personalInfo, title: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase opacity-60">Email</label>
                  <input 
                    type="email" 
                    value={personalInfo.email} 
                    onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-60">Phone</label>
                  <input 
                    type="text" 
                    value={personalInfo.phone} 
                    onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                    placeholder="+91 XXXXX XXXXX"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold uppercase opacity-60">LinkedIn</label>
                  <input 
                    type="text" 
                    value={personalInfo.linkedin} 
                    onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-60">Github</label>
                  <input 
                    type="text" 
                    value={personalInfo.github} 
                    onChange={e => setPersonalInfo({...personalInfo, github: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                    placeholder="github.com/username"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-60">Website</label>
                  <input 
                    type="text" 
                    value={personalInfo.website} 
                    onChange={e => setPersonalInfo({...personalInfo, website: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent"
                    placeholder="portfolio.com"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60">Professional Summary</label>
                <textarea 
                  rows={3}
                  value={personalInfo.summary} 
                  onChange={e => setPersonalInfo({...personalInfo, summary: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-transparent resize-y"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Briefcase size={16} style={{ color: '#ff6d34' }} /> Work Experience
              </h3>
              <button 
                onClick={addExperience} 
                className="p-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ color: '#00bea3' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={exp.id} className="p-3.5 rounded-xl space-y-2.5 border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase">Position #{index + 1}</span>
                    <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-600 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Company</label>
                      <input 
                        type="text" 
                        value={exp.company} 
                        onChange={e => setExperience(experience.map(x => x.id === exp.id ? {...x, company: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Role</label>
                      <input 
                        type="text" 
                        value={exp.role} 
                        onChange={e => setExperience(experience.map(x => x.id === exp.id ? {...x, role: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Start Date</label>
                      <input 
                        type="text" 
                        value={exp.startDate} 
                        placeholder="YYYY-MM"
                        onChange={e => setExperience(experience.map(x => x.id === exp.id ? {...x, startDate: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">End Date</label>
                      <input 
                        type="text" 
                        value={exp.endDate} 
                        placeholder="YYYY-MM or Present"
                        onChange={e => setExperience(experience.map(x => x.id === exp.id ? {...x, endDate: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase opacity-65">Description / Achievements (One per line)</label>
                    <textarea 
                      rows={3}
                      value={exp.description} 
                      onChange={e => setExperience(experience.map(x => x.id === exp.id ? {...x, description: e.target.value} : x))}
                      className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent resize-y"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Projects */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Award size={16} style={{ color: '#ff6d34' }} /> Key Projects
              </h3>
              <button 
                onClick={addProject} 
                className="p-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ color: '#00bea3' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div key={proj.id} className="p-3.5 rounded-xl space-y-2.5 border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase">Project #{index + 1}</span>
                    <button onClick={() => removeProject(proj.id)} className="text-red-500 hover:text-red-600 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Project Name</label>
                      <input 
                        type="text" 
                        value={proj.name} 
                        onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, name: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Your Role</label>
                      <input 
                        type="text" 
                        value={proj.role} 
                        onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, role: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase opacity-65">Description</label>
                    <textarea 
                      rows={2}
                      value={proj.description} 
                      onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, description: e.target.value} : x))}
                      className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent resize-y"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <GraduationCap size={16} style={{ color: '#ff6d34' }} /> Education
              </h3>
              <button 
                onClick={addEducation} 
                className="p-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                style={{ color: '#00bea3' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={edu.id} className="p-3.5 rounded-xl space-y-2.5 border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase">Education #{index + 1}</span>
                    <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-600 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase opacity-65">School / College</label>
                    <input 
                      type="text" 
                      value={edu.school} 
                      onChange={e => setEducation(education.map(x => x.id === edu.id ? {...x, school: e.target.value} : x))}
                      className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Degree / Course</label>
                      <input 
                        type="text" 
                        value={edu.degree} 
                        onChange={e => setEducation(education.map(x => x.id === edu.id ? {...x, degree: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase opacity-65">Year of Graduation</label>
                      <input 
                        type="text" 
                        value={edu.year} 
                        onChange={e => setEducation(education.map(x => x.id === edu.id ? {...x, year: e.target.value} : x))}
                        className="w-full mt-0.5 p-1.5 border rounded-lg text-xs bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills Management */}
          <Card className="p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--text)' }}>
              <Sparkles size={16} style={{ color: '#ff6d34' }} /> Skills & Expertises
            </h3>
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g. Docker, Python)"
                className="flex-1 p-2 border rounded-lg text-sm bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button 
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white rounded-lg transition"
                style={{ background: '#00bea3' }}
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span 
                  key={s} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  {s}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(s)} 
                    className="hover:text-red-500 transition text-[10px] font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL */}
        <div className="xl:col-span-7 space-y-4 print:col-span-12">
          {/* Preview Header controls */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-xl print:hidden">
            <span className="text-xs font-bold px-2" style={{ color: 'var(--text)' }}>Select Resume Theme:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'modern', name: 'Modern Dark' },
                { id: 'minimal', name: 'Minimalist Light' },
                { id: 'creative', name: 'Creative Teal' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    template === t.id 
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Layout size={12} />
                  {t.name}
                  {template === t.id && <Check size={10} style={{ color: '#00bea3' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* PRINT CONTAINER WITH TEMPLATE SWITCHING */}
          <div className="resume-print-preview bg-white text-slate-900 rounded-2xl shadow-xl border overflow-hidden p-8 sm:p-12 min-h-[29.7cm] w-full text-[13px] leading-relaxed relative"
            style={{ 
              borderColor: 'var(--border)',
              fontFamily: template === 'minimal' ? '"Georgia", serif' : '"Inter", sans-serif'
            }}>
            
            {/* 1. MODERN DARK TEMPLATE */}
            {template === 'modern' && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b pb-6" style={{ borderColor: '#e2e8f0' }}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-900">{personalInfo.name || 'Your Name'}</h1>
                      <p className="text-base font-bold text-orange-600 tracking-wide mt-1 uppercase text-[12px]">{personalInfo.title}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 space-y-1.5">
                      {personalInfo.email && <p className="flex items-center justify-end gap-1.5"><Mail size={12} className="text-slate-400" /> {personalInfo.email}</p>}
                      {personalInfo.phone && <p className="flex items-center justify-end gap-1.5"><Phone size={12} className="text-slate-400" /> {personalInfo.phone}</p>}
                      {personalInfo.linkedin && <p className="flex items-center justify-end gap-1.5"><Linkedin size={12} className="text-slate-400" /> {personalInfo.linkedin}</p>}
                      {personalInfo.github && <p className="flex items-center justify-end gap-1.5"><Github size={12} className="text-slate-400" /> {personalInfo.github}</p>}
                      {personalInfo.website && <p className="flex items-center justify-end gap-1.5"><Globe size={12} className="text-slate-400" /> {personalInfo.website}</p>}
                    </div>
                  </div>
                  {personalInfo.summary && (
                    <p className="mt-4 text-slate-600 text-sm leading-relaxed border-l-2 pl-4 italic" style={{ borderColor: '#ff6d34' }}>
                      {personalInfo.summary}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Skills & Education */}
                  <div className="md:col-span-1 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 mb-3" style={{ borderColor: '#ff6d34' }}>Expertise</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 mb-3" style={{ borderColor: '#ff6d34' }}>Education</h3>
                      <div className="space-y-4">
                        {education.map(edu => (
                          <div key={edu.id} className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-xs">{edu.school || 'College/School Name'}</h4>
                            <p className="text-[11px] text-slate-600 font-medium">{edu.degree}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Work Experience & Projects */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 mb-3" style={{ borderColor: '#00bea3' }}>Experience</h3>
                      <div className="space-y-5">
                        {experience.map(exp => (
                          <div key={exp.id} className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{exp.role || 'Job Role'}</h4>
                                <p className="text-xs font-semibold text-slate-500">{exp.company || 'Company Name'}</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed pl-2 border-l" style={{ borderColor: '#e2e8f0' }}>{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-2 mb-3" style={{ borderColor: '#00bea3' }}>Key Projects</h3>
                      <div className="space-y-4">
                        {projects.map(proj => (
                          <div key={proj.id} className="space-y-1">
                            <div className="flex justify-between">
                              <h4 className="font-bold text-slate-900 text-xs">{proj.name || 'Project Name'}</h4>
                              <span className="text-[10px] font-semibold text-slate-400">{proj.role}</span>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MINIMALIST LIGHT TEMPLATE */}
            {template === 'minimal' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 border-b pb-6" style={{ borderColor: '#e2e8f0' }}>
                  <h1 className="text-3xl font-normal tracking-wide text-slate-900">{personalInfo.name || 'Your Name'}</h1>
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">{personalInfo.title}</p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600 text-[11px]">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                    {personalInfo.github && <span>• {personalInfo.github}</span>}
                    {personalInfo.website && <span>• {personalInfo.website}</span>}
                  </div>
                </div>

                {personalInfo.summary && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Summary</h3>
                    <p className="text-slate-600 text-xs leading-relaxed text-justify">{personalInfo.summary}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Experience */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: '#cbd5e1' }}>Experience</h3>
                    <div className="space-y-4">
                      {experience.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-xs">{exp.role || 'Job Role'}</span>
                            <span className="text-[10px] text-slate-500">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 italic">{exp.company || 'Company Name'}</div>
                          <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed pl-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: '#cbd5e1' }}>Projects</h3>
                    <div className="space-y-3">
                      {projects.map(proj => (
                        <div key={proj.id} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-xs">{proj.name || 'Project Name'}</span>
                            <span className="text-[10px] text-slate-500">{proj.role}</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: '#cbd5e1' }}>Education</h3>
                      <div className="space-y-3">
                        {education.map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <h4 className="font-bold text-slate-900 text-xs">{edu.school || 'College/School Name'}</h4>
                            <p className="text-[11px] text-slate-600">{edu.degree}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: '#cbd5e1' }}>Skills</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">{skills.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CREATIVE TEAL TEMPLATE */}
            {template === 'creative' && (
              <div className="space-y-6">
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-teal-500" />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b" style={{ borderColor: '#e2e8f0' }}>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-teal-800">
                      {personalInfo.name || 'Your Name'}
                    </h1>
                    <p className="text-sm font-bold text-teal-600 mt-1 uppercase tracking-widest text-[11px]">{personalInfo.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium">
                    {personalInfo.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-teal-600" /> {personalInfo.email}</span>}
                    {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-teal-600" /> {personalInfo.phone}</span>}
                    {personalInfo.linkedin && <span className="flex items-center gap-1.5"><Linkedin size={12} className="text-teal-600" /> Linkedin</span>}
                    {personalInfo.github && <span className="flex items-center gap-1.5"><Github size={12} className="text-teal-600" /> Github</span>}
                    {personalInfo.website && <span className="flex items-center gap-1.5"><Globe size={12} className="text-teal-600" /> Portfolio</span>}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  {personalInfo.summary && (
                    <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                      <p className="text-slate-600 text-xs leading-relaxed text-justify">{personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">Experience</h3>
                    <div className="space-y-4">
                      {experience.map(exp => (
                        <div key={exp.id} className="space-y-1.5 pl-1.5 border-l-2 border-teal-500">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-xs">{exp.role || 'Job Role'}</span>
                            <span className="text-[10px] font-bold text-slate-400">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{exp.company || 'Company Name'}</div>
                          <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">Projects</h3>
                    <div className="space-y-4">
                      {projects.map(proj => (
                        <div key={proj.id} className="space-y-1.5 pl-1.5 border-l-2 border-orange-500">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-xs">{proj.name || 'Project Name'}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{proj.role}</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">Education</h3>
                      <div className="space-y-3">
                        {education.map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <h4 className="font-bold text-slate-900 text-xs">{edu.school || 'College/School Name'}</h4>
                            <p className="text-[11px] text-slate-600">{edu.degree}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg inline-block">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT MEDIA ONLY INLINE STYLES */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all dashboard containers except the preview */
          aside, nav, header, main > div > div:first-child, .print\\:hidden, #__primerPortalRoot__, .Toastify {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .resume-print-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;

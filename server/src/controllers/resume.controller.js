// ════════════════════════════════════════════════════════════
//  Resume Controller
// ════════════════════════════════════════════════════════════
import prisma from '../utils/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../services/audit.service.js';

export const getResume = asyncHandler(async (req, res) => {
  const resume = await prisma.resume.findUnique({
    where: { userId: req.user.id },
  });
  
  res.json({ resume });
});

export const saveResume = asyncHandler(async (req, res) => {
  const { template, personalInfo, experience, projects, education, skills } = req.body;

  const resume = await prisma.resume.upsert({
    where: { userId: req.user.id },
    update: {
      template,
      personalInfo: personalInfo || {},
      experience: experience || [],
      projects: projects || [],
      education: education || [],
      skills: skills || [],
    },
    create: {
      userId: req.user.id,
      template: template || 'modern',
      personalInfo: personalInfo || {},
      experience: experience || [],
      projects: projects || [],
      education: education || [],
      skills: skills || [],
    },
  });

  await audit({
    userId: req.user.id,
    action: 'resume.save',
    resource: 'resume',
    resourceId: resume.id,
    req,
  });

  res.json({ success: true, resume });
});

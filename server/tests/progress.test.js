import { test } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/utils/prisma.js';
import { getMyProgress } from '../src/controllers/progress.controller.js';

test('getMyProgress calculates progress correctly', async () => {
  // Save original prisma methods
  const originalTaskCount = prisma.projectTask.count;
  const originalReportCount = prisma.report.count;
  const originalAttendanceCount = prisma.attendance.count;
  const originalReportAggregate = prisma.report.aggregate;

  // Mock prisma methods
  // Mock numbers:
  // - 10 tasks, 6 completed (60%) => weight 40% => 24%
  // - 5 reports, 4 reviewed (80%) => weight 20% => 16%
  // - 20 days attendance, 18 present (90%) => weight 20% => 18%
  // - Average score 8.5/10 (85%) => weight 20% => 17%
  // Overall progress = 24 + 16 + 18 + 17 = 75%
  
  prisma.projectTask.count = async ({ where }) => {
    if (!where.status) {
      return 10; // total tasks
    }
    return 6; // completed tasks
  };

  prisma.report.count = async ({ where }) => {
    if (!where.status) {
      return 5; // total reports
    }
    return 4; // reviewed reports
  };

  prisma.attendance.count = async ({ where }) => {
    if (!where.status) {
      return 20; // total attendance days
    }
    return 18; // present days
  };

  prisma.report.aggregate = async () => {
    return {
      _avg: {
        score: 8.5,
      },
    };
  };

  try {
    const req = {
      user: {
        id: 'user-123',
      },
    };
    
    let responseData = null;
    const res = {
      json: (data) => {
        responseData = data;
      },
    };

    await getMyProgress(req, res);

    assert.ok(responseData);
    assert.equal(responseData.overallProgress, 75);
    assert.deepEqual(responseData.tasks, {
      total: 10,
      completed: 6,
      percentage: 60,
    });
    assert.deepEqual(responseData.reports, {
      total: 5,
      reviewed: 4,
      percentage: 80,
    });
    assert.deepEqual(responseData.attendance, {
      total: 20,
      present: 18,
      percentage: 90,
    });
    assert.deepEqual(responseData.score, {
      average: 8.5,
      percentage: 85,
    });
  } finally {
    // Restore prisma methods
    prisma.projectTask.count = originalTaskCount;
    prisma.report.count = originalReportCount;
    prisma.attendance.count = originalAttendanceCount;
    prisma.report.aggregate = originalReportAggregate;
  }
});

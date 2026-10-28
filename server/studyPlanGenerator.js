/**
 * Personalized Study Plan Builder
 */

export function generatePersonalizedStudyPlan(parsedSyllabus, durationDays = 14, hoursPerDay = 3) {
  const { meta, modules } = parsedSyllabus;

  // Flatten all topics across modules
  const allTopics = [];
  modules.forEach(mod => {
    mod.topics.forEach(topic => {
      allTopics.push({
        unitNumber: mod.unitNumber,
        moduleTitle: mod.title,
        topic
      });
    });
  });

  const totalTopics = allTopics.length;
  const numDays = Math.max(3, Math.min(60, parseInt(durationDays, 10) || 14));
  const dailyHours = parseFloat(hoursPerDay) || 3;

  // Reserve last 2 days for final full revision & mock tests
  const activeStudyDays = Math.max(1, numDays - 2);
  const topicsPerDay = Math.max(1, Math.ceil(totalTopics / activeStudyDays));

  const schedule = [];
  let topicIdx = 0;

  for (let day = 1; day <= numDays; day++) {
    if (day <= activeStudyDays) {
      const dayTopics = allTopics.slice(topicIdx, topicIdx + topicsPerDay);
      topicIdx += topicsPerDay;

      const primaryUnit = dayTopics.length > 0 ? dayTopics[0].unitNumber : '1';
      const primaryTitle = dayTopics.length > 0 ? dayTopics[0].moduleTitle : 'General Revision';

      schedule.push({
        day: `Day ${day}`,
        dayNumber: day,
        focus: `Unit ${primaryUnit}: ${primaryTitle}`,
        allocatedHours: `${dailyHours} Hours`,
        targetTopics: dayTopics.map(t => t.topic),
        tasks: [
          `Read & summarize core concepts of ${dayTopics[0]?.topic || 'Unit Topics'} (${Math.round(dailyHours * 0.4 * 60)} mins)`,
          `Solve 2-3 sample numericals/theorems on ${dayTopics[1]?.topic || 'practice problems'} (${Math.round(dailyHours * 0.4 * 60)} mins)`,
          `Self-Quiz & flashcard recall session (${Math.round(dailyHours * 0.2 * 60)} mins)`
        ],
        type: 'study'
      });
    } else if (day === activeStudyDays + 1) {
      schedule.push({
        day: `Day ${day}`,
        dayNumber: day,
        focus: `Comprehensive Module-Wise Revision`,
        allocatedHours: `${dailyHours} Hours`,
        targetTopics: ['All High-Priority Exam Topics', 'Formula Sheet Review'],
        tasks: [
          `Review summaries for all ${modules.length} syllabus modules`,
          `Practice high-priority exam questions from Exam Focus tab`,
          `Consolidate key formulas, diagrams, and definitions`
        ],
        type: 'revision'
      });
    } else {
      schedule.push({
        day: `Day ${day}`,
        dayNumber: day,
        focus: `Mock Test & Final Readiness Assessment`,
        allocatedHours: `${dailyHours} Hours`,
        targetTopics: ['Full Syllabus Mock Paper', 'Exam Simulation'],
        tasks: [
          `Simulate 3-hour timed exam paper based on syllabus topics`,
          `Review weak spots & re-read difficult module notes`,
          `Get 8 hours of sleep before exam day!`
        ],
        type: 'mock'
      });
    }
  }

  return {
    meta: {
      courseTitle: meta.courseTitle,
      totalDays: numDays,
      dailyHours,
      totalPlannedHours: numDays * dailyHours,
      completionRate: '0%'
    },
    schedule
  };
}

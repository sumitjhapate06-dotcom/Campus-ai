/**
 * Module Summaries & Important Topics Generator
 */

export function generateModuleSummaries(modules) {
  return modules.map(mod => {
    const topicCount = mod.topics.length;
    const keyTakeaways = generateKeyTakeaways(mod.title, mod.topics);
    const keyDefinitions = generateKeyDefinitions(mod.topics);

    return {
      moduleId: mod.id,
      unitNumber: mod.unitNumber,
      title: mod.title,
      hours: mod.hours,
      weightage: mod.weightage,
      summary: `Unit ${mod.unitNumber} (${mod.title}) focuses on ${mod.topics.slice(0, 3).join(', ')}. It comprises ${topicCount} distinct sub-topics with ${mod.hours} hours of academic load.`,
      keyTakeaways,
      keyDefinitions,
      examTips: `Focus heavily on ${mod.topics[0] || 'core theorems'} and practical problem solving. Make sure to review diagrams and algorithm steps.`
    };
  });
}

export function generateImportantExamTopics(modules) {
  const highPriority = [];
  const mediumPriority = [];
  const standardPriority = [];

  modules.forEach(mod => {
    mod.topics.forEach((topic, idx) => {
      const topicLower = topic.toLowerCase();
      
      // Heuristic scoring based on topic keywords and unit order
      let priorityScore = 50;
      
      if (topicLower.includes('algorithm') || topicLower.includes('architecture') || topicLower.includes('design') || topicLower.includes('theory') || topicLower.includes('model') || topicLower.includes('system')) {
        priorityScore += 30;
      }
      if (topicLower.includes('introduction') || topicLower.includes('overview') || topicLower.includes('history')) {
        priorityScore -= 20;
      }

      // First 2 topics of high-weightage modules get priority boost
      if (idx < 2 && mod.hours >= 8) {
        priorityScore += 20;
      }

      const item = {
        id: `topic-${mod.id}-${idx}`,
        topic,
        unitNumber: mod.unitNumber,
        moduleTitle: mod.title,
        priorityScore,
        estimatedExamMarks: priorityScore > 75 ? '10-15 Marks' : (priorityScore > 50 ? '5-10 Marks' : '2-5 Marks'),
        reason: priorityScore > 75 
          ? 'Frequently tested core architectural/theoretical concept.'
          : 'Standard syllabus topic likely to appear in medium-length questions.'
      };

      if (priorityScore > 75) {
        highPriority.push(item);
      } else if (priorityScore > 45) {
        mediumPriority.push(item);
      } else {
        standardPriority.push(item);
      }
    });
  });

  // Ensure highPriority has top items
  highPriority.sort((a, b) => b.priorityScore - a.priorityScore);
  mediumPriority.sort((a, b) => b.priorityScore - a.priorityScore);

  // Generate likely exam questions
  const likelyQuestions = modules.flatMap(mod => {
    if (mod.topics.length === 0) return [];
    const mainTopic = mod.topics[0];
    const subTopic = mod.topics[1] || mod.topics[0];

    return [
      {
        id: `q-${mod.id}-1`,
        unitNumber: mod.unitNumber,
        question: `Explain the fundamental principles of ${mainTopic} in detail. Compare it with traditional approaches.`,
        marks: '10 Marks',
        difficulty: 'Hard'
      },
      {
        id: `q-${mod.id}-2`,
        unitNumber: mod.unitNumber,
        question: `Write short notes on ${subTopic} detailing its key components, working mechanism, and applications.`,
        marks: '5 Marks',
        difficulty: 'Medium'
      }
    ];
  });

  return {
    highPriority: highPriority.slice(0, 8),
    mediumPriority: mediumPriority.slice(0, 10),
    standardPriority: standardPriority.slice(0, 10),
    likelyQuestions
  };
}

function generateKeyTakeaways(title, topics) {
  const takeaways = [];
  
  if (topics.length > 0) {
    takeaways.push(`Comprehensive understanding of ${topics[0]}.`);
  }
  if (topics.length > 1) {
    takeaways.push(`Mastering the structural design and working of ${topics[1]}.`);
  }
  if (topics.length > 2) {
    takeaways.push(`Analytical problem-solving involving ${topics[2]}.`);
  }

  takeaways.push(`Practical implementation patterns and real-world trade-offs in ${title}.`);
  return takeaways;
}

function generateKeyDefinitions(topics) {
  return topics.slice(0, 4).map(topic => ({
    term: topic,
    definition: `A fundamental concept in the syllabus dealing with ${topic.toLowerCase()}, essential for core module understanding.`
  }));
}

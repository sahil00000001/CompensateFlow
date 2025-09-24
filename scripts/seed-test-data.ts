import { db } from '../server/db';
import { 
  users, 
  reviewCycles, 
  employeeReviews,
  feedback,
  activityLogs
} from '../shared/schema';

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Create test users with hierarchical structure
    console.log('Creating users...');
    
    // Founder (Harry)
    const harry = await db.insert(users).values({
      id: 'harry-founder-001',
      email: 'harry@company.com',
      firstName: 'Harry',
      lastName: 'Founder',
      role: 'founder',
      department: 'Executive',
      isActive: true,
    }).returning();

    // L1 Manager
    const l1Manager = await db.insert(users).values({
      id: 'l1-manager-001',
      email: 'l1manager@company.com',
      firstName: 'Alice',
      lastName: 'L1Manager',
      role: 'l1_manager',
      department: 'Engineering',
      managerId: harry[0].id,
      isActive: true,
    }).returning();

    // L2 Managers
    const l2Manager1 = await db.insert(users).values({
      id: 'l2-manager-001',
      email: 'l2manager1@company.com',
      firstName: 'Bob',
      lastName: 'L2Manager',
      role: 'l2_manager',
      department: 'Engineering',
      managerId: l1Manager[0].id,
      isActive: true,
    }).returning();

    const l2Manager2 = await db.insert(users).values({
      id: 'l2-manager-002',
      email: 'l2manager2@company.com',
      firstName: 'Carol',
      lastName: 'L2Manager',
      role: 'l2_manager',
      department: 'Design',
      managerId: l1Manager[0].id,
      isActive: true,
    }).returning();

    // L3 Managers
    const l3Manager1 = await db.insert(users).values({
      id: 'l3-manager-001',
      email: 'l3manager1@company.com',
      firstName: 'David',
      lastName: 'L3Manager',
      role: 'l3_manager',
      department: 'Engineering',
      managerId: l2Manager1[0].id,
      isActive: true,
    }).returning();

    const l3Manager2 = await db.insert(users).values({
      id: 'l3-manager-002',
      email: 'l3manager2@company.com',
      firstName: 'Eve',
      lastName: 'L3Manager',
      role: 'l3_manager',
      department: 'Design',
      managerId: l2Manager2[0].id,
      isActive: true,
    }).returning();

    // Peers - Software Developers
    const dev1 = await db.insert(users).values({
      id: 'dev-001',
      email: 'john.dev@company.com',
      firstName: 'John',
      lastName: 'Developer',
      role: 'peer',
      category: 'software_developer',
      department: 'Engineering',
      managerId: l3Manager1[0].id,
      isActive: true,
    }).returning();

    const dev2 = await db.insert(users).values({
      id: 'dev-002',
      email: 'jane.dev@company.com',
      firstName: 'Jane',
      lastName: 'Developer',
      role: 'peer',
      category: 'software_developer',
      department: 'Engineering',
      managerId: l3Manager1[0].id,
      isActive: true,
    }).returning();

    // ML Engineer
    const mlEngineer = await db.insert(users).values({
      id: 'ml-001',
      email: 'mike.ml@company.com',
      firstName: 'Mike',
      lastName: 'MLEngineer',
      role: 'peer',
      category: 'ml_engineer',
      department: 'Engineering',
      managerId: l3Manager1[0].id,
      isActive: true,
    }).returning();

    // QA Engineer
    const qaEngineer = await db.insert(users).values({
      id: 'qa-001',
      email: 'sara.qa@company.com',
      firstName: 'Sara',
      lastName: 'QAEngineer',
      role: 'peer',
      category: 'qa_engineer',
      department: 'Engineering',
      managerId: l3Manager1[0].id,
      isActive: true,
    }).returning();

    // UI/UX Developer
    const uxDeveloper = await db.insert(users).values({
      id: 'ux-001',
      email: 'alex.ux@company.com',
      firstName: 'Alex',
      lastName: 'UXDeveloper',
      role: 'peer',
      category: 'ui_ux_developer',
      department: 'Design',
      managerId: l3Manager2[0].id,
      isActive: true,
    }).returning();

    console.log('✅ Users created successfully');

    // Create active review cycle
    console.log('Creating review cycle...');
    const reviewCycle = await db.insert(reviewCycles).values({
      id: 'cycle-2024-annual',
      name: '2024 Annual Performance Review',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
      selfAssessmentDeadline: new Date('2024-02-15'),
      feedbackDeadline: new Date('2024-03-15'),
      reviewDeadline: new Date('2024-04-15'),
      meetingDeadline: new Date('2024-05-15'),
      isActive: true,
    }).returning();

    console.log('✅ Review cycle created successfully');

    // Create employee reviews for peers
    console.log('Creating employee reviews...');
    const peers = [dev1[0], dev2[0], mlEngineer[0], qaEngineer[0], uxDeveloper[0]];
    
    for (const peer of peers) {
      await db.insert(employeeReviews).values({
        employeeId: peer.id,
        cycleId: reviewCycle[0].id,
        status: 'self_assessment',
        selfAssessmentData: {
          currentCtc: '1200000',
          expectedCtc: '1400000',
          expectedIncrementPercentage: '15',
          careerGoals: 'Looking to take on more technical leadership responsibilities and contribute to system architecture decisions.',
          trainingNeeds: 'Advanced system design, leadership training',
          workFromHomePreference: 'hybrid',
          projectContributions: 'Led the development of the user authentication system, implemented OAuth integration, improved API performance by 30%.',
          teamCollaboration: '4',
          initiatives: 'Initiated weekly tech talks, mentored 2 junior developers, proposed and implemented code review process improvements.',
          challenges: 'Faced challenges with legacy system integration, resolved by creating abstraction layers and incremental migration strategy.',
          areasOfImprovement: 'Want to improve project management skills and learn more about cloud architecture patterns.',
          categorySpecificFields: {
            'Technical skills assessment': '4',
            'Code quality metrics': '4',
            'Bug resolution rate': '5',
            'Feature delivery count': '4',
          },
          additionalComments: 'Excited about the upcoming projects and ready to take on more responsibilities.',
        },
      });
    }

    console.log('✅ Employee reviews created successfully');

    // Create some sample 360-degree feedback
    console.log('Creating sample feedback...');
    const johnReview = await db.query.employeeReviews.findFirst({
      where: (reviews, { eq }) => eq(reviews.employeeId, dev1[0].id),
    });

    if (johnReview) {
      // Feedback from Jane (peer)
      await db.insert(feedback).values({
        reviewId: johnReview.id,
        feedbackFromId: dev2[0].id,
        technicalCompetence: '4',
        communicationSkills: '5',
        teamCollaboration: '5',
        problemSolving: '4',
        leadershipPotential: '4',
        reliability: '5',
        innovation: '4',
        overallFeedback: 'John is an excellent team member who consistently delivers high-quality code. He has strong communication skills and is always willing to help teammates. His technical knowledge is impressive and he approaches problems methodically.',
        strengths: 'Strong technical skills, excellent communication, reliable, great team player',
        improvements: 'Could benefit from more exposure to system architecture and cloud technologies',
        isAnonymous: true,
      });

      // Feedback from Mike (peer)
      await db.insert(feedback).values({
        reviewId: johnReview.id,
        feedbackFromId: mlEngineer[0].id,
        technicalCompetence: '4',
        communicationSkills: '4',
        teamCollaboration: '4',
        problemSolving: '5',
        leadershipPotential: '3',
        reliability: '5',
        innovation: '4',
        overallFeedback: 'John has strong problem-solving abilities and writes clean, maintainable code. He contributes well to team discussions and is always ready to tackle challenging technical problems.',
        strengths: 'Excellent problem-solving skills, writes clean code, handles complex technical challenges well',
        improvements: 'Could take more initiative in proposing new solutions and improvements',
        isAnonymous: true,
      });
    }

    console.log('✅ Sample feedback created successfully');

    // Create some activity logs
    console.log('Creating activity logs...');
    await db.insert(activityLogs).values([
      {
        userId: dev1[0].id,
        action: 'self_assessment_completed',
        description: 'Completed self-assessment for 2024 annual review',
        relatedEntityType: 'review',
        relatedEntityId: johnReview?.id,
      },
      {
        userId: dev2[0].id,
        action: 'feedback_submitted',
        description: 'Submitted 360-degree feedback',
        relatedEntityType: 'feedback',
      },
      {
        userId: mlEngineer[0].id,
        action: 'feedback_submitted',
        description: 'Submitted 360-degree feedback',
        relatedEntityType: 'feedback',
      },
    ]);

    console.log('✅ Activity logs created successfully');
    console.log('🎉 Test data seeding completed!');
    console.log('\nTest Users Created:');
    console.log('👑 Founder: harry@company.com (Harry Founder)');
    console.log('🏢 L1 Manager: l1manager@company.com (Alice L1Manager)');
    console.log('📊 L2 Managers: l2manager1@company.com (Bob), l2manager2@company.com (Carol)');
    console.log('👥 L3 Managers: l3manager1@company.com (David), l3manager2@company.com (Eve)');
    console.log('💻 Developers: john.dev@company.com (John), jane.dev@company.com (Jane)');
    console.log('🤖 ML Engineer: mike.ml@company.com (Mike)');
    console.log('🧪 QA Engineer: sara.qa@company.com (Sara)');
    console.log('🎨 UX Developer: alex.ux@company.com (Alex)');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTestData().catch(console.error);
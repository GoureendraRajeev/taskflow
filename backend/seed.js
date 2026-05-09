const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data (optional, but good for a fresh seed)
    await pool.query('TRUNCATE users, projects, tasks, activity_log, project_members RESTART IDENTITY CASCADE');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES 
      ('Admin User', 'admin@taskflow.com', $1, 'admin'),
      ('John Doe', 'john@taskflow.com', $1, 'member'),
      ('Jane Smith', 'jane@taskflow.com', $1, 'member'),
      ('Mike Ross', 'mike@taskflow.com', $1, 'member')
      RETURNING id, name, email, role
    `, [hashedPassword]);

    const adminId = users.rows[0].id;
    const member1Id = users.rows[1].id;
    const member2Id = users.rows[2].id;
    const member3Id = users.rows[3].id;

    console.log('Users created');

    // 2. Create Projects
    const projects = await pool.query(`
      INSERT INTO projects (name, description, deadline, owner_id) VALUES 
      ('Website Redesign', 'Complete overhaul of the company landing page and blog.', CURRENT_DATE + INTERVAL '30 days', $1),
      ('Mobile App Launch', 'Preparing for the iOS and Android app release.', CURRENT_DATE + INTERVAL '15 days', $1),
      ('Q3 Marketing Campaign', 'Social media and email marketing drive.', CURRENT_DATE - INTERVAL '2 days', $1)
      RETURNING id, name
    `, [adminId]);

    const project1Id = projects.rows[0].id;
    const project2Id = projects.rows[1].id;
    const project3Id = projects.rows[2].id;

    console.log('Projects created');

    // 3. Add Members to Projects
    await pool.query(`
      INSERT INTO project_members (project_id, user_id) VALUES 
      ($1, $2), ($1, $3), ($1, $4),
      ($5, $2), ($5, $3),
      ($6, $4)
    `, [project1Id, member1Id, member2Id, member3Id, project2Id, project3Id]);

    console.log('Project members assigned');

    // 4. Create Tasks
    await pool.query(`
      INSERT INTO tasks (title, description, priority, status, due_date, project_id, assigned_to, created_by) VALUES 
      ('Design Mockups', 'Create Figma mockups for the homepage.', 'high', 'completed', CURRENT_DATE - INTERVAL '5 days', $1, $2, $1),
      ('Develop API', 'Build the backend REST API.', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '10 days', $1, $3, $1),
      ('Testing Strategy', 'Define the unit and integration test plan.', 'low', 'pending', CURRENT_DATE + INTERVAL '20 days', $1, $4, $1),
      ('App Store Submission', 'Upload builds to App Store Connect.', 'high', 'in_progress', CURRENT_DATE + INTERVAL '2 days', $5, $2, $1),
      ('Fix Navigation Bug', 'Resolve the menu issue on mobile devices.', 'medium', 'completed', CURRENT_DATE - INTERVAL '1 day', $5, $3, $1),
      ('Finalize Copy', 'Review all marketing copy for the campaign.', 'high', 'pending', CURRENT_DATE - INTERVAL '5 days', $6, $4, $1)
    `, [project1Id, member1Id, member2Id, member3Id, project2Id, project3Id]);

    console.log('Tasks created');

    // 5. Log Initial Activity
    await pool.query(`
      INSERT INTO activity_log (action, user_id, project_id) VALUES 
      ('System initialization completed', $1, $2),
      ('Website Redesign project started', $1, $2),
      ('Admin added 3 new members to the team', $1, $2)
    `, [adminId, project1Id]);

    console.log('Database seeded successfully! 🚀');
    console.log('\n--- Test Accounts ---');
    console.log('Admin: admin@taskflow.com / password123');
    console.log('Member: john@taskflow.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();

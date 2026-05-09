const { pool } = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at,
        COUNT(DISTINCT t.id) AS total_tasks_assigned,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
        ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS projects
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      LEFT JOIN project_members pm ON u.id = pm.user_id
      LEFT JOIN projects p ON pm.project_id = p.id
      GROUP BY u.id
      ORDER BY u.name;
    `;

    const users = await pool.query(query);

    res.status(200).json({
      success: true,
      data: users.rows
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers };

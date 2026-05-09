const { pool, logActivity } = require('../config/db');

const createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const newProject = await pool.query(
      'INSERT INTO projects (name, description, deadline, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, deadline, req.user.id]
    );

    const project = newProject.rows[0];

    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
      [project.id, req.user.id]
    );

    await logActivity(`Project ${name} was created`, req.user.id, project.id, null);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllProjects = async (req, res) => {
  try {
    let query;
    let queryParams = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, 
          COUNT(DISTINCT pm.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS total_task_count,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_task_count
        FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
    } else {
      query = `
        SELECT p.*, 
          COUNT(DISTINCT pm2.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS total_task_count,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_task_count
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      queryParams.push(req.user.id);
    }

    const projects = await pool.query(query, queryParams);

    const data = projects.rows.map(p => {
      const total = parseInt(p.total_task_count) || 0;
      const completed = parseInt(p.completed_task_count) || 0;
      p.completion_percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return p;
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get All Projects Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const projectQuery = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const project = projectQuery.rows[0];

    if (req.user.role !== 'admin') {
      const memberCheck = await pool.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const membersQuery = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = $1
    `, [id]);

    const tasksQuery = await pool.query(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [id]);

    project.members = membersQuery.rows;
    project.tasks = tasksQuery.rows;

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, deadline } = req.body;

    const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updated = await pool.query(
      'UPDATE projects SET name = $1, description = $2, deadline = $3 WHERE id = $4 RETURNING *',
      [name || projectCheck.rows[0].name, description, deadline, id]
    );

    res.status(200).json({
      success: true,
      data: updated.rows[0]
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    await logActivity(`Project ${projectCheck.rows[0].name} was deleted`, req.user.id, null, null);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );
    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already in project' });
    }

    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
      [id, userId]
    );

    await logActivity(`${userCheck.rows[0].name} was added to project ${projectCheck.rows[0].name}`, req.user.id, id, null);

    res.status(201).json({
      success: true,
      message: 'Member added successfully'
    });
  } catch (error) {
    console.error('Add Member Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (projectCheck.rows[0].owner_id === parseInt(userId)) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner' });
    }

    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [id, userId]);
    
    await logActivity(`A member was removed from project ${projectCheck.rows[0].name}`, req.user.id, id, null);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove Member Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};

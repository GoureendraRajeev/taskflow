const { pool, logActivity } = require('../config/db');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, project_id, assigned_to } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ success: false, message: 'Title and project_id are required' });
    }

    const projectCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [project_id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (assigned_to) {
      const memberCheck = await pool.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [project_id, assigned_to]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'User is not a project member' });
      }
    }

    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, priority, due_date, project_id, assigned_to, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, priority || 'medium', due_date, project_id, assigned_to, req.user.id]
    );

    const task = newTask.rows[0];

    const assignee = await pool.query('SELECT name FROM users WHERE id = $1', [assigned_to]);
    const assigneeName = assignee.rows.length > 0 ? assignee.rows[0].name : 'unassigned';

    await logActivity(`Task ${title} was created and assigned to ${assigneeName}`, req.user.id, project_id, task.id);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let query;
    let queryParams = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT t.*, p.name as project_name, u1.name as assigned_to_name, u2.name as created_by_name,
        (t.due_date < CURRENT_DATE AND t.status != 'completed') as is_overdue
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        ORDER BY t.created_at DESC
      `;
    } else {
      query = `
        SELECT t.*, p.name as project_name, u1.name as assigned_to_name, u2.name as created_by_name,
        (t.due_date < CURRENT_DATE AND t.status != 'completed') as is_overdue
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.assigned_to = $1
        ORDER BY t.created_at DESC
      `;
      queryParams.push(req.user.id);
    }

    const tasks = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      data: tasks.rows
    });
  } catch (error) {
    console.error('Get All Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (req.user.role !== 'admin') {
      const memberCheck = await pool.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, req.user.id]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const tasks = await pool.query(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [projectId]);

    res.status(200).json({
      success: true,
      data: tasks.rows
    });
  } catch (error) {
    console.error('Get Tasks By Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    let query;
    let queryParams = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT t.*, p.name as project_name, u.name as assigned_to_name,
        EXTRACT(DAY FROM (CURRENT_DATE - t.due_date)) as days_overdue
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.due_date < CURRENT_DATE AND t.status != 'completed'
        ORDER BY t.due_date ASC
      `;
    } else {
      query = `
        SELECT t.*, p.name as project_name, u.name as assigned_to_name,
        EXTRACT(DAY FROM (CURRENT_DATE - t.due_date)) as days_overdue
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.due_date < CURRENT_DATE AND t.status != 'completed' AND t.assigned_to = $1
        ORDER BY t.due_date ASC
      `;
      queryParams.push(req.user.id);
    }

    const tasks = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      data: tasks.rows
    });
  } catch (error) {
    console.error('Get Overdue Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const existingTask = taskCheck.rows[0];

    if (req.user.role !== 'admin') {
      if (existingTask.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const { status } = req.body;
      const invalidFields = Object.keys(req.body).filter(key => key !== 'status');
      if (invalidFields.length > 0) {
        return res.status(403).json({ success: false, message: 'Members can only update status' });
      }

      const updated = await pool.query(
        'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status || existingTask.status, id]
      );

      await logActivity(`Task ${existingTask.title} status changed to ${status}`, req.user.id, existingTask.project_id, id);

      return res.status(200).json({ success: true, data: updated.rows[0] });
    }

    const { title, description, priority, status, due_date, assigned_to } = req.body;

    const updated = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, priority = $3, status = $4, due_date = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [
        title || existingTask.title,
        description !== undefined ? description : existingTask.description,
        priority || existingTask.priority,
        status || existingTask.status,
        due_date !== undefined ? due_date : existingTask.due_date,
        assigned_to !== undefined ? assigned_to : existingTask.assigned_to,
        id
      ]
    );

    if (status && status !== existingTask.status) {
      await logActivity(`Task ${existingTask.title} status changed to ${status}`, req.user.id, existingTask.project_id, id);
    }

    res.status(200).json({ success: true, data: updated.rows[0] });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    await logActivity(`Task ${taskCheck.rows[0].title} was deleted`, req.user.id, taskCheck.rows[0].project_id, null);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  getOverdueTasks,
  updateTask,
  deleteTask
};

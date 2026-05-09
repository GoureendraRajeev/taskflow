const { pool } = require('../config/db');

const getAdminDashboard = async (req, res) => {
  try {
    const totalProjects = await pool.query('SELECT COUNT(*) FROM projects');
    const totalMembers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'member'");
    const totalTasks = await pool.query('SELECT COUNT(*) FROM tasks');
    const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'completed'");
    const inProgressTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'in_progress'");
    const pendingTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'pending'");
    const overdueTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE AND status != 'completed'");

    const taskStatusBreakdown = {
      pending: parseInt(pendingTasks.rows[0].count),
      in_progress: parseInt(inProgressTasks.rows[0].count),
      completed: parseInt(completedTasks.rows[0].count)
    };

    const projectProgress = await pool.query(`
      SELECT p.name as project_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
    `);

    const formattedProjectProgress = projectProgress.rows.map(p => ({
      project_name: p.project_name,
      total_tasks: parseInt(p.total_tasks),
      completed_tasks: parseInt(p.completed_tasks),
      completion_percentage: parseInt(p.total_tasks) === 0 ? 0 : Math.round((parseInt(p.completed_tasks) / parseInt(p.total_tasks)) * 100)
    }));

    const memberStats = await pool.query(`
      SELECT u.name as member_name,
        COUNT(t.id) as assigned_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_count
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE u.role = 'member'
      GROUP BY u.id
    `);

    const topPerformers = await pool.query(`
      SELECT u.name, COUNT(t.id) as completed_count
      FROM users u
      JOIN tasks t ON u.id = t.assigned_to
      WHERE t.status = 'completed' AND t.updated_at >= date_trunc('week', CURRENT_DATE)
      GROUP BY u.id
      ORDER BY completed_count DESC
      LIMIT 3
    `);

    const completedPerDay = await pool.query(`
      SELECT EXTRACT(ISODOW FROM updated_at) as day_of_week, COUNT(*) as count
      FROM tasks
      WHERE status = 'completed' AND updated_at >= date_trunc('week', CURRENT_DATE)
      GROUP BY EXTRACT(ISODOW FROM updated_at)
      ORDER BY day_of_week
    `);

    const daysMap = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'};
    const tasksCompletedPerDay = [1,2,3,4,5,6,7].map(d => ({
      day: daysMap[d],
      count: parseInt(completedPerDay.rows.find(r => parseInt(r.day_of_week) === d)?.count || 0)
    }));

    const upcomingDeadlines = await pool.query(`
      SELECT t.title, p.name as project_name, u.name as assignee_name, t.due_date
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '7 days'
      AND t.status != 'completed'
      ORDER BY t.due_date ASC
    `);

    const recentActivity = await pool.query(`
      SELECT action as action_text, created_at
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total_projects: parseInt(totalProjects.rows[0].count),
          total_members: parseInt(totalMembers.rows[0].count),
          total_tasks: parseInt(totalTasks.rows[0].count),
          completed_tasks: parseInt(completedTasks.rows[0].count),
          in_progress_tasks: parseInt(inProgressTasks.rows[0].count),
          pending_tasks: parseInt(pendingTasks.rows[0].count),
          overdue_tasks: parseInt(overdueTasks.rows[0].count)
        },
        task_status_breakdown: taskStatusBreakdown,
        project_progress: formattedProjectProgress,
        member_stats: memberStats.rows,
        top_performers: topPerformers.rows,
        tasks_completed_per_day: tasksCompletedPerDay,
        upcoming_deadlines: upcomingDeadlines.rows,
        recent_activity: recentActivity.rows
      }
    });

  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const myTasks = await pool.query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1', [userId]);
    const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'completed'", [userId]);
    const inProgressTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'in_progress'", [userId]);
    const pendingTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'pending'", [userId]);
    const overdueTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < CURRENT_DATE AND status != 'completed'", [userId]);

    const tasksList = await pool.query(`
      SELECT t.*, p.name as project_name,
      (t.due_date < CURRENT_DATE AND t.status != 'completed') as is_overdue
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = $1
      ORDER BY t.created_at DESC
    `, [userId]);

    const myProjects = await pool.query(`
      SELECT p.name as project_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id AND t.assigned_to = $1
      WHERE pm.user_id = $1
      GROUP BY p.id
    `, [userId]);

    const formattedMyProjects = myProjects.rows.map(p => ({
      project_name: p.project_name,
      total_tasks: parseInt(p.total_tasks),
      completed_tasks: parseInt(p.completed_tasks),
      completion_percentage: parseInt(p.total_tasks) === 0 ? 0 : Math.round((parseInt(p.completed_tasks) / parseInt(p.total_tasks)) * 100)
    }));

    const upcomingDeadlines = await pool.query(`
      SELECT t.title, p.name as project_name, t.due_date
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = $1
      AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '7 days'
      AND t.status != 'completed'
      ORDER BY t.due_date ASC
    `, [userId]);

    const completedPerDay = await pool.query(`
      SELECT EXTRACT(ISODOW FROM updated_at) as day_of_week, COUNT(*) as count
      FROM tasks
      WHERE assigned_to = $1 AND status = 'completed' AND updated_at >= date_trunc('week', CURRENT_DATE)
      GROUP BY EXTRACT(ISODOW FROM updated_at)
      ORDER BY day_of_week
    `, [userId]);

    const daysMap = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'};
    const tasksCompletedPerDay = [1,2,3,4,5,6,7].map(d => ({
      day: daysMap[d],
      count: parseInt(completedPerDay.rows.find(r => parseInt(r.day_of_week) === d)?.count || 0)
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total_tasks: parseInt(myTasks.rows[0].count),
          completed_tasks: parseInt(completedTasks.rows[0].count),
          in_progress_tasks: parseInt(inProgressTasks.rows[0].count),
          pending_tasks: parseInt(pendingTasks.rows[0].count),
          overdue_tasks: parseInt(overdueTasks.rows[0].count)
        },
        tasks_list: tasksList.rows,
        projects: formattedMyProjects,
        upcoming_deadlines: upcomingDeadlines.rows,
        tasks_completed_per_day: tasksCompletedPerDay
      }
    });

  } catch (error) {
    console.error('Member Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAdminDashboard, getMemberDashboard };

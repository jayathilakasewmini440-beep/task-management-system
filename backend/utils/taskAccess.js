const TaskModel = require('../models/taskModel');

// Roles with full, cross-object access. Mirrors taskController.getTaskById, which
// only object-gates Collaborators; Admin and Project Manager are unrestricted
// (PM scope rests on the AM-7 working assumption — see NOTES-AUDIT-FIXES.md).
const FULL_ACCESS_ROLES = ['Admin', 'Project Manager'];

/**
 * RC-1: object-level authorization for a task.
 * Reuses the existing relationship rule (creator or assignee) so that a
 * Collaborator can only reach a task they own or are assigned to, regardless of
 * which resource (task / comment / attachment) referenced it.
 *
 * Resolves `{ allowed, found }`:
 *   - `found`  — whether the task exists (lets callers pick 404 vs 403).
 *   - `allowed` — whether `user` may access it.
 */
function canAccessTask(taskId, user) {
  return new Promise((resolve, reject) => {
    if (FULL_ACCESS_ROLES.includes(user.role)) {
      return resolve({ allowed: true, found: true });
    }

    TaskModel.getTaskById(taskId, (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) {
        return resolve({ allowed: false, found: false });
      }
      if (Number(rows[0].created_by) === Number(user.id)) {
        return resolve({ allowed: true, found: true });
      }
      TaskModel.isUserAssigned(taskId, user.id, (assignErr, assignRows) => {
        if (assignErr) return reject(assignErr);
        resolve({ allowed: (assignRows || []).length > 0, found: true });
      });
    });
  });
}

module.exports = { canAccessTask, FULL_ACCESS_ROLES };

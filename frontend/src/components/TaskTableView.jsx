import AvatarStack from './AvatarStack';

const PRIORITY_CLASS = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
};

const STATUS_CLASS = {
  'To Do': 'status-todo',
  'In Progress': 'status-progress',
  Completed: 'status-done',
};

const STATUSES = ['To Do', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskTableView({
  tasks,
  onOpenTask,
  onStatusChange,
  canManageTasks,
  showProject = false,
  filters = null,
  projects = null,
}) {
  // Sort + per-column filters are driven by the shared useTaskFilters state.
  const sortable = Boolean(filters && typeof filters.setSort === 'function');
  const sortBy = filters?.sortBy ?? null;
  const sortOrder = filters?.sortOrder ?? 'asc';

  const indicator = (field) => (sortBy === field ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '');
  const headerProps = (field) =>
    sortable
      ? {
          className: 'data-table__sortable',
          onClick: () => filters.setSort(field),
          role: 'button',
          tabIndex: 0,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              filters.setSort(field);
            }
          },
          'aria-sort': sortBy === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none',
        }
      : {};

  const colSpan = showProject ? 6 : 5;

  return (
    <div className="table-wrap task-table panel panel--flush">
      <table className="data-table">
        <thead>
          <tr>
            <th {...headerProps('title')}>Task{indicator('title')}</th>
            {showProject && <th>Project</th>}
            <th>Assignees</th>
            <th {...headerProps('priority')}>Priority{indicator('priority')}</th>
            <th {...headerProps('status')}>Status{indicator('status')}</th>
            <th {...headerProps('due_date')}>Due date{indicator('due_date')}</th>
          </tr>
          {filters && (
            <tr className="data-table__filter-row">
              <th aria-hidden="true" />
              {showProject && (
                <th>
                  <select
                    className="select-pill select-pill--table"
                    aria-label="Filter by project"
                    value={filters.project}
                    onChange={(e) => filters.setProject(e.target.value)}
                  >
                    <option value="all">All</option>
                    {(projects || []).map((p) => (
                      <option key={p.id} value={p.id}>{p.project_name || p.name}</option>
                    ))}
                  </select>
                </th>
              )}
              <th>
                <select
                  className="select-pill select-pill--table"
                  aria-label="Filter by assignee"
                  value={filters.assignee}
                  onChange={(e) => filters.setAssignee(e.target.value)}
                >
                  <option value="">All</option>
                  {filters.assigneeOptions.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </th>
              <th>
                <select
                  className="select-pill select-pill--table"
                  aria-label="Filter by priority"
                  value={filters.priority}
                  onChange={(e) => filters.setPriority(e.target.value)}
                >
                  <option value="">All</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </th>
              <th>
                <select
                  className="select-pill select-pill--table"
                  aria-label="Filter by status"
                  value={filters.status}
                  onChange={(e) => filters.setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </th>
              <th aria-hidden="true" />
            </tr>
          )}
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="data-table__empty muted">
                No tasks match your filters
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const assignees = Array.isArray(task.assignees) ? task.assignees : [];
              return (
                <tr
                  key={task.id}
                  className="data-table__row--clickable"
                  onClick={() => onOpenTask(task)}
                >
                  <td>
                    <strong className="data-table__title">{task.title}</strong>
                    {task.description && (
                      <p className="muted table-desc">{task.description}</p>
                    )}
                  </td>
                  {showProject && (
                    <td className="data-table__project">{task.project_name || '—'}</td>
                  )}
                  <td>
                    <AvatarStack assignees={assignees} />
                  </td>
                  <td>
                    <span className={`priority-badge ${PRIORITY_CLASS[task.priority] || ''}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`table-select status-pill ${STATUS_CLASS[task.status] || ''}`}
                      value={task.status}
                      onChange={(e) => onStatusChange(task, e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="data-table__date">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <div className="table-footer muted">
        Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}

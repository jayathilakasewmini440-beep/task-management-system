export default function ProductivityChart({
  tasks,
  title = 'Team Productivity',
  subtitle = 'Tasks created by day',
}) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = days.map((_, index) => {
    const dayIndex = (index + 1) % 7;
    return tasks.filter((task) => {
      if (!task.created_at) return false;
      const d = new Date(task.created_at);
      return d.getDay() === dayIndex;
    }).length;
  });
  const max = Math.max(...counts, 1);
  const totalThisWeek = counts.reduce((sum, n) => sum + n, 0);

  return (
    <section className="bento-card bento-card--chart">
      <header className="bento-card__header">
        <div>
          <h3>{title}</h3>
          <p className="muted">{subtitle}</p>
        </div>
        <span className="pill pill--soft">Last 7 days</span>
      </header>
      <div className="bar-chart" role="img" aria-label={`${title}: ${totalThisWeek} tasks created in the last 7 days`}>
        {days.map((label, i) => (
          <div key={label} className="bar-chart__col">
            <span className="bar-chart__value">{counts[i] || ''}</span>
            <div
              className="bar-chart__bar"
              style={{ height: `${(counts[i] / max) * 100}%` }}
              title={`${counts[i]} task${counts[i] === 1 ? '' : 's'}`}
            />
            <span className="bar-chart__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

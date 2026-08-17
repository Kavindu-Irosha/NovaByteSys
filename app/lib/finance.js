export const MEMBER_COUNT = 3;

/**
 * Calculates the split for each member given the total revenue.
 * @param {number} totalRevenue - The total revenue generated.
 * @param {number} totalExpenses - Optional expenses to deduct before splitting (e.g., subscriptions)
 * @returns {number} The split amount for a single member (rounded to 2 decimal places).
 */
export function calculateMemberSplit(totalRevenue, totalExpenses = 0) {
  const netProfit = totalRevenue - totalExpenses;
  return parseFloat((netProfit / MEMBER_COUNT).toFixed(2));
}

/**
 * Groups projects by a specific time frame (daily, weekly, monthly).
 * @param {Array} projects - Array of project objects with a `completedAt` timestamp.
 * @param {string} timeFrame - "daily", "weekly", or "monthly".
 * @returns {Array} Array of grouped data for Recharts.
 */
export function groupProjectsByTimeFrame(projects, timeFrame = "monthly") {
  const grouped = {};

  projects.forEach((project) => {
    // If completedAt is a Firestore Timestamp, convert it to Date. Otherwise it's already a Date.
    const date = project.completedAt?.toDate ? project.completedAt.toDate() : 
                 (project.completedAt ? new Date(project.completedAt) : new Date());
    
    let key;
    if (timeFrame === "monthly") {
      key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    } else if (timeFrame === "daily") {
      key = date.toLocaleDateString();
    } else if (timeFrame === "weekly") {
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      key = `Week of ${monday.toLocaleDateString()}`;
    }

    if (!grouped[key]) {
      grouped[key] = { name: key, totalRevenue: 0, count: 0 };
    }
    grouped[key].totalRevenue += (project.price || 0);
    grouped[key].count += 1;
  });

  return Object.values(grouped);
}

/**
 * Groups projects by their service category.
 * @param {Array} projects 
 * @returns {Array} Array of objects { service: string, count: number }
 */
export function groupProjectsByService(projects) {
  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.service]) {
      grouped[p.service] = { name: p.service, count: 0 };
    }
    grouped[p.service].count += 1;
  });
  return Object.values(grouped);
}

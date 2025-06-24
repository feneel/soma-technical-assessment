import { prisma } from "./prisma";

export async function checkCircularDependency(
  currentId: number,
  targetId: number
) {
  const dependencies = await prisma.taskDependency.findMany({
    where: { taskId: currentId },
  });

  for (const dep of dependencies) {
    if (dep.dependsOnId === targetId) return true;

    if (await checkCircularDependency(dep.dependsOnId, targetId)) {
      return true;
    }
    return false;
  }
}

export async function calculateSchedulingInfo() {
  const allTasks = await prisma.todo.findMany({
    include: {
      dependencies: { include: { dependsOn: true } },
      dependents: true,
    },
  });

  // Build graph
  const taskMap = new Map<number, any>();
  allTasks.forEach(task => taskMap.set(task.id, task));

  // Memoization
  const earliestStartMemo = new Map<number, Date>();
  const longestPathMemo = new Map<number, number>();

  function getLatestDueDate(deps: any[]): Date | null {
    const dates = deps.map((d) => d.dependsOn.dueDate).filter(Boolean);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(date => new Date(date).getTime())));
  }

  function getLongestPath(taskId: number): number {
    if (longestPathMemo.has(taskId)) return longestPathMemo.get(taskId)!;

    const task = taskMap.get(taskId);
    if (!task.dependencies.length) {
      longestPathMemo.set(taskId, 1);
      return 1;
    }

    const maxLength = Math.max(...task.dependencies.map(d =>
      getLongestPath(d.dependsOnId))) + 1;
    longestPathMemo.set(taskId, maxLength);
    return maxLength;
  }

  function computeEarliestStart(taskId: number): Date | null {
    if (earliestStartMemo.has(taskId)) return earliestStartMemo.get(taskId)!;

    const task = taskMap.get(taskId);
    const latest = getLatestDueDate(task.dependencies);
    if (latest) earliestStartMemo.set(taskId, latest);
    return latest;
  }

  // Compute all values
  let globalMax = 0;
  const taskPaths = new Map<number, number>();
  for (const task of allTasks) {
    const pathLen = getLongestPath(task.id);
    taskPaths.set(task.id, pathLen);
    globalMax = Math.max(globalMax, pathLen);
  }

  // Update database
  for (const task of allTasks) {
    const pathLen = taskPaths.get(task.id);
    const earliest = computeEarliestStart(task.id);

    await prisma.todo.update({
      where: { id: task.id },
      data: {
        earliestStart: earliest,
        isOnCriticalPath: pathLen === globalMax,
      },
    });
  }
}

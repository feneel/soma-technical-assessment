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

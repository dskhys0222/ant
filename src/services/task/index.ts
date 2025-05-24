import { getHost } from "@/services/host";
import { getUserKey } from "@/services/key";
import { getAccessToken } from "@/services/token";
import { decryptObject, encryptObject } from "@/utils/crypto";
import type { Task, TaskApiResult, TaskData, TaskDataWithId } from "./types";

export async function fetchTasks(): Promise<TaskApiResult<TaskDataWithId[]>> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      message: "No token",
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/auth/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const body = (await res.json()) as Task[];
      const data = await Promise.all(
        body.map(
          async (x): Promise<TaskDataWithId> => ({
            ...(await decryptObject<TaskData>(x.encryptedData, getUserKey())),
            _id: x._id,
          }),
        ),
      );
      return {
        success: true,
        status: res.status,
        data,
      };
    }
    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function createTask(
  task: TaskData,
): Promise<TaskApiResult<TaskData>> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      message: "No token",
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/auth/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        encryptedData: await encryptObject(task, getUserKey()),
      }),
    });

    if (res.ok) {
      return {
        success: true,
        status: res.status,
        data: task,
      };
    }
    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function updateTask(
  id: string,
  task: TaskData,
): Promise<TaskApiResult<TaskData>> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      message: "No token",
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/auth/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        encryptedData: await encryptObject(task, getUserKey()),
      }),
    });

    if (res.ok) {
      return {
        success: true,
        status: res.status,
        data: task,
      };
    }
    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function deleteTask(id: string): Promise<TaskApiResult<never>> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      message: "No token",
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/auth/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return {
        success: true,
        status: res.status,
      };
    }
    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

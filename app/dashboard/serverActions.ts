"use server";
import { revalidatePath } from "next/cache";

export async function createAMRAction(formData: FormData) {
  const name = formData.get("name");
  const battery = Number(formData.get("battery"));
  const location = formData.get("location");
  console.log("Creating AMR", { name, battery, location });
  revalidatePath("/dashboard");
}

export async function createTaskAction(formData: FormData) {
  const title = formData.get("title");
  const amrId = formData.get("amrId");
  const location = formData.get("location");
  console.log("Creating Task", { title, amrId, location });
  revalidatePath("/dashboard");
}

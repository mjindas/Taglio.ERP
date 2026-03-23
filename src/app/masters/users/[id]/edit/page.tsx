"use client";

import { useStore } from "@/store/useStore";
import UserForm from "@/components/UserForm";
import { useParams } from "next/navigation";

export default function EditUserPage() {
  const { id }   = useParams<{ id: string }>();
  const users    = useStore((s) => s.users);
  const user     = users.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  return (
    <UserForm
      mode="edit"
      userId={id}
      initialData={{
        username:     user.username,
        password:     user.password,
        email:        user.email,
        employeeCode: user.employeeCode,
        employeeName: user.employeeName,
        role:         user.role,
        smtp:         user.smtp,
        permissions:  user.permissions,
      }}
    />
  );
}

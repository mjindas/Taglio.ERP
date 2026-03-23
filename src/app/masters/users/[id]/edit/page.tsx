import UserEditClient from "./UserEditClient";

export function generateStaticParams() {
  return [{ id: 'U1' }];
}

export default function EditUserPage() {
  return <UserEditClient />;
}

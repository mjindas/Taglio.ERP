import ClientEditClient from "./ClientEditClient";

export function generateStaticParams() {
  return [{ id: 'C1' }];
}

export default function EditClientPage() {
  return <ClientEditClient />;
}

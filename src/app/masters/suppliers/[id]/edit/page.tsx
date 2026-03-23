import SupplierEditClient from "./SupplierEditClient";

export function generateStaticParams() {
  return [{ id: 'S1' }];
}

export default function EditSupplierPage() {
  return <SupplierEditClient />;
}

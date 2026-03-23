import ProductEditClient from "./ProductEditClient";

export function generateStaticParams() {
  return [{ id: 'P1' }, { id: 'P2' }];
}

export default function EditProductPage() {
  return <ProductEditClient />;
}

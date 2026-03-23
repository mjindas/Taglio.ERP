import QuotationViewClient from "./QuotationViewClient";

export function generateStaticParams() {
  return [{ id: 'Q1' }];
}

export default function QuotationViewPage() {
  return <QuotationViewClient />;
}

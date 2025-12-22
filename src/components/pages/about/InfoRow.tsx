import { SubBox } from "./aboutSection";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export default function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <SubBox className={className}>
      <span className="col-span-1 font-semibold">{label}</span>
      <span className="col-span-4">{value}</span>
    </SubBox>
  );
}

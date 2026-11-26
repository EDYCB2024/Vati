import BackofficeShell from "@/components/backoffice/BackofficeShell";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BackofficeShell>{children}</BackofficeShell>;
}

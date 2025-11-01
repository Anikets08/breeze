import { type PropsWithChildren } from "react";

export default function SectionTitle({ children }: PropsWithChildren) {
  return <h2 className="section-title">{children}</h2>;
}



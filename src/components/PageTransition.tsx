import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => (
  <div className="performance-page-enter">
    {children}
  </div>
);

export default PageTransition;

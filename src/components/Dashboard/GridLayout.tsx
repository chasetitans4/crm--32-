import React from 'react';

// Define Layout type locally
interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

// Simple fallback grid layout component
const ResponsiveGridLayout: React.FC<any> = ({ children, className, ...props }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {children}
    </div>
  );
};

interface GridLayoutProps {
  children: React.ReactNode;
  layouts: { [key: string]: Layout[] };
  onLayoutChange: (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => void;
}

const GridLayout: React.FC<GridLayoutProps> = ({ children, layouts, onLayoutChange }) => {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      onLayoutChange={(...args: any[]) => onLayoutChange(args[0], args[1])}
    >
      {children}
    </ResponsiveGridLayout>
  );
};

export default GridLayout;
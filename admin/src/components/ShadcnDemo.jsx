import React from 'react';
import { Button } from "@/components/ui/button";

const ShadcnDemo = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">shadcn/ui Components Demo</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12l-4-4h8l-4 4z"/>
            </svg>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Example</h3>
        <Button 
          onClick={() => alert('shadcn/ui Button clicked!')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Click Me!
        </Button>
      </div>
    </div>
  );
};

export default ShadcnDemo;
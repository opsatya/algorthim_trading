import React from 'react';
import Button from './Button';

const ButtonDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="space-x-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>

      <div className="space-x-4">
        <Button size="small">Small Button</Button>
        <Button size="default">Default Button</Button>
        <Button size="large">Large Button</Button>
      </div>

      <div className="space-x-4">
        <Button isLoading>Loading Button</Button>
        <Button disabled>Disabled Button</Button>
        <Button fullWidth>Full Width Button</Button>
      </div>
    </div>
  );
};

export default ButtonDemo;
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(element: React.ReactElement): void;
    unmount(): void;
  };
} 
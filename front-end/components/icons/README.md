# Icons

Centralized place for project icons.

## Usage

Import from the barrel file to keep imports consistent:

```tsx
import { SendIcon, ReceiveIcon } from '@/components/icons';

export function Example() {
  return (
    <div className="flex gap-2">
      <SendIcon size={20} />
      <ReceiveIcon size={20} className="text-green-600" />
    </div>
  );
}
```

## Conventions
- Icons are React components wrapping `lucide-react` icons.
- Shared props: `size` (number|string), `className` (string), `strokeWidth` (number).
- Export from `index.ts`.
- Prefer meaningful names ending with `Icon`.

## Adding a new icon
1. Create a new file in this folder, e.g., `Wallet.tsx`.
2. Import the Lucide icon and wrap it with the shared props interface.
3. Export it in `index.ts`.

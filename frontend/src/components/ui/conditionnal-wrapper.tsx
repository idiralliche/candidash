import { ReactNode } from 'react';

interface WrapProps {
  condition: boolean;
  with: (content: ReactNode) => ReactNode;
  prepend?: ReactNode;
  append?: ReactNode;
  children: ReactNode;
}

export function Wrap({
  condition: shouldWrap,
  with: wrapper,
  prepend,
  append,
  children,
}: WrapProps) {
  const content = (
    <>
      {prepend}
      {children}
      {append}
    </>
  );

  return shouldWrap ? wrapper(content) : content;
}

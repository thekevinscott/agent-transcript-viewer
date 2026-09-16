import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TranscriptBox } from './TranscriptBox';

describe('TranscriptBox', () => {
  it('displays the text it is given', () => {
    render(<TranscriptBox text="hello transcript" />);
    expect(screen.getByTestId('transcript-box')).toHaveTextContent('hello transcript');
  });

  it('renders on a black background', () => {
    render(<TranscriptBox text="x" />);
    expect(screen.getByTestId('transcript-box')).toHaveStyle({ background: 'black' });
  });

  it('preserves whitespace so JSON lines stay on their own line', () => {
    render(<TranscriptBox text={'a\nb'} />);
    expect(screen.getByTestId('transcript-box').textContent).toBe('a\nb');
  });
});

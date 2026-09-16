export interface TranscriptBoxProps {
  text: string;
}

export function TranscriptBox({ text }: TranscriptBoxProps) {
  return (
    <pre
      data-testid="transcript-box"
      style={{
        background: 'black',
        color: 'white',
        margin: 0,
        padding: '1rem',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
    </pre>
  );
}

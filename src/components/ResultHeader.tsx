import Button from "./Button";

interface ResultHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
}

export default function ResultHeader({ title, actionLabel, onAction }: ResultHeaderProps) {
  return (
    <div className="result-header">
      <h2 className="section-title">{title}</h2>
      {actionLabel ? (
        <Button variant="secondary" className="download-button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}



import Button from "./Button";

interface SourceBarProps {
  url: string;
  onRefresh: () => void | Promise<void>;
}

export default function SourceBar({ url, onRefresh }: SourceBarProps) {
  return (
    <div className="source-bar" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
      <span className="source-label" style={{ opacity: 0.8 }}>Source URL:</span>
      <span className="source-url" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{url || "(not detected)"}</span>
      <Button variant="ghost" className="refresh-button" style={{
        marginBottom:0
      }} onClick={onRefresh}>↻ Refresh</Button>
    </div>
  );
}



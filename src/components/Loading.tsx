interface LoadingProps {
  text: string;
  subtext?: string;
}

export default function Loading({ text, subtext = "This may take a moment" }: LoadingProps) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
      <p className="loading-subtext">{subtext}</p>
    </div>
  );
}



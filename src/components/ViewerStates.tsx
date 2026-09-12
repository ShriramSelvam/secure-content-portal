export function ViewerSkeleton() {
  return <div className="w-full aspect-video rounded-lg bg-line/50 animate-pulse" />;
}

export function ViewerError({ message }: { message: string }) {
  return (
    <div className="w-full rounded-lg border border-danger/30 bg-danger/5 p-6 text-sm text-danger">{message}</div>
  );
}

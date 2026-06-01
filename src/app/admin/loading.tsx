export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col gap-4 p-6">
      <div className="h-8 w-48 rounded bg-rosely-blush/50" />
      <div className="flex gap-4">
        <div className="h-10 w-32 rounded bg-rosely-blush/30" />
        <div className="h-10 w-32 rounded bg-rosely-blush/30" />
        <div className="h-10 w-32 rounded bg-rosely-blush/30" />
      </div>
      <div className="h-64 rounded bg-rosely-blush/30" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col gap-4 p-6">
      <div className="h-8 w-56 rounded bg-rosely-blush/50" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-lg bg-rosely-blush/30" />
        <div className="h-28 rounded-lg bg-rosely-blush/30" />
        <div className="h-28 rounded-lg bg-rosely-blush/30" />
      </div>
      <div className="h-48 rounded bg-rosely-blush/30" />
    </div>
  );
}

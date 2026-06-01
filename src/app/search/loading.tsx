export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col gap-4 p-6">
      <div className="h-8 w-48 rounded bg-rosely-blush/50" />
      <div className="h-10 w-full rounded bg-rosely-blush/30" />
      <div className="flex flex-col gap-3">
        <div className="h-16 rounded bg-rosely-blush/30" />
        <div className="h-16 rounded bg-rosely-blush/30" />
        <div className="h-16 rounded bg-rosely-blush/30" />
      </div>
    </div>
  );
}

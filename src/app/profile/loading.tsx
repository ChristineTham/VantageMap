export default function Loading() {
  return (
    <div className="animate-pulse flex flex-col gap-6 p-6">
      <div className="h-8 w-40 rounded bg-rosely-blush/50" />
      <div className="flex flex-col gap-4">
        <div className="h-20 rounded-lg bg-rosely-blush/30" />
        <div className="h-20 rounded-lg bg-rosely-blush/30" />
        <div className="h-20 rounded-lg bg-rosely-blush/30" />
      </div>
    </div>
  );
}

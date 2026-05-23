export default function BoardLoading() {
  return (
    <>
      <div className="border-border bg-background mb-4 h-[120px] animate-pulse rounded-lg border" />
      <div className="bg-background border-border grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_300px]">
        <div className="border-border space-y-3 border-r p-4">
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-border space-y-2 border-b py-3">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-3 p-5">
          <div className="bg-muted h-6 w-2/3 animate-pulse rounded" />
          <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
        </div>
      </div>
    </>
  );
}

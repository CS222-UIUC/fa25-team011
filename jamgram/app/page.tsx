export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Image Upload</h2>
        <p className="mt-2 text-sm text-neutral-300">
          Add a picture to get the perfect track tailored to your taste.
        </p>
      </section>
      <section className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="mt-2 text-sm text-neutral-300">
          Tailor and/or tweak recommendations here. 
        </p>
      </section>
    </div>
  );
}

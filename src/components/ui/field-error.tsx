export function FieldError({ id, message }: { id: string; message: string | null }) {
  return (
    <p id={id} role={message ? "alert" : undefined} className="mt-2 text-sm text-rose-700">
      {message}
    </p>
  );
}

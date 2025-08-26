// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige permanentemente a la página de proyectos, que es el nuevo punto de partida.
  redirect('/proyecto');

  // El resto del código no es necesario, ya que la redirección ocurre en el servidor.
  // Se puede dejar un return null por si acaso.
  return null;
}
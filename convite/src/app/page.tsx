import { redirect } from "next/navigation";

// Provisional: la landing pública llega después. El middleware envía a /login si no hay sesión.
export default function HomePage() {
  redirect("/dashboard");
}

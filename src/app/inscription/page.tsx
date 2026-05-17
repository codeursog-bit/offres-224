import { Suspense } from "react";
import InscriptionClient from "./InscriptionClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InscriptionClient />
    </Suspense>
  );
}
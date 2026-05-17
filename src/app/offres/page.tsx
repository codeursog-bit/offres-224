import { Suspense } from "react";
import OffresClient from "./OffresClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OffresClient />
    </Suspense>
  );
}
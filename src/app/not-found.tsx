import { MinimalFooter } from "@/components/footer";
import { Header } from "@/components/header";
import { NotFoundBody } from "@/components/not-found-body";

export default function NotFound() {
  return (
    <>
      <Header accountUrl={null} minimal />
      <main className="flex flex-1 flex-col">
        <NotFoundBody />
      </main>
      <MinimalFooter />
    </>
  );
}

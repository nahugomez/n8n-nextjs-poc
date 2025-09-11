import { PromptBox } from "@/components/prompt-input/prompt-input";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <div className="flex flex-col gap-10 w-full max-w-xl">
          <p className="text-3xl text-center text-white">
            ¿En qué puedo ayudarte?
        </p>
          <PromptBox />
      </div>
    </div>
  );
}

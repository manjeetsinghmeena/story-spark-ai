import React from "react";

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

const AuthLayout = ({ children, title, subtitle }: Props) => {
  return (
    <div className="flex min-h-screen flex-row">
      {/* Left Branding Section */}
      <div className="bg-slate-900 dark:bg-zinc-900 flex min-h-screen w-[35%] flex-col justify-center gap-8 p-8 border-r border-slate-200 dark:border-zinc-800 transition-colors duration-300">
        <a href="/">
          {/* Fixed: Replaced bg-linear-to-r with bg-gradient-to-r */}
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-400">
            StorySparkAI
          </h1>
        </a>

        <div>
          <h1 className="text-3xl text-white dark:text-gray-100 font-bold">{title}</h1>
          <p className="mt-2 text-slate-400 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="bg-white dark:bg-black flex flex-1 items-center justify-center p-6 md:w-[65%] md:p-8 transition-colors duration-300">
        <div className="w-full max-w-md py-8 md:py-0">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
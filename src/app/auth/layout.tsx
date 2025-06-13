
import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
           <Image src="https://placehold.co/150x50.png?text=MySiakad" alt="MySiakad Logo" width={150} height={50} data-ai-hint="logo education" />
        </div>
        {children}
      </div>
    </div>
  );
}

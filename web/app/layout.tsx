import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-bg text-text">
                <header className="sticky top-0 z-10 border-b border-border bg-gradient-to-b from-[#0f1630] to-bg">
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        <h1 className="text-xl tracking-wide">MeaningMaker</h1>
                        <p className="text-subtext text-sm">LLM-powered manuscript evaluation with verifiable citations</p>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
            </body>
        </html>
    );
}


